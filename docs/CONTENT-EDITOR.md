# Content editing workflow

The site keeps presentation code in src/pages/, src/components/, and src/styles/. Personal information is stored in src/data/site.json, so it can be edited independently from the layout.

The repository includes a .pages.yml configuration for Pages CMS. After the repository is published on GitHub, Pages CMS can edit the profile fields and media through a browser interface and commit those changes back to the repository. The existing GitHub Actions workflow then rebuilds the Astro site and publishes it to GitHub Pages.

For larger layout or interaction changes, describe the desired behavior in Codex. I can update the Astro components and styles, run the local preview, and verify the static build before you push the change.

## Local editing

    npm install
    npm run dev

Edit src/data/site.json for profile copy, src/data/projects/ for project records, src/data/notes/ for notes, public/images/ for images, and src/pages/ or src/styles/ for page structure and visual behavior. The page components read these structured records through src/data/site.ts, so projects can be added or removed without rewriting the routes.

The local Portfolio Composer edits src/data/layout.json. It controls homepage project order, visibility, and the one or two column span of each product panel.

## Visual homepage editing

From the project folder, run:

    npm run composer

Then open http://127.0.0.1:4325/. The Composer starts the Astro preview at http://127.0.0.1:4324/ as well. Drag a project card to reorder it, choose whether it is visible, and set its width or height. The center panel is a layout-only preview; the right panel shows the live Astro page. Use **Save layout** to write the changes to `src/data/layout.json`, then commit and push the file when the arrangement is ready for GitHub Pages.

The Composer is intentionally local and binds to `127.0.0.1`; it is not part of the static GitHub Pages build. Use Pages CMS for project text and media, and use Composer for the homepage arrangement. The first version edits the three existing homepage projects; adding a new project still requires registering its JSON record in `src/data/site.ts` before it can appear in the Composer.
