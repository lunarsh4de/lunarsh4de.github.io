import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://lunarsh4de.github.io',
  build: { format: 'directory' }
});
