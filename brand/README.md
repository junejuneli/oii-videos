# OiiOii 品牌资产

所有视频共用的品牌素材。`pnpm dev` / `pnpm render` 前会自动同步到每个视频的 `public/brand/`，在代码里用 `@oii/kit` 的 `BRAND.*` 引用，不要手写路径。

| 文件 | 用途 | 规格 |
|---|---|---|
| `logo/oiioii-logo.svg` | 标准 Logo（粉色 #FF1EB4） | 65×16 viewBox。深色背景上放白色胶囊底，见 kit 的 `LogoChip` |
| `watermark/video-watermark-6_4s.apng` | 产品导出视频的动态水印原件 | 来源 `static-oiioii-sg.hogiai.cn/canvas/video/video-watermark-6_4s.apng` |
| `watermark/frames/001-190.png` | 上面 apng 拆成的 PNG 序列（Remotion 渲染不支持 apng） | 30fps，190 帧，6.33s 循环 |
| `endcard/trailer.mp4` | 片尾 Logo 动画 | 1080×1080，63 帧，自带音效；居中放黑底 |
| `sfx/click.wav` | 点击音效 | 音量 0.3 左右 |
| `logo/oiioii-wordmark-white.svg`、`-black.svg` | hogi-marketing-kit 的 OiiOii 字标（海报原件） | 143.238×48 viewBox。暗画面用白色，亮画面用黑色，不加底 |
| `logo/oii-sweep-logo.svg` | 扫光转场右上角的粉色 Logo（hogi-video-sweep 原件） | 188×63，宽为画面 12.5%，边距 2.5% |
| `fonts/GoogleSansFlex-550-120.woff2`、`-600-120.woff2` | hogi 海报拉丁字体（宽度 120，字重 550/600） | 由 hogi-marketing-kit 的 TTF 转成 woff2，OFL 1.1 |
| `fonts/MiSansVF.woff2` | hogi 海报中文字体（可变字重） | 由 hogi-marketing-kit 的 MiSansVF.ttf 转成 woff2，约 12MB |

## 水印规则（与后端 `packages/backend/src/utils/media.ts` 一致）

- 16:9 画面：宽度 = 画面宽 × 7/60（1920 → 224px）
- 不透明度 0.6，距右下角 20px
- 片尾 Logo 动画出现前随画面一起淡出

## 字体

圆体：拉丁和数字用 SF Pro Rounded，中文用 Yuanti SC（圆体-简）粗体，都是 macOS 系统字体，所以必须在 macOS 上渲染。字体 token 在 `packages/kit/src/theme.ts`。

`Hogi*` 组件改用 `fonts/` 里的海报字体（Google Sans Flex + MiSans），由 kit 在渲染前加载，不依赖系统字体。
