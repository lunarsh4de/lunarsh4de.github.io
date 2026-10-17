# Working prompt

你正在维护一个 Astro + GitHub Pages 的工业设计作品集。目标是让真实产品图、KeyShot 渲染、原型过程和案例判断成为主角。

执行任何改动前：

1. 检查当前路由、数据、样式和素材状态。
2. 保持固定左栏、移动端单列和键盘可访问性。
3. 首页使用有秩序的不对称图墙：列线清晰，图块大小错落，避免随机 Masonry 和整齐的等尺寸卡片。
4. 交互使用轻量球状光标、悬停位移、黑屏左到右进入动画，并提供 reduced-motion 降级。
5. 真实素材优先；没有素材时标记 CSS 占位，不伪装成真实产品图。
6. 运行 `npm run build`，检查 `/`、`/notes/`、`/work/` 和每个详情页；启用客户端路由时测试返回首页、开屏 Enter、浏览器后退和移动端菜单。

参考规则：Minimalissimo 提供图片流密度，Shixun Chen 提供固定左栏与项目图索引，Mårten Malmnäs 提供光标和进入动效。参考代码仓库与 commit 记录见 `docs/research/repositories.md`。
