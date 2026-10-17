import { createServer } from 'node:http';
import { readFile, writeFile, readdir, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const editorFile = join(root, 'composer', 'index.html');
const layoutFile = join(root, 'src', 'data', 'layout.json');
const projectsDir = join(root, 'src', 'data', 'projects');
const port = Number(process.env.COMPOSER_PORT || 4325);
const origin = `http://127.0.0.1:${port}`;
let astro;
let previewUrl;
let saving = false;

const send = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
};

const readProjects = async () => {
  const names = (await readdir(projectsDir)).filter((name) => name.endsWith('.json')).sort();
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
    // Only the local editor may write files. Reject foreign origins and DNS rebinding.
    if (req.headers.host !== `127.0.0.1:${port}` || (req.headers.origin && req.headers.origin !== origin)) {
      send(res, 403, { error: 'Open the editor using its 127.0.0.1 address.' });
      return;
    }
    if (req.method === 'GET' && req.url === '/') {
      send(res, 200, await readFile(editorFile, 'utf8'), 'text/html; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && req.url === '/api/layout') {
      if (!previewUrl) { send(res, 503, { error: 'Preview is starting. Please reload in a moment.' }); return; }
      const projects = await readProjects();
      const layout = JSON.parse(await readFile(layoutFile, 'utf8'));
      send(res, 200, { layout: normalize(layout, projects.map((item) => item.slug)), projects, previewUrl });
      return;
    }
    if (req.method === 'POST' && req.url === '/api/layout') {
      if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') {
        send(res, 403, { error: 'Save from the local Composer page.' });
        return;
      }
      if (saving) { send(res, 409, { error: 'A save is already in progress.' }); return; }
      let body = '';
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 65536) { send(res, 413, { error: 'Layout payload is too large.' }); return; }
        body += chunk;
      }
      const input = JSON.parse(body);
      if (input.version !== 1 || !Array.isArray(input.homepage?.projectOrder) || !input.homepage?.projectLayout) {
        throw new Error('Invalid layout format.');
      }
      const projects = await readProjects();
      const layout = normalize(input, projects.map((item) => item.slug));
      if (saving) { send(res, 409, { error: 'A save is already in progress.' }); return; }
      saving = true;
      try {
        await writeFile(layoutFile + '.tmp', JSON.stringify(layout, null, 2) + '\n', 'utf8');
        await rename(layoutFile + '.tmp', layoutFile);
      } finally { saving = false; }
      send(res, 200, { ok: true, layout });
      return;
    }
    send(res, 404, { error: 'Not found' });
  } catch (error) {
    send(res, 400, { error: error instanceof Error ? error.message : 'Request failed' });
  }
});

const stop = async () => {
  server.close();
  astro?.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

try {
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', accept);
  });
  // Start this workspace directly; use the actual port if 4324 is already busy.
  astro = spawn(process.execPath, [join(root, 'node_modules', 'astro', 'astro.js'), 'dev', '--host', '127.0.0.1', '--port', '4324'], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  astro.stderr.on('data', (chunk) => process.stderr.write(chunk));
  astro.on('exit', (code) => { server.close(); process.exit(code ?? 0); });
  await new Promise((accept, reject) => {
    astro.once('error', reject);
    astro.once('exit', (code) => reject(new Error(`Astro stopped (${code}).`)));
    let output = '';
    astro.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      output = (output + chunk.toString()).slice(-4000);
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) { previewUrl = `http://127.0.0.1:${match[1]}/?skipIntro=1`; accept(); }
    });
  });
  console.log('Portfolio Composer: ' + origin);
  console.log('Astro preview:       ' + previewUrl);
} catch (error) {
  console.error('Could not start Composer:', error.message);
  server.close();
  astro?.kill();
  process.exit(1);
}
