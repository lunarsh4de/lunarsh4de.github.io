# Industrial Portfolio Design Rules

这份规范把 GitHub 上成熟设计系统中可迁移的部分，压缩成适合个人工业设计作品集的轻量规则。它服务于当前 Astro + GitHub Pages 静态站，不要求安装大型组件库。

## 结论

当前网站采用“内容优先的工业编辑风格”：产品图、KeyShot 渲染图和 3D 模型是视觉主角；UI 只负责导航、比较和说明。规范的执行入口是 `src/styles/tokens.css`，页面结构仍由 Astro 组件负责。

## 来源与可迁移事实

- [GitHub Primer Primitives](https://github.com/primer/primitives/)（MIT）：用颜色、字体、间距、断点和动效 token 组成可编译的基础层，并区分 primitive 与 semantic token。
- [GitHub Primer](https://primer.style/)：强调响应不同设备和交互方式，支持窄至 320px 的视口；触控目标至少 24px，条件允许时优先 44px；不应只依赖 hover；应尊重用户的 reduced-motion 偏好。
- [proper-css](https://github.com/propertools/proper-css)（MIT）：无 JS、无构建依赖的 token-first CSS，适合静态网站；其比例体系可借鉴，但不直接复制视觉。
- [design-token-system](https://github.com/antoinette-nguyen/design-token-system)：展示 primitive → semantic 的 CSS 变量映射、4px 间距基准、`clamp()` 流体字号和命名动效。
- [Mission Built Site Design](https://github.com/missionbuilt/missionbuilt-sitedesign)（MIT）：Astro 静态内容站、局部样式和语义 token 的组合，适合本项目的维护方式。

## 本项目规则

### 视觉

1. 页面底色使用纸张色，正文使用石墨色；辅助文字只能降低对比度，不改变信息层级。
2. 酸绿色只用于状态、焦点、编号强调和少量交互反馈，不作为大面积背景。
3. 默认直角或轻微 4px 圆角。不要引入玻璃拟态、渐变光球、装饰性阴影卡片。
4. 产品本身优先于 UI 装饰。每个项目卡应有真实渲染图、模型、原型照片或明确的占位说明。

### 字体与信息层级

- `--font-display`（Newsreader）用于展示标题和叙事性短句。
- `--font-ui`（Manrope）用于正文、导航和按钮。
- `--font-mono`（DM Mono）用于年份、分类、尺寸和版本等可扫描元数据。
- 标题使用 `clamp()`，但不让字号随视口无限增长；移动端正文保持可读的固定基准。

### 间距与网格

- 以 4px 为基础：优先使用 `--space-*` token，不在新组件中随意创造间距值。
- 桌面首页使用固定信息侧栏 + 3 列有序错落网格：首项占两列两行，旁边堆叠小图，后续按同一节奏轮换；平板收敛为 2 列，手机降为 1 列。
- 内容区域必须保留左右安全边距，最窄支持 320px 视口，不产生横向滚动。
- 项目卡片的图片区域给出稳定的 `min-height` 或比例，避免模型、图片加载时页面跳动。

### 交互与无障碍

- 所有链接和按钮必须有键盘可见焦点；焦点样式使用 `--focus-ring`。
- 桌面负色跟随光标只在精细指针设备启用；手机不显示自定义光标。
- 项目标题不能只在 hover 时出现：移动端直接展示 overlay/caption。
- 遵守 `prefers-reduced-motion: reduce`，开屏动画、悬停位移和滚动动画应降级。
- 菜单按钮提供 `aria-expanded` 与 `aria-controls`，模型查看器应有替代说明。

### 工业设计项目内容

每个项目至少维护：`title`、`category`、`year`、`short`、主视觉资源。完整案例再补充问题、研究、形态推导、CMF、结构和验证。3D 模型是增强层，不能成为访问项目内容的唯一入口。

## 如何修改

- 改颜色、字体、间距、动效：先改 `src/styles/tokens.css`。
- 改首页网格、侧栏和移动端菜单：改 `src/pages/index.astro` 与 `src/styles/overrides.css`。
- 改项目标题、年份、分类和资源路径：改 `src/data/site.ts`，不要把内容写死在组件里。
- 新增组件时优先复用 semantic token；只有当语义角色不同，才新增 token。

## 假设与不确定性

- 假设第一版仍是单人作品集，项目数量约 4–12 个，部署目标是 GitHub Pages。
- 假设 KeyShot 主要以静态渲染图/短视频呈现，GLB 作为可选增强，而不是所有项目都实时渲染。
- 外部仓库的 star 数和维护状态会变化；本规范依据仓库公开 README/文档和许可证信息，未把任何外部代码直接复制进项目。

## 反方观点与失败条件

统一 token 会牺牲一部分“每个项目完全不同”的自由度；如果作品本身依赖强烈的品牌色或复杂材质叙事，过度克制的纸张色体系可能压平差异。届时应在 semantic 层新增项目级主题变量，而不是继续堆叠硬编码颜色。若真实作品素材长期缺失，任何网格和动效优化都无法替代内容质量，首页应优先上线真实 KeyShot 图或原型照片。
