import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const editorFile = join(root, 'composer', 'index.html');
const layoutFile = join(root, 'src', 'data', 'layout.json');
const projectsDir = join(root, 'src', 'data', 'projects');
const port = Number(process.env.COMPOSER_PORT || 4325);

const send = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
};

const readProjects = async () => {
  const names = ['aera-air.json', 'mori-lamp.json', 'care-kit.json'];
  return Promise.all(names.map(async (name) => JSON.parse(await readFile(join(projectsDir, name), 'utf8'))));
};

const normalize = (input, knownSlugs) => {
  const homepage = input?.homepage;
  const order = Array.isArray(homepage?.projectOrder) ? homepage.projectOrder.map(String) : [];
  const unique = [...new Set(order)].filter((slug) => knownSlugs.includes(slug));
  knownSlugs.forEach((slug) => { if (!unique.includes(slug)) unique.push(slug); });
  const source = homepage?.projectLayout || {};
  const projectLayout = Object.fromEntries(knownSlugs.map((slug) => {
    const item = source[slug] || {};
    return [slug, {
      visible: item.visible !== false,
      columns: Number(item.columns) === 2 ? 2 : 1,
      rows: Number(item.rows) === 2 ? 2 : 1,
    }];
  }));
  return { version: 1, homepage: { projectOrder: unique, projectLayout } };
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      send(res, 200, await readFile(editorFile, 'utf8'), 'text/html; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && req.url === '/api/layout') {
      const projects = await readProjects();
      const layout = JSON.parse(await readFile(layoutFile, 'utf8'));
      send(res, 200, { layout: normalize(layout, projects.map((item) => item.slug)), projects });
      return;
    }
    if (req.method === 'POST' && req.url === '/api/layout') {
      let body = '';
      for await (const chunk of req) body += chunk;
      if (body.length > 1000000) throw new Error('Layout payload is too large.');
      const projects = await readProjects();
      const layout = normalize(JSON.parse(body), projects.map((item) => item.slug));
      await writeFile(layoutFile, JSON.stringify(layout, null, 2) + '\n', 'utf8');
      send(res, 200, { ok: true, layout });
      return;
    }
    send(res, 404, { error: 'Not found' });
  } catch (error) {
    send(res, 400, { error: error instanceof Error ? error.message : 'Request failed' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('Portfolio Composer: http://127.0.0.1:' + port);
  console.log('Astro preview:       http://127.0.0.1:4324/?skipIntro=1');
});

// Spawning `npm.cmd` directly can return EINVAL in some Node 24 + PowerShell
// hosts. Calling npm's JS entry point through the current Node executable is
// equivalent and works consistently on Windows and Unix.
const npmCli = resolve(process.execPath, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js');
const astro = spawn(process.execPath, [npmCli, 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '4324'], {
  cwd: root,
  stdio: 'inherit',
  // `windowsHide` combined with inherited stdio can throw EINVAL in the
  // embedded PowerShell runtime. Keep the child attached so both logs and
  // shutdown behaviour stay predictable on Windows.
  windowsHide: false,
});

const stop = () => {
  astro.kill();
  server.close();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
