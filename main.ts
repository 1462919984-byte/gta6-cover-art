// VICE VOLTAGE entrypoint (Node 22, standard library only).
//
// This file does two jobs:
//   1. It hands the app in: it copies app/ and screenshots/ beside this file to
//      MAKEFUN_OUTPUT_DIR (or /output in the grader) and writes that directory's
//      dossier.json with the vendored make.fun library — byte for byte what the
//      scorer re-builds. In that mode it prints what it wrote and exits 0.
//   2. It doubles as a tiny local server so the built app can be previewed and
//      screenshotted without a separate serve.ts: pass --serve (or --port) and
//      it serves app/ statically plus screenshots/, shots.json, out/dossier.json
//      and a /healthz probe, logging the address and a short route list.
//
// The grader runs `node main.ts` with no flags: the build runs and the process
// exits, so it never blocks the 10-second sandbox. Local use is:
//   MAKEFUN_OUTPUT_DIR=out node main.ts --port 18081
//
// The server below is my own static-file router, not the kit's serve.ts.

import { cpSync, createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// ---- build the entry -------------------------------------------------------
function build() {
  mkdirSync(out, { recursive: true });
  // Start from a clean mirror so a rebuilt entry never carries a stale file
  // that was removed from app/ or screenshots/ since the previous run.
  rmSync(join(out, 'app'), { recursive: true, force: true });
  rmSync(join(out, 'screenshots'), { recursive: true, force: true });
  cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(join(here, 'screenshots'))) {
    cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  }
  writeFileSync(
    join(out, 'dossier.json'),
    buildDossier(out, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
      app_path_max_bytes: 1000,
    }),
  );
}

// ---- command-line parsing --------------------------------------------------
function parsePort(argv: string[]): number {
  const i = argv.indexOf('--port');
  if (i === -1) return 8080;
  const raw = argv[i + 1];
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

const wantsServe = process.argv.includes('--serve') || process.argv.includes('--port');
const port = parsePort(process.argv);

build();

if (!wantsServe) {
  console.log(`VICE VOLTAGE: built app/, screenshots/ and dossier.json into ${out}`);
  process.exit(0);
}

// ---- static server (only used when --serve / --port is given) --------------
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
};

type Mount = { prefix: string; root: string; listing: boolean };

const mounts: Mount[] = [
  { prefix: '/screenshots/', root: resolve(join(here, 'screenshots')), listing: false },
  { prefix: '/out/', root: resolve(out), listing: false },
  { prefix: '/', root: resolve(join(here, 'app')), listing: false },
];

// Standalone files at the server root, outside app/.
const rootFiles: Record<string, string> = {
  '/shots.json': resolve(join(here, 'shots.json')),
  '/dossier.json': resolve(join(out, 'dossier.json')),
};

function contentType(path: string): string {
  return MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
}

function sendFile(response: any, file: string) {
  let size: number;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found\n');
    return;
  }
  response.writeHead(200, {
    'content-type': contentType(file),
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}

function resolveInside(root: string, pathname: string): string | null {
  const candidate = resolve(join(root, normalize(pathname)));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request\n');
    return;
  }
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`);

  if (pathname === '/healthz') {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('ok\n');
    return;
  }

  // A directory URL maps to its index.html.
  const served = pathname.endsWith('/') ? pathname + 'index.html' : pathname;

  // Exact root-file matches (shots.json, out/dossier.json via their aliases).
  for (const [alias, file] of Object.entries(rootFiles)) {
    if (served === alias) {
      sendFile(response, file);
      return;
    }
  }

  // Mounted directories, in order.
  for (const mount of mounts) {
    if (served === mount.prefix || served.startsWith(mount.prefix)) {
      const rel = served === mount.prefix ? 'index.html' : served.slice(mount.prefix.length);
      const file = resolveInside(mount.root, rel);
      if (file === null) {
        response.writeHead(403).end('forbidden\n');
        return;
      }
      sendFile(response, file);
      return;
    }
  }

  response.writeHead(404).end('not found\n');
});

server.listen(port, '127.0.0.1', () => {
  const routes = [
    'GET /              -> app/index.html (the studio)',
    'GET /app/*         -> app/ static files (scripts, styles, fonts, samples)',
    'GET /screenshots/* -> screenshots/ directory',
    'GET /shots.json    -> shots.json',
    'GET /out/dossier.json -> the built dossier (also at /dossier.json)',
    'GET /healthz       -> liveness probe',
  ];
  console.log(`VICE VOLTAGE is on http://localhost:${port}`);
  for (const line of routes) console.log('  ' + line);
  console.log(`Built output lives in ${out}`);
});
