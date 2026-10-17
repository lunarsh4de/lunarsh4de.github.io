# Content editing workflow

The site keeps presentation code in src/pages/, src/components/, and src/styles/. Personal information is stored in src/data/site.json, so it can be edited independently from the layout.

The repository includes a .pages.yml configuration for Pages CMS. After the repository is published on GitHub, Pages CMS can edit the profile fields and media through a browser interface and commit those changes back to the repository. The existing GitHub Actions workflow then rebuilds the Astro site and publishes it to GitHub Pages.

For larger layout or interaction changes, describe the desired behavior in Codex. I can update the Astro components and styles, run the local preview, and verify the static build before you push the change.

## Local editing

    npm install
    npm run dev

Edit src/data/site.json for profile copy, src/data/projects/ for project records, src/data/notes/ for notes, public/images/ for images, and src/pages/ or src/styles/ for page structure and visual behavior. The page components read these structured records through src/data/site.ts, so projects can be added or removed without rewriting the routes.
