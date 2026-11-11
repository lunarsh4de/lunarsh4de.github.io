import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { articleUrl, cleanArticleHtml } from './wechat-content.mjs';
import { syncWechat } from './sync-wechat.mjs';
import { captureToArticle } from './wechat-capture.mjs';

test('public article captures verify account/date and reuse the original short-link route', () => {
  const previous = { accountName:'设计有AI', articles:[{slug:'existing-route',title:'同一篇文章',sourceUrl:'https://mp.weixin.qq.com/s/short',publishedAt:'2026-06-23T08:30:00+08:00'}] };
  const capture = { account:'设计有AI',title:'同一篇文章',author:'作者',publishedLabel:'2026年6月23日 08:30',sourceUrl:'https://mp.weixin.qq.com/s?__biz=abc&mid=123&idx=1&sn=test',contentHtml:'<p>真实正文</p>' };
  assert.equal(captureToArticle(capture,previous).slug,'existing-route');
  assert.equal(captureToArticle(capture,previous).publishedAt,'2026-06-23T08:30:00+08:00');
  assert.throws(()=>captureToArticle({...capture,account:'其他公众号'},previous),/different account/);
  assert.throws(()=>captureToArticle({...capture,publishedLabel:'2026年2月30日 08:30'},previous),/Invalid/);
  assert.throws(()=>captureToArticle({...capture,publishedLabel:''},previous),/publication date/);
  assert.throws(()=>captureToArticle({...capture,contentHtml:''},previous),/unavailable/);
});

test('untrusted HTML is stripped while article formatting and lazy images survive', () => {
  const safe = cleanArticleHtml('<h1>T</h1><script>alert(1)</script><iframe src="https://evil.test"></iframe><p style="width:9000px" onclick="evil()">正文</p><a href="javascript:evil()">x</a><img data-src="https://mmbiz.qpic.cn/a.png" src="data:bad" onerror="evil()"><img src="https://evil.test/track">');
  assert.match(safe, /<h2>T<\/h2>/);
  assert.match(safe, /src="https:\/\/mmbiz.qpic.cn\/a.png"/);
  assert.match(safe, /noopener noreferrer/);
  assert.doesNotMatch(safe, /script|iframe|onclick|onerror|style=|evil\.test|data:bad/);
  assert.equal(articleUrl('https://mp.weixin.qq.com/s/abc?scene=1&click_id=2'), 'https://mp.weixin.qq.com/s/abc');
  assert.equal(articleUrl('http://mp.weixin.qq.com/s/abc?scene=1'), 'https://mp.weixin.qq.com/s/abc');
  assert.throws(() => articleUrl('https://mp.weixin.qq.com.evil.test/s/abc'));
});

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-wechat-'));
  t.after(() => rm(directory, {recursive: true, force: true}));
  const dataPath = join(directory, 'wechat.json');
  const mediaRoot = join(directory, 'images');
  await writeFile(dataPath, JSON.stringify({schemaVersion:1, accountName:'设计有AI', lastSyncedAt:null, articles:[]}));
  return {directory, dataPath, mediaRoot};
}

function fakeToken(t) {
  const old = process.env.WECHAT_ACCESS_TOKEN;
  process.env.WECHAT_ACCESS_TOKEN = 'unit-test-token';
  t.after(() => { if (old === undefined) delete process.env.WECHAT_ACCESS_TOKEN; else process.env.WECHAT_ACCESS_TOKEN = old; });
}

function batchItem(n, articles = 1) {
  return {content:{create_time:1750000000+n, update_time:1760000000, news_item:Array.from({length:articles}, (_,i) => ({title:`文章 ${n}-${i}`, url:`https://mp.weixin.qq.com/s/article-${n}-${i}`, author:'作者', digest:'摘要', content:'<p>已发表正文</p>'}))}};
}

test('published API pagination imports all items and multi-article entries idempotently', async (t) => {
  const paths = await fixture(t);
  fakeToken(t);
  const offsets = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).pathname, '/cgi-bin/freepublish/batchget');
    const payload = JSON.parse(options.body);
    offsets.push(payload.offset);
    assert.equal(payload.no_content, 0);
    const item = payload.offset === 0 ? Array.from({length:20}, (_,i) => batchItem(i, i === 0 ? 2 : 1)) : [batchItem(20)];
    return Response.json({total_count:21, item_count:item.length, item});
  });
  const first = await syncWechat(paths);
  assert.equal(first.count, 22);
  assert.deepEqual(offsets, [0,20]);
  const snapshot = await readFile(paths.dataPath, 'utf8');
  const saved = JSON.parse(snapshot);
  assert.equal(saved.articles[0].publishedAt, new Date(1750000020*1000).toISOString());
  assert.equal((await syncWechat(paths)).changed, false);
  assert.equal(await readFile(paths.dataPath, 'utf8'), snapshot);
});

test('permission errors and malformed pagination preserve the previous archive', async (t) => {
  const paths = await fixture(t);
  fakeToken(t);
  const snapshot = await readFile(paths.dataPath, 'utf8');
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({errcode:48001, errmsg:'untrusted token text'}));
  await assert.rejects(syncWechat(paths), /48001/);
  assert.equal(await readFile(paths.dataPath, 'utf8'), snapshot);
  fetchMock.mock.mockImplementation(async () => Response.json({total_count:10, item_count:0, item:[]}));
  await assert.rejects(syncWechat(paths), /pagination stopped early/);
  assert.equal(await readFile(paths.dataPath, 'utf8'), snapshot);
});

test('images are decoded and mirrored, a failed import leaves article data intact', async (t) => {
  const paths = await fixture(t);
  const png = await sharp({create:{width:32,height:24,channels:3,background:'#436148'}}).png().toBuffer();
  const imageFetch = t.mock.method(globalThis, 'fetch', async () => new Response(png));
  const article = {slug:'real-article', title:'文章', author:'作者', publishedAt:'2026-06-23T08:30:00+08:00', sourceUrl:'https://mp.weixin.qq.com/s/article', excerpt:'摘要', cover:'', contentHtml:'<p>正文</p><img data-src="https://mmbiz.qpic.cn/image.png">'};
  const importPath = join(paths.directory, 'import.json');
  await writeFile(importPath, JSON.stringify([article]));
  await syncWechat({...paths, importPath});
  const snapshot = await readFile(paths.dataPath, 'utf8');
  assert.match(JSON.parse(snapshot).articles[0].contentHtml, /\/images\/wechat\/[a-f0-9]{24}\.webp/);
  const [filename] = await readdir(paths.mediaRoot);
  const metadata = await sharp(await readFile(join(paths.mediaRoot, filename))).metadata();
  assert.equal(metadata.width, 32);
  assert.equal(metadata.height, 24);
  imageFetch.mock.mockImplementation(async () => new Response('not an image'));
  await writeFile(importPath, JSON.stringify([{...article, contentHtml:'<p>new</p><img src="https://mmbiz.qpic.cn/broken.png">'}]));
  await assert.rejects(syncWechat({...paths, importPath}));
  assert.equal(await readFile(paths.dataPath, 'utf8'), snapshot);
});
