import { articles, wechat } from '../../data/wechat';
import type { APIRoute } from 'astro';

// Static public feed. Token exchange only runs in the private sync environment.
export const GET: APIRoute = () => new Response(JSON.stringify({
  schemaVersion: 1, accountName: wechat.accountName, lastSyncedAt: wechat.lastSyncedAt,
  articles: articles.map(({ contentHtml, ...article }) => ({ ...article, path: `/notes/${article.slug}/` })),
}), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
