import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseFragment, serialize } from 'parse5';
import sharp from 'sharp';
import { articleUrl, articleSlug, cleanArticleHtml, imageUrl, plainText, validateArticle } from './wechat-content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'src/data/wechat.json');

async function fetchJson(url, options = {}) {
  let response;
  try { response = await fetch(url, { ...options, signal: AbortSignal.timeout(30_000), redirect: 'error' }); }
  catch { throw new Error('WeChat API network request failed (request URL withheld).'); }
  if (!response.ok) throw new Error(`WeChat API HTTP ${response.status} (request URL withheld).`);
  let data;
  try { data = await response.json(); } catch { throw new Error('WeChat API returned invalid JSON.'); }
  if (data.errcode) {
    const hints = {40164: 'Add this runner’s outbound IP to the Official Account IP whitelist.', 48001: 'This account does not have permission for the published-article API.', 40013: 'Check the AppID.', 40125: 'Check the AppSecret.', 40001: 'Invalid access token.', 42001: 'Access token expired.'};
    throw new Error(`WeChat API error ${data.errcode}. ${hints[data.errcode] || 'Check API permissions and limits in the Official Account console.'}`);
  }
  return data;
}

async function accessToken(configPath) {
  if (process.env.WECHAT_ACCESS_TOKEN) return process.env.WECHAT_ACCESS_TOKEN;
  let appid = process.env.WECHAT_APP_ID;
  let secret = process.env.WECHAT_APP_SECRET;
  if (configPath) {
    const config = JSON.parse((await readFile(configPath, 'utf8')).replace(/^\uFEFF/, ''));
    appid ||= config.app_id;
    secret ||= config.app_secret;
  }
  if (!appid || !secret) throw new Error('Set WECHAT_APP_ID and WECHAT_APP_SECRET, or pass --config with your existing private config.json.');
  const data = await fetchJson('https://api.weixin.qq.com/cgi-bin/stable_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credential', appid, secret, force_refresh: false }),
  });
  if (!data.access_token) throw new Error('WeChat returned no access token.');
  return data.access_token;
}

async function mirrorImage(source, mediaRoot) {
  if (/^\/images\/wechat\/[a-f0-9]{24}\.webp$/.test(source)) {
    const metadata = await sharp(await readFile(resolve(mediaRoot, source.split('/').pop()))).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Local article image cannot be decoded.');
    return source;
  }
  const url = imageUrl(source);
  if (!url) throw new Error('Unsupported article image host.');
  const filename = `${createHash('sha256').update(url).digest('hex').slice(0, 24)}.webp`;
  const destination = resolve(mediaRoot, filename);
  try {
    const metadata = await sharp(await readFile(destination)).metadata();
    if (metadata.width && metadata.height) return `/images/wechat/${filename}`;
  } catch { /* Download and validate a missing or damaged file. */ }
  let response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error', headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://mp.weixin.qq.com/' } }); }
  catch { throw new Error('Could not download a WeChat article image.'); }
  if (!response.ok) throw new Error(`WeChat image HTTP ${response.status}.`);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > 20 * 1024 * 1024) throw new Error('Article image exceeds the 20 MB limit.');
    chunks.push(chunk);
  }
  const converted = await sharp(Buffer.concat(chunks), { limitInputPixels: 40_000_000 }).rotate().webp({quality: 86}).toBuffer();
  const metadata = await sharp(converted).metadata();
  if (!metadata.width || !metadata.height) throw new Error('Article image cannot be decoded.');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, converted);
  return `/images/wechat/${filename}`;
}

async function prepareArticle(article, mediaRoot) {
  validateArticle(article);
  const tree = parseFragment(cleanArticleHtml(article.contentHtml));
  async function visit(node) {
    if (node.tagName === 'img') {
      const src = node.attrs.find((attr) => attr.name === 'src');
      if (src) src.value = await mirrorImage(src.value, mediaRoot);
    }
    for (const child of node.childNodes || []) await visit(child);
  }
  await visit(tree);
  return {
    slug: article.slug, title: article.title.trim(), author: article.author || '',
    publishedAt: article.publishedAt, sourceUrl: articleUrl(article.sourceUrl),
    excerpt: article.excerpt?.trim() || plainText(article.contentHtml).slice(0, 140),
    cover: article.cover ? await mirrorImage(article.cover, mediaRoot) : '',
    contentHtml: cleanArticleHtml(serialize(tree)),
  };
}

export async function syncWechat({ configPath, importPath, dataPath = output, mediaRoot = resolve(root, 'public/images/wechat') } = {}) {
  const previous = JSON.parse(await readFile(dataPath, 'utf8'));
  let incoming = [];
  if (importPath) {
    const imported = JSON.parse(await readFile(importPath, 'utf8'));
    incoming = Array.isArray(imported) ? imported : imported.articles;
    if (!Array.isArray(incoming) || !incoming.length) throw new Error('Import contains no articles.');
  } else {
    const token = await accessToken(configPath);
    for (let offset = 0, total = Infinity; offset < total;) {
      const page = await fetchJson(`https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offset, count: 20, no_content: 0 }),
      });
      if (!Number.isInteger(page.total_count) || !Number.isInteger(page.item_count) || !Array.isArray(page.item) || page.item_count !== page.item.length) throw new Error('Unexpected published-article response; existing content was preserved.');
      total = page.total_count;
      if (!page.item_count && offset < total) throw new Error('Published-article pagination stopped early.');
      for (const item of page.item) {
        if (!Array.isArray(item.content?.news_item)) throw new Error('WeChat returned an article without content.');
        for (const article of item.content.news_item) {
          const sourceUrl = articleUrl(article.url);
          if (!item.content.create_time) throw new Error('Published article has no publication timestamp.');
          const publishedAt = new Date(item.content.create_time * 1000).toISOString();
          const old = previous.articles.find((a) => articleUrl(a.sourceUrl) === sourceUrl || (a.title === article.title && new Date(a.publishedAt).getTime() === Date.parse(publishedAt)));
          incoming.push({ slug: old?.slug || articleSlug(sourceUrl), title: article.title, author: article.author, sourceUrl, publishedAt, excerpt: article.digest, cover: article.thumb_url, contentHtml: article.content });
        }
      }
      offset += page.item_count;
    }
  }
  const merged = new Map(previous.articles.map((article) => [article.slug, article]));
  for (const article of incoming) merged.set(article.slug, await prepareArticle(article, mediaRoot));
  const articles = [...merged.values()].sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug));
  const changed = JSON.stringify(articles) !== JSON.stringify(previous.articles);
  if (changed) {
    const next = { ...previous, articles, lastSyncedAt: new Date().toISOString() };
    await writeFile(`${dataPath}.tmp`, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    await rename(`${dataPath}.tmp`, dataPath);
  }
  console.log(`WeChat sync: ${incoming.length} published articles read; ${articles.length} stored; ${changed ? 'updated' : 'unchanged'}.`);
  return { changed, count: articles.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const configAt = args.indexOf('--config');
  const importAt = args.indexOf('--import');
  if ((configAt >= 0 && !args[configAt+1]) || (importAt >= 0 && !args[importAt+1])) throw new Error('Missing command argument.');
  syncWechat({ configPath: configAt < 0 ? undefined : args[configAt+1], importPath: importAt < 0 ? undefined : args[importAt+1] }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
