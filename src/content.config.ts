import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  projects: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/projects', generateId: ({ entry }) => entry.replace(/\.md$/, '') }) }),
};
