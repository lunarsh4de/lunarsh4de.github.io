import sanitizeHtml from 'sanitize-html';
import { createHash } from 'node:crypto';

export function articleUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'mp.weixin.qq.com' || url.username || url.password || url.port) throw new Error('Article source must be an HTTPS mp.weixin.qq.com URL.');
  if (!/^\/s(?:\/|$)/.test(url.pathname)) throw new Error('Expected a WeChat article link.');
  for (const key of [...url.searchParams.keys()]) if (!['__biz', 'mid', 'idx', 'sn'].includes(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.hash = '';
  return url.href;
}

export function imageUrl(value) {
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (!['http:', 'https:'].includes(url.protocol) || !['mmbiz.qpic.cn', 'mmbiz.qlogo.cn'].includes(url.hostname) || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    url.hash = '';
    return url.href;
  } catch { return null; }
}

export const articleSlug = (url) => `wechat-${createHash('sha256').update(articleUrl(url)).digest('hex').slice(0, 16)}`;

export function cleanArticleHtml(html) {
  return sanitizeHtml(String(html), {
    allowedTags: ['section', 'div', 'p', 'br', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 's', 'del', 'u', 'span', 'a', 'blockquote', 'pre', 'code', 'hr', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'loading', 'decoding', 'referrerpolicy'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] },
    allowedSchemes: ['https', 'http', 'mailto'], allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (tagName, attrs) => ({ tagName, attribs: { href: attrs.href || '', target: '_blank', rel: 'noopener noreferrer' } }),
      img: (tagName, attrs) => {
        const source = attrs['data-src'] || attrs.src || '';
        const local = /^\/images\/wechat\/[a-f0-9]{24}\.webp$/.test(source);
        return { tagName, attribs: { src: local ? source : imageUrl(source) || '', alt: attrs.alt || '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' } };
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  });
}

export function plainText(html) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function validateArticle(article) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(article.slug)) throw new Error('Invalid article slug.');
  articleUrl(article.sourceUrl);
  if (!article.title?.trim() || !Number.isFinite(Date.parse(article.publishedAt)) || !plainText(article.contentHtml).trim()) throw new Error('Article needs a title, publication date and body.');
  return article;
}
