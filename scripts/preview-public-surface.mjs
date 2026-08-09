import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verifyMode = process.argv.includes('--verify');
const requestedPort = Number(process.env.PUBLIC_PREVIEW_PORT ?? (verifyMode ? 0 : 4173));
const host = process.env.PUBLIC_PREVIEW_HOST ?? '127.0.0.1';

const files = new Map([
  ['/', resolve(rootDir, 'deploy/anlan/index.html')],
  ['/demo/', resolve(rootDir, 'deploy/anlan/demo/index.html')],
  ['/demo/frontend/', resolve(rootDir, 'deploy/anlan/demo/frontend/index.html')]
]);

const openApiDocument = {
  openapi: '3.1.0',
  info: { title: 'PulseBoard API', version: '0.1.0' },
  paths: {
    '/demo/health/live': { get: { responses: { 200: { description: 'Live' } } } },
    '/demo/health/ready': { get: { responses: { 200: { description: 'Ready' } } } },
    '/demo/api/v1/api-keys': { get: { responses: { 401: { description: 'Unauthorized' } } } },
    '/demo/api/v1/workspaces': { get: { responses: { 401: { description: 'Unauthorized' } } } }
  }
};

function send(response, status, contentType, body, headers = {}) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': contentType,
    ...headers
  });
  response.end(body);
}

function redirect(response, location, status = 301) {
  send(response, status, 'text/plain; charset=utf-8', 'Redirecting', { location });
}

function studyShell(name) {
  return '<!doctype html><html><head><title>' + name + '</title></head><body><main id="flutter-app">flutter preview shell</main></body></html>';
}

async function handle(request, response) {
  const url = new URL(request.url ?? '/', 'http://' + (request.headers.host ?? 'localhost'));
  const path = url.pathname;

  if (path === '/demo') return redirect(response, '/demo/');
  if (path === '/heatstack') return redirect(response, '/heatstack/');
  if (path === '/jobs') return redirect(response, '/jobs/', 308);
  if (path === '/jobs/') return redirect(response, '/jobs/login', 303);
  if (path === '/demo/frontend') return redirect(response, '/demo/frontend/');
  if (path === '/frontend' || path === '/frontend/') return redirect(response, '/demo/frontend/');
  if (path === '/docs') return redirect(response, '/demo/docs');
  if (path === '/openapi.json') return redirect(response, '/demo/openapi.json');
  if (path.startsWith('/health/')) return redirect(response, '/demo' + path);
  if (path === '/v1' || path.startsWith('/v1/')) return redirect(response, '/demo/api' + path);

  const file = files.get(path);
  if (file) {
    const html = await readFile(file, 'utf8');
    return send(response, 200, 'text/html; charset=utf-8', html);
  }

  if (path === '/demo/health/live') {
    return send(response, 200, 'application/json; charset=utf-8', JSON.stringify({ status: 'ok' }));
  }
  if (path === '/demo/health/ready') {
    return send(response, 200, 'application/json; charset=utf-8', JSON.stringify({ status: 'ready' }));
  }
  if (path === '/demo/openapi.json') {
    return send(response, 200, 'application/json; charset=utf-8', JSON.stringify(openApiDocument));
  }
  if (path === '/demo/docs') {
    const html = '<!doctype html><html><head><title>PulseBoard API</title></head><body><script id="api-reference" data-url="/demo/openapi.json"></script></body></html>';
    return send(response, 200, 'text/html; charset=utf-8', html);
  }
  if (path === '/demo/api/v1/workspaces') {
    return send(response, 401, 'application/json; charset=utf-8', JSON.stringify({ error: 'unauthorized' }));
  }
  if (path === '/heatstack/') {
    const html = '<!doctype html><html lang="zh-CN"><head><title>AI 热栈 HeatStack</title></head><body><main><strong>HeatStack</strong><span>AI 热栈</span></main></body></html>';
    return send(response, 200, 'text/html; charset=utf-8', html);
  }
  if (path === '/jobs/login') {
    const html = '<!doctype html><html lang="en" data-base-path="/jobs"><head><title>Career Radar</title></head><body><main>Invite-only Career Radar login shell</main></body></html>';
    return send(response, 200, 'text/html; charset=utf-8', html);
  }
  if (path === '/saa/' || path === '/sap/' || path === '/ispm/') {
    return send(response, 200, 'text/html; charset=utf-8', studyShell(path.slice(1, -1).toUpperCase()));
  }

  send(response, 404, 'text/plain; charset=utf-8', 'Not found');
}

const server = createServer((request, response) => {
  handle(request, response).catch((error) => {
    console.error(error);
    send(response, 500, 'text/plain; charset=utf-8', 'Preview server error');
  });
});

server.listen(requestedPort, host, () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : requestedPort;
  const baseUrl = 'http://' + host + ':' + port;
  console.log('Anlan public preview: ' + baseUrl);

  if (!verifyMode) return;

  const child = spawn(process.execPath, [resolve(rootDir, 'scripts/verify-public-surface.mjs')], {
    cwd: rootDir,
    env: { ...process.env, PUBLIC_BASE_URL: baseUrl },
    stdio: 'inherit'
  });
  child.on('exit', (code) => {
    server.close(() => {
      process.exitCode = code ?? 1;
    });
  });
});
