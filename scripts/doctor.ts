import { spawnSync } from 'node:child_process';

type Status = 'OK' | 'WARN' | 'FAIL';

interface Check {
  name: string;
  command: string;
  args: string[];
  required: boolean;
  hint?: string;
}

interface Result {
  name: string;
  status: Status;
  output: string;
  hint?: string;
}

const checks: Check[] = [
  { name: 'Node.js', command: 'node', args: ['--version'], required: true },
  { name: 'pnpm via Corepack', command: 'corepack', args: ['pnpm', '--version'], required: true },
  { name: 'Git', command: 'git', args: ['--version'], required: true },
  {
    name: 'Docker CLI',
    command: 'docker',
    args: ['--version'],
    required: false,
    hint: 'Install Docker Desktop or Docker Engine before running the compose stack.',
  },
  {
    name: 'Docker Compose',
    command: 'docker',
    args: ['compose', 'version'],
    required: false,
    hint: 'Docker Compose is required for local Postgres, Redis, API, and worker orchestration.',
  },
  {
    name: 'Docker daemon',
    command: 'docker',
    args: ['info', '--format', '{{.ServerVersion}} {{.OSType}}'],
    required: false,
    hint: 'If this fails in WSL, start Docker Engine or enable Docker Desktop WSL integration.',
  },
  {
    name: 'WSL',
    command: 'wsl.exe',
    args: ['--version'],
    required: false,
    hint: 'WSL is recommended for the local Linux-like development path on Windows.',
  },
  {
    name: 'Terraform CLI',
    command: 'terraform',
    args: ['version'],
    required: false,
    hint: 'Install Terraform before running the AWS Lightsail plan locally. GitHub CI still validates Terraform formatting and syntax.',
  },
  {
    name: 'AWS CLI',
    command: 'aws',
    args: ['--version'],
    required: false,
    hint: 'Install and configure AWS CLI only when you are ready to run an approved Terraform plan. Do not print credentials.',
  },
  {
    name: 'GitHub CLI',
    command: 'gh',
    args: ['--version'],
    required: false,
    hint: 'GitHub CLI is useful for checking CI, environments, and manual deployment workflows.',
  },
  {
    name: 'GitHub CLI auth',
    command: 'gh',
    args: ['auth', 'status'],
    required: false,
    hint: 'Authenticate GitHub CLI before managing repository environments or secrets.',
  },
];

function run(check: Check): Result {
  const result = process.platform === 'win32' ? runOnWindows(check) : runOnPosix(check);
  const output = normalizeOutput(`${result.stdout ?? ''}${result.stderr ?? ''}`);

  if (result.status === 0) {
    return { name: check.name, status: 'OK', output };
  }

  return {
    name: check.name,
    status: check.required ? 'FAIL' : 'WARN',
    output: output || `Command failed: ${formatCommand(check)}`,
    hint: check.hint,
  };
}

function runOnWindows(check: Check) {
  return spawnSync(formatCommand(check), {
    encoding: 'utf8',
    shell: true,
  });
}

function runOnPosix(check: Check) {
  return spawnSync(check.command, check.args, {
    encoding: 'utf8',
    shell: false,
  });
}

function formatCommand(check: Check) {
  return [check.command, ...check.args.map(quoteArg)].join(' ');
}

function quoteArg(arg: string) {
  if (!/[\s"'{}]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '\\"')}"`;
}

function normalizeOutput(output: string) {
  return output
    .replace(/\0/g, '')
    .replace(/Token:\s+\S+/gi, 'Token: <redacted>')
    .trim()
    .replace(/\s+/g, ' ');
}

function print(result: Result) {
  const label = result.status.padEnd(4);
  console.log(`[${label}] ${result.name}: ${result.output}`);
  if (result.hint) {
    console.log(`       ${result.hint}`);
  }
}

const results = checks.map(run);
for (const result of results) {
  print(result);
}

const failedRequired = results.filter((result) => result.status === 'FAIL');
const warnings = results.filter((result) => result.status === 'WARN');

console.log('');
console.log(`Summary: ${results.length - failedRequired.length - warnings.length} ok, ${warnings.length} warning(s), ${failedRequired.length} failure(s).`);

if (failedRequired.length > 0) {
  process.exit(1);
}
