---
name: oii-brand-package
description: OiiOii 视频的品牌包装规范与组件：封面、步骤字幕、落版（Logo × 合作方 + 综艺花字）、右下角水印、片尾 Logo 动画、字体与配色、背景音乐。Use when making a cover/title card, end card, watermark, logo usage, or "片头", "片尾", "封面", "加水印", "落版".
---

# 品牌包装

品牌素材在仓库根目录的 `brand/` 下（规格见 `brand/README.md`），代码里通过 `@oii/kit` 的 `BRAND` 和品牌组件来用，不要手写路径，也不要把 Logo 复制进视频目录。

## 固定元素

- **Logo**：只用 `brand/logo/oiioii-logo.svg`（粉色 #FF1EB4）。放在视频画面上时用 `<LogoChip/>`（白色胶囊底 + 墨色描边）。不要重新绘制或描摹 Logo。
- **水印**：`<Watermark/>`，在整个正片期间显示，片尾 Logo 动画前跟随渐黑一起淡出（用 `FadeOut` 包一层）。
- **片尾**：`<FadeToBlack/>` 约 14 帧 → `<Trailer/>`（`TRAILER_FRAMES` = 63 帧，用 `FadeIn` 8 帧淡入）。
- **字体**：`FONT_CN`（SF Pro Rounded + Yuanti SC 圆体），标题用粗体 700。用户反馈过“要加粗、要圆润”。
- **配色**：`PINK` #F0349B、`GRADIENT`（粉到紫）、`INK` #0A0A0C、亮黄 #FFE14D 用于花字。

## 封面（参考 B 站封面风格）

- 第 0 帧就是一张完整的封面，可以直接截图作为视频封面。
- 结构：Logo + “Seedance 2.5 新功能”标签 → 超大描边标题（白 + 黄，粗墨色描边加硬投影，略微倾斜）→ 白底黑框的一句话卖点 → 右侧几张素材卡片轮流跳动。
- 出场：标题冲向镜头放大并淡出，露出下方已经在播放的画布（约 18 帧重叠）。
- 示例：`videos/2026-10-seedance25-sample-mode/src/Cover.tsx`。

## 步骤字幕

`<StepCaption steps={STEPS} step={n} note=.../>`，左下角，带编号和进度条。文案越短越好（4–6 个字），比如“选参考 / 连线生成 / 写提示词 / 选择样片模式 / 选中成片”。

## 落版

- 在成片最后约 40 帧时叠上落版，然后用成片最后一帧定格（`FinalHold`）继续停留约 54 帧。
- 右上角：`LogoChip` + “× 合作方”，从右侧滑入并配合高斯模糊淡入。
- 左下角：一句 slogan，用综艺花字（黄字粗墨描边）加紧凑的动态底板（旋转放射、斜纹滚动、跳动圆点），底板只包住文字。
- 示例：`videos/2026-10-seedance25-sample-mode/src/Scenes.tsx` 里的 `EndOverlay`。

## 音乐与音效

- `node scripts/make-music.mjs public/sfx/music.wav <秒数>` 可以合成 128 BPM 的电子背景音乐。
- 背景音乐基础音量约 0.36，成片自带声音播放时压到 0.1，片尾前淡出。点击音效 `BRAND.click`，音量 0.3。
- 不要加转场“嗖”声（被反馈过“很奇怪”）。

## 文案禁区

- 不写具体积分或价格数字（除非用户明确要求）。
- 不显示加速倍数，只显示“xx 生成中”。
