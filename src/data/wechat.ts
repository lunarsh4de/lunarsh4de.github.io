import archive from './wechat.json';
import publicSource from './wechat-source.json';
import editorial from './wechat-editorial.json';
import { cleanArticleHtml, validateArticle } from '../../scripts/wechat-content.mjs';

export const wechat = archive;
export const wechatSource = publicSource;
export const articles = archive.articles.map((article) => {
  validateArticle(article);
  const display = editorial[article.slug as keyof typeof editorial];
  // Require editorial review before new imports appear on the English website.
  if (!display) throw new Error(`Missing English Blog metadata for ${article.slug}`);
  return { ...article, display, displayCover: `/images/blog/${article.slug}.svg`, contentHtml: cleanArticleHtml(article.contentHtml) };
}).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function publicationDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
}
