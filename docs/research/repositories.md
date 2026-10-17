# Repository research

Research date: 2026-10-06. Sources were collected with the `agent-reach` GitHub development workflow using anonymous, read-only HTTPS shallow clones. No install scripts were run. The local clones are under `C:\Users\81489\.agent-reach\portfolio-references\repos`.

## Selected references

### `withastro/astro`

- Commit: `c5275e3d5a688a7d246c9576b594870675b70e37`
- Local path: `C:\Users\81489\.agent-reach\portfolio-references\repos\astro`
- License: MIT, confirmed in the root `LICENSE`.
- Relevant scope: `examples/portfolio`.
- Use: baseline Astro portfolio structure, static page composition, configuration, and asset organization.
- Limits: this is a framework monorepo and starter example, not a finished industrial-design portfolio. Treat example media as reference-only until individual rights are verified; the repository MIT license does not automatically license third-party assets.

### `Thinkmill/keystatic`

- Commit: `b8ec9650622c11e1d38e73fca3b64c17ec278d18`
- Local path: `C:\Users\81489\.agent-reach\portfolio-references\repos\keystatic`
- License: MIT, confirmed in the root `LICENSE` and README.
- Relevant scope: repository architecture, templates, and `dev-projects`.
- Use: optional reference for structured case-study content and a Git-backed CMS workflow.
- Limits: Keystatic is an experimental CMS/monorepo, not a visual portfolio template. Prefer documented integration points over copying development fixtures, and do not assume this repo is needed for a static-only build.

### `van-thurm/portfolio-kit`

- Commit: `339bcaba6f36c63c3fbd14099237e70db8c9b5ed`
- Local path: `C:\Users\81489\.agent-reach\portfolio-references\repos\portfolio-kit`
- License: MIT, confirmed in the root `LICENSE` and `package.json` (`MIT`). The initially proposed fallback `missionbuilt/missionbuilt-sitedesign` was therefore not needed.
- Relevant scope: Astro layouts, centralized data files, case-study conventions, and static deployment workflow.
- Use: reference for restrained editorial information architecture and reusable case-study structure.
- Limits: bundled fonts, screenshots, GIFs, and other project media remain subject to their own rights; MIT code licensing does not grant permission to reuse those assets. Cursor skills and project-specific content conventions are optional, not a dependency.

## Reuse decision

All three repositories are usable as code and architecture references under their stated MIT licenses, subject to preserving notices where required. This does **not** establish that every image, font, screenshot, demo asset, or external dependency is MIT-licensed or reusable. The target site should implement its own industrial-design content and verify asset rights separately.
