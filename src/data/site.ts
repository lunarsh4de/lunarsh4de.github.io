import editableSite from './site.json';
import aeraAir from './projects/aera-air.json';
import moriLamp from './projects/mori-lamp.json';
import careKit from './projects/care-kit.json';
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

export const projects: Project[] = [aeraAir, moriLamp, careKit];
export const notes = [evidenceNote, glbNote, cmfNote];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const getNote = (slug: string) => notes.find((note) => note.slug === slug);
