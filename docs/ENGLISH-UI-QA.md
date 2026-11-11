# English interface and usability review · 2026-11-11

The site uses English for navigation, page introductions, case studies, image captions and controls. WeChat articles retain their original Chinese text, titles and authors, with explicit language labels and `lang="zh-CN"` on those elements. Text embedded in original project images and article covers remains part of the source material.

Original Chinese project metadata and stories are preserved in `docs/original-content/`. English translations retain image order, section counts, concept status and validation limitations. They do not add test results or performance claims.

Changes:

- Removed the incomplete language switch and its persistent preference handling. The old toggle only translated selected labels and could leave an English interface mixed with Chinese.
- Standardised Design projects links on `/work/` and added current-page semantics to inner navigation.
- Fixed the sidebar closing during keyboard Tab navigation. `focusout` now checks the destination rather than the temporarily empty active element.
- Added a visible keyboard skip link and navigation fallback when JavaScript is disabled.
- Translated image-viewer controls, captions, project metadata and case-study text. Added an SVG favicon to remove the missing-icon request.
- Kept complete blog covers and added English article controls and date formatting.

Verification covers four viewport widths, all generated HTML routes, About and 404 layouts, image decoding, uncropped blog covers, client navigation, image zoom, keyboard focus restoration, source-language labels, stale language preferences and navigation without JavaScript. A separate static audit checks local resource links and same-page anchor targets.
