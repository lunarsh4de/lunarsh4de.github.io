import editableSite from './site.json';
import editableLayout from './layout.json';
import evidenceNote from './notes/why-a-product-portfolio-needs-evidence.json';
import glbNote from './notes/preparing-a-glb-for-the-web.json';
import cmfNote from './notes/cmf-is-a-product-strategy.json';

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  short: string;
  intro: string;
  color: string;
  model?: string;
  hero: string;
  image?: string;
  subtitle?: string;
  sourcePages?: number[];
  facts: Array<{ label: string; value: string }>;
  sections: Array<{ eyebrow: string; title: string; body: string }>;
};

export const site = {
  name: editableSite.name,
  role: editableSite.role,
  location: editableSite.location,
  email: editableSite.email,
  statement: editableSite.statement,
  profile: {
    headline: { en: editableSite.profileHeadlineEn, cn: editableSite.profileHeadlineCn },
    body: { en: editableSite.profileBodyEn, cn: editableSite.profileBodyCn },
    focus: { en: editableSite.profileFocusEn, cn: editableSite.profileFocusCn },
    principle: { en: editableSite.profilePrincipleEn, cn: editableSite.profilePrincipleCn },
  },
};

const projectFiles = import.meta.glob<Project>('./projects/*.json', { eager: true, import: 'default' });
export const projects: Project[] = Object.keys(projectFiles).sort().map((path) => projectFiles[path]);
export const notes = [evidenceNote, glbNote, cmfNote];
type TileLayout = { visible: boolean; columns: number; rows: number };
const tileSource = editableLayout.homepage.projectLayout as Record<string, TileLayout>;
export const layout = {
  version: 1,
  homepage: {
    projectOrder: [...new Set([...editableLayout.homepage.projectOrder, ...projects.map((project) => project.slug)])],
    projectLayout: Object.fromEntries(projects.map(({ slug }) => {
      const tile = tileSource[slug];
      return [slug, { visible: tile?.visible !== false, columns: tile?.columns === 2 ? 2 : 1, rows: tile?.rows === 2 ? 2 : 1 }];
    })) as Record<string, TileLayout>,
  },
};

export const homeProjects = layout.homepage.projectOrder
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project))
  .filter((project) => layout.homepage.projectLayout[project.slug]?.visible !== false);

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const getNote = (slug: string) => notes.find((note) => note.slug === slug);
