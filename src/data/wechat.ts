import archive from './wechat.json';
import publicSource from './wechat-source.json';
import { cleanArticleHtml, validateArticle } from '../../scripts/wechat-content.mjs';

export const wechat = archive;
export const wechatSource = publicSource;
export const articles = archive.articles.map((article) => {
  validateArticle(article);
  return { ...article, contentHtml: cleanArticleHtml(article.contentHtml) };
}).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function publicationDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)).replaceAll('/', '.');
}
