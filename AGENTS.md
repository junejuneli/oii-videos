# oii-videos — Agent 指南

## 先读

- 新视频从 `.claude/skills/oii-video-new` 开始；每个视频的上下文在 `videos/<slug>/brief.md`，开工前先读。
- 创作流程 skill：`oii-canvas-record`（录屏）→ `oii-one-take-edit`（剪辑）→ `oii-highlight`（标注）→ `oii-brand-package`（包装）→ `oii-render-release`（出片），改意见按 `oii-feedback-loop` 处理。
- Remotion API 问题查 `remotion-*` skill（由 `skills-lock.json` 管理，不要手改；真实文件在 `.agents/skills/`，`.claude/skills/` 里是软链接）。

## 规则

- **不要提交大文件**：视频、音频、录屏只放在本地。新增素材后运行 `pnpm media:lock`；提交前运行 `pnpm media:check`。
- **git 提交前先让用户确认**。
- Remotion 版本统一在 `pnpm-workspace.yaml` 的 catalog 里锁定，不要在单个视频里单独升级。
- 品牌素材只从 `brand/` 取，代码里用 `BRAND.*`。`public/brand/` 是自动同步的副本，不要编辑。
- 组件先写在视频自己的 `src/` 里，第二个视频也需要时再抽进 `packages/kit`。修改 kit 后要确认旧视频渲染不变。
- 坐标约定：录屏 overlay 用录屏像素（3024×1544 = 1512×772 视口 × 2）；画面层 overlay 用 1920×1080。
- 必须在 macOS 上渲染（字体依赖系统圆体）。
- 不要改用户自己在画布里做的内容；触发生成、下载、扣积分前先问用户。
