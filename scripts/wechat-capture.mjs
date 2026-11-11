import { articleUrl, articleSlug, validateArticle } from './wechat-content.mjs';

// Browser capture reads only the visible public article, never account cookies.
export function captureToArticle(capture, previous) {
  if (capture.account?.trim() !== previous.accountName) throw new Error('Public article belongs to a different account.');
  if (!capture.title?.trim() || !capture.contentHtml?.trim()) throw new Error('Public article is unavailable or has no body.');
  const match = capture.publishedLabel?.trim().match(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error('Read the complete publication date from the public article before importing.');
  const [, year, month, day, hour, minute] = match;
  const datePart = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  const publishedAt = `${datePart}T${hour.padStart(2,'0')}:${minute}:00+08:00`;
  const timestamp = Date.parse(publishedAt);
  // Date.parse normalizes impossible dates such as February 30; reject those.
  if (!Number.isFinite(timestamp) || new Date(timestamp + 8*3600*1000).toISOString().slice(0,16) !== publishedAt.slice(0,16)) throw new Error('Invalid public article publication date.');
  const sourceUrl = articleUrl(capture.sourceUrl);
  const title = capture.title.trim();
  const old = previous.articles.find(a => articleUrl(a.sourceUrl) === sourceUrl || (a.title === title && Date.parse(a.publishedAt) === timestamp));
  return validateArticle({
    slug: old?.slug || articleSlug(sourceUrl), title, author: capture.author?.trim() || '',
    publishedAt, sourceUrl, excerpt: capture.excerpt?.trim() || '',
    cover: capture.cover || '', contentHtml: capture.contentHtml,
  });
}
