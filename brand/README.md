# OiiOii 品牌资产

所有视频共用的品牌素材。`pnpm dev` / `pnpm render` 前会自动同步到每个视频的 `public/brand/`，在代码里用 `@oii/kit` 的 `BRAND.*` 引用，不要手写路径。

| 文件 | 用途 | 规格 |
|---|---|---|
| `logo/oiioii-logo.svg` | 标准 Logo（粉色 #FF1EB4） | 65×16 viewBox。深色背景上放白色胶囊底，见 kit 的 `LogoChip` |
| `watermark/video-watermark-6_4s.apng` | 产品导出视频的动态水印原件 | 来源 `static-oiioii-sg.hogiai.cn/canvas/video/video-watermark-6_4s.apng` |
| `watermark/frames/001-190.png` | 上面 apng 拆成的 PNG 序列（Remotion 渲染不支持 apng） | 30fps，190 帧，6.33s 循环 |
| `endcard/trailer.mp4` | 片尾 Logo 动画 | 1080×1080，63 帧，自带音效；居中放黑底 |
| `sfx/click.wav` | 点击音效 | 音量 0.3 左右 |

## 水印规则（与后端 `packages/backend/src/utils/media.ts` 一致）

- 16:9 画面：宽度 = 画面宽 × 7/60（1920 → 224px）
- 不透明度 0.6，距右下角 20px
- 片尾 Logo 动画出现前随画面一起淡出

## 字体

圆体：拉丁和数字用 SF Pro Rounded，中文用 Yuanti SC（圆体-简）粗体，都是 macOS 系统字体，所以必须在 macOS 上渲染。字体 token 在 `packages/kit/src/theme.ts`。
