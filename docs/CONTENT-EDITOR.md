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

Then open http://127.0.0.1:4325/. The Composer starts its own Astro preview on port 4324, or the next free port if occupied, and connects the preview automatically. Drag a project card in the list or on the canvas to reorder it, choose whether it is visible, and set its width or height. The center panel is a layout-only preview; the right panel shows the saved Astro page. Use **保存布局** to write the changes to `src/data/layout.json`, then commit and push the file when the arrangement is ready for GitHub Pages.

The Composer is intentionally local and binds to `127.0.0.1`; it is not part of the static GitHub Pages build. Use Pages CMS for project text and media, and use Composer for the homepage arrangement. Both the site and Composer discover JSON records in `src/data/projects/`. New projects appear after reloading; existing order is preserved and new entries are appended. If you edited online with Pages CMS, pull the repository changes locally before editing in Composer.

### 中文快速说明

1. 在项目目录运行 `npm run composer`，保持终端开启。
2. 打开 <http://127.0.0.1:4325/>，拖动卡片标题或画布卡片；也可点击「上移 / 下移」。
3. 调整「显示」「宽度」「高度」，草稿示意立即变化。「手机单列」用于查看布局示意，实际手机网页也会保持单列。
4. 点击「保存布局」，本地网站预览更新。保存不会自动发布；确认后再提交、推送 GitHub。
5. 关闭时在启动终端按 Ctrl+C；下次仍用同一命令启动。端口已占用时先确认是否已开了另一个 Composer。

第一版只编辑首页作品布局，不提供文字、图片上传、About 编辑或像 Figma 一样的任意坐标排版。中间是布局示意，不是产品渲染图。布局保存前保留在当前页面，关闭页面会丢失未保存修改，编辑器会提醒。
