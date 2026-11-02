import { chromium, expect } from '@playwright/test';
import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4331';
const output = 'output/qa/portfolio';
await mkdir(output, {recursive:true});
const projects = await Promise.all((await readdir('src/data/projects')).map(async (file) => JSON.parse(await readFile(`src/data/projects/${file}`, 'utf8'))));
let executablePath = process.env.PORTFOLIO_CHROMIUM || chromium.executablePath();
if (!process.env.PORTFOLIO_CHROMIUM) {
  try { await access(executablePath); }
  catch { throw new Error('Install Chromium with npx playwright install chromium, or set PORTFOLIO_CHROMIUM to an existing Chrome executable.'); }
}
const browser = await chromium.launch({headless:true, executablePath});
const errors = [];
const results = [];
try {
  const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  // Verify all generated routes, not just the new project pages.
  async function routes(directory = 'dist', prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes:true})) {
      if (entry.isDirectory()) await routes(`${directory}/${entry.name}`, `${prefix}/${entry.name}`);
      else if (entry.name.endsWith('.html')) {
        const route = entry.name === 'index.html' ? `${prefix}/` : `${prefix}/${entry.name}`;
        const response = await fetch(origin + route);
        assert.equal(response.status, 200, route);
        const html = await response.text();
        assert(!html.includes('\ufffd'), `Broken encoding: ${route}`);
        results.push({route,status:response.status});
      }
    }
  }
  await routes();
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:width<700?844:1000});
    for (const route of ['/', '/work/', ...projects.map((p)=>`/work/${p.slug}/`)]) {
      await page.goto(origin+route, {waitUntil:'domcontentloaded'});
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => img.loading = 'eager');
        await Promise.all([...document.images].filter((img)=>img.getAttribute('src')).map((img) => img.decode()));
      });
      const dimensions = await page.evaluate(() => ({view:innerWidth,scroll:document.documentElement.scrollWidth, lang:document.documentElement.lang}));
      assert(dimensions.scroll <= dimensions.view + 1, `Overflow at ${width}: ${route}: ${JSON.stringify(dimensions)}`);
      assert.equal(dimensions.lang, 'zh-CN');
      assert.equal(await page.locator('h1').count(),1);
      if (route !== '/' && route !== '/work/') {
        assert(await page.locator('.case-prose h2').count() >= 3, route);
        assert.equal(await page.locator('.case-toc ol a').count(),await page.locator('.case-prose h2').count());
        const image = page.locator('.case-prose [data-lightbox]').first();
        await image.click();
        await page.waitForSelector('dialog[open]');
        await page.locator('dialog img').evaluate((img)=>img.decode());
        await page.locator('[data-image-zoom]').click();
        assert.equal(await page.locator('[data-image-zoom]').getAttribute('aria-pressed'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('dialog[open]').count(),0);
        await expect(image).toBeFocused();
        assert.notEqual(await page.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');
        await page.locator('.case-toc ol a').last().click();
        const target = await page.locator('.case-prose h2').last().boundingBox();
        assert(target && target.y >= 0 && target.y < 300, `Chapter anchor position: ${route}`);
      }
      await page.evaluate(()=>scrollTo(0,0));
      await page.evaluate(async () => { await document.fonts.ready; await new Promise((resolve) => requestAnimationFrame(()=>requestAnimationFrame(resolve))); });
      if (width === 1440 || width === 390) {
        const name = route === '/' ? 'home' : route.replaceAll('/','-').replace(/^-|-$/g,'');
        await page.screenshot({path:`${output}/${name}-${width}.png`,fullPage:true,animations:'disabled'});
      }
      results.push({route,width,overflow:false});
    }
  }
  // Exercise Astro client navigation and re-initialisation repeatedly.
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/', {waitUntil:'domcontentloaded'});
  await page.locator('.portfolio-poster').first().click();
  await page.waitForURL('**/work/pipe-cleaning-robot/');
  await page.locator('.case-cover [data-lightbox]').click();
  await page.waitForSelector('dialog[open]');
  await page.locator('[data-image-close]').click();
  await page.locator('.next-project').click();
  await page.waitForURL('**/work/plant-ostomy/');
  await page.locator('.case-cover [data-lightbox]').click();
  await page.waitForSelector('dialog[open]');
  await page.keyboard.press('Escape');
  await page.goBack();
  await page.waitForURL('**/work/pipe-cleaning-robot/');
  await page.locator('.case-cover [data-lightbox]').click();
  await page.waitForSelector('dialog[open]');
  await page.keyboard.press('Escape');
  // Mobile navigation remains available on long project pages.
  await page.setViewportSize({width:390,height:844});
  await page.locator('.reference-menu').click();
  assert.equal(await page.locator('.reference-menu').getAttribute('aria-expanded'),'true');
  await page.locator('.reference-nav a[href="/about/"]').click();
  await page.waitForURL('**/about/');
  // Baseline content and original image links work without scripting.
  const baseline = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain = await baseline.newPage();
  await plain.goto(origin+'/work/plant-ostomy/',{waitUntil:'domcontentloaded'});
  assert((await plain.locator('.case-prose').innerText()).includes('护理需求'));
  assert((await plain.locator('.case-prose a[data-lightbox]').first().getAttribute('href')).endsWith('.webp'));
  assert.equal(errors.length,0,errors.join('\n'));
  await writeFile(`${output}/report.json`,JSON.stringify({passed:true,routeCount:13,results,clientNavigation:true,lightbox:true,noJavaScript:true,errors},null,2));
  console.log(`PASS: ${results.length} route/layout checks; image zoom, keyboard, anchors, client navigation, no-JS content. No local HTTP or JS errors.`);
} finally {
  await browser.close();
}
