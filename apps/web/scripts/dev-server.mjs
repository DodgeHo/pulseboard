import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const port = Number(process.env.WEB_PORT ?? 4173);

function build() {
  return new Promise((resolveBuild, rejectBuild) => {
    const child = spawn('corepack', ['pnpm', '--filter', '@pulseboard/web', 'build'], {
      cwd: resolve(root, '..', '..'),
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });
    child.on('exit', (code) => (code === 0 ? resolveBuild() : rejectBuild(new Error(`Build failed with ${code}`))));
  });
}

await build();

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://localhost:${port}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = resolve(root, 'dist', pathname.slice(1));
    const body = await readFile(file);
    const type = extname(file) === '.html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
    response.writeHead(200, { 'content-type': type });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`PulseBoard web preview: http://127.0.0.1:${port}`);
});
