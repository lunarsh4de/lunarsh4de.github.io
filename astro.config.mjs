import { defineConfig } from 'astro/config';
import portfolioMarkdown from './scripts/portfolio-markdown.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://lunarsh4de.github.io',
  markdown: { rehypePlugins: [portfolioMarkdown] },
  build: { format: 'directory' }
});
