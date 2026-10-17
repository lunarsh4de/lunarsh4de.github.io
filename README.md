# Industrial Portfolio / V0

第一版是 Astro 静态站，部署目标是 GitHub Pages。当前只搭建基础框架：

- 产品型首页和开屏动画
- `model-viewer` 产品查看器占位
- Work / Notes 页面（统一使用左侧面板导航）
- 桌面端负色跟随光标
- 手机端响应式布局，并自动关闭光标效果
- 个人信息、项目和笔记已拆分为可编辑的 JSON 内容文件
- 根目录提供 `.pages.yml`，可接入 Pages CMS

## 本地工作流

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:4321/`。修改 `src/` 后，浏览器会自动刷新。

推荐使用 VS Code 或 Cursor。当前版本先采用“代码编辑 + 实时预览”的方式，避免拖拽编辑器破坏 Astro 组件和响应式结构。

## 本地运行

```bash
npm install
npm run dev
```

## 文件约定

- `src/data/site.ts`：内容数据的类型与统一导出层。
- `src/data/site.json`：About 页面个人信息与中英文文案。
- `src/data/projects/`：每个项目一个 JSON 文件，可新增或删除。
- `src/data/notes/`：每篇笔记一个 JSON 文件，可新增或删除。
- `src/pages/`：页面路由和页面结构。
- `src/components/`：可复用组件，例如产品查看器。
- `src/styles/`：全局样式和局部覆盖。
- `public/models/`：网页使用的 `.glb` 文件。
- `public/images/`：KeyShot 渲染图、草图、CMF 和原型照片。
- `public/posters/`：3D 模型加载前的预览图。
- `public/videos/`：产品动画和过程视频。
- `docs/CONTENT-EDITOR.md`：Pages CMS 与本地编辑流程。

## 下一轮

1. 把真实的 `.glb` 文件放入 `public/models/`，给项目数据加上 `model` 路径。
2. 给产品详情页加入真实图片、草图、结构图和 CMF 资料。
3. 再增加模型热点、材质切换和爆炸视图。
4. 最后接 GitHub CMS，让内容编辑不需要改组件代码。

## 设计与研究资料

- `docs/PROMPT.md`：后续让 Codex 修改网站时使用的工作 prompt。
- `docs/DESIGN-LANGUAGE.md`：排版、交互和内容语言。
- `docs/MEMORY-GRAPH.md`：参考站、技术架构和设计决策的关系图。
- `docs/research/repositories.md`：已锁定 commit 的开源仓库、许可证和复用边界。
- `C:/Users/81489/.codex/skills/industrial-portfolio-system`：本机可调用的工业设计作品集维护 skill。

当前的 `MODEL SLOT / GLB` 是刻意保留的占位，不代表最终工业产品模型。
