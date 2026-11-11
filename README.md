# Zichen Yang / Design Portfolio

Astro 静态作品集，部署到 GitHub Pages。

当前包含 5 个从用户作品集 PDF 接入的独立作品：管道清理者、Plant 造口袋、智储家庭能源、参数化桌面摆件、青创共富农场网页设计。

## 本地预览

```powershell
npm ci
npm run dev
```

默认打开 `http://127.0.0.1:4321/`。

## 内容编辑

- `src/data/projects/*.json`：每个作品的标题、简介、封面与事实信息。
- `src/content/projects/*.md`：独立的作品正文，可编辑文字、章节与图片。
- `src/data/portfolio-media.json`：内嵌图片来源与响应式图片版本。
- `src/data/portfolio-vectors.json`：从 PDF 提取的 SVG 结构图来源。
- `src/data/layout.json`：首页顺序、显隐和网格尺寸。
- `src/data/site.json`：个人简介与站点信息。
- `public/images/projects/`：各作品的 WebP 与 SVG 素材。
- `src/data/wechat.json`：公众号「设计有AI」已归档文章，替换原来的示例博客。
- `public/images/wechat/`：公众号文章的本地配图。
- `.pages.yml`：Pages CMS 配置。

本地布局编辑器仍可通过 `npm run composer` 启动，见 `docs/CONTENT-EDITOR.md`。

## 构建与检查

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4331
# 另一个终端
npx playwright install chromium
npm run verify:portfolio
```

检查涵盖全部静态路由、4 种屏幕宽度、图片解码、章节跳转、图片放大、键盘操作、客户端导航与无脚本正文。使用本机其他 Chrome 时，设置 `PORTFOLIO_CHROMIUM` 为可执行文件绝对路径。

`dist/` 为发布内容，Composer、本地 PDF 校对图和 QA 文件不进入静态发布。当前 GitHub Actions 在 `main` 更新后自动部署。

详见 `docs/PORTFOLIO-IMPORT.md`，其中记录 PDF 页与作品的对应关系、提取方法、文案处理与后续编辑方式。

公众号内容通过公开链接读取，流程见 [docs/WECHAT-SYNC.md](docs/WECHAT-SYNC.md)。无需 Markdown 稿件或插件；读取原文后使用 `npm run sync:wechat -- --capture-dir tmp/wechat-captures` 导入。当前归档“热点资讯”合集的 16 篇公开文章，5 篇作者设为私密的文章未导入；不代表账号全部历史内容。公开索引为 `/api/articles.json`，来源覆盖记录为 `/api/wechat-source.json`。未开启后台自动抓取。
