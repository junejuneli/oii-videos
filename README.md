# oii-videos

OiiOii 视频的源工程。每个视频一个独立的 Remotion 工程，共用组件放在 kit 里，品牌素材放在 `brand/`，创作流程沉淀为 `.claude/skills/` 下的 skill。

## 目录

```
brand/              品牌资产：Logo、水印、片尾 Logo 动画、音效（规格见 brand/README.md）
packages/kit/       @oii/kit：跨视频复用的 Remotion 组件
  capture/            录屏素材：一镜到底时间重映射（buildTake）、演示光标、定格补丁
  motion/             强调与转场：流光框、涟漪、气泡、渐变
  overlays/           画面文字：步骤字幕、顶部标题、进度条
  brand/              水印、片尾、LogoChip
videos/<YYYY-MM-slug>/  每个视频一个工程
  brief.md            需求、素材、结构、迭代记录
  src/                这个视频专属的代码
  public/             素材（大文件只在本地，见下方“素材”）
  media.lock.json     本地大文件清单（路径 + 大小 + sha256）
  out/                渲染输出（不进 git）
templates/video/    新视频模板
scripts/            new-video / sync-brand / release / media / make-music
.claude/skills/     创作 skill（oii-*）和 Remotion 官方 skill（remotion-*）
```

## 常用命令

```bash
pnpm install
pnpm new <slug> "标题"                 # 新建 videos/YYYY-MM-<slug>
pnpm --filter <slug> dev               # 打开 Remotion Studio
pnpm --filter <slug> release v3        # 渲染母版 + 分享版到 out/
pnpm typecheck                         # 检查 kit 和所有视频
pnpm media:lock                        # 记录本地大文件清单
pnpm media:check                       # 检查大文件是否齐全，以及有没有误提交大文件
```

## 素材

录屏、原始素材、配乐等工程大文件（mp4/mov/wav/…，以及 `public/rec/` 和 `public/raw/`）**只存在本地，不推送到 GitHub**；定稿的 1080p 成片上传到 Releases。`media.lock.json` 记录了每个视频需要哪些文件，换机器或者文件丢失时用 `pnpm media:check` 就能发现。`brand/` 下的小文件是例外，会进 git。

## 视频列表

| 视频 | 时间 | 状态 | 成片 |
|---|---|---|---|
| [颜色标签功能介绍](videos/2026-10-color-tags/) | 2026-10 | ✅ 成品 v9 | [1080p](https://github.com/junejuneli/oii-videos/releases/download/color-tags-v9/oiioii-color-tags-v9-1080p.mp4) |
| [Seedance 2.5 样片模式宣传片](videos/2026-10-seedance25-sample-mode/brief.md) | 2026-10 | v9 | 本地 |

成片发布在 [Releases](https://github.com/junejuneli/oii-videos/releases)：每个成品一个 tag（`<slug>-vN`），附 1080p mp4。仓库本身不存视频文件。
