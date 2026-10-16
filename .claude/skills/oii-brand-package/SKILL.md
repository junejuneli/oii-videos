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

## hogi-marketing-kit 风格组件（`@oii/kit` 的 `Hogi*`）

按 hogi-marketing-kit 的海报和扫光规范做的一套，和上面的综艺风格并存，旧视频不受影响。预览见 `pnpm gallery:serve`。

- 文字：Google Sans Flex（宽度 120，550/600）+ MiSans，-0.01em 字距，不描边不投影，靠黑色渐变压暗背景。白字，强调词用粉色 `#FF6CC2`（`highlight`）。
- 动效：上移 16px + 600ms 出现（`cubic-bezier(0.22,1,0.36,1)`），标题粉 → 白 900ms，退场 180ms（`HOGI_MOTION`）。
- 组件：`HogiLogoChip`（字标，白/黑，不加底）、`HogiBadge`（字标 | 文案）、`HogiEndTitles`、`HogiStepCaption`、`HogiSticker`（`op` 深色提示 / `result` 绿色）、`HogiMemeTitle`、`HogiSpeedPill`、`HogiTopHeadline`、`HogiBrandMark`。
- 强调：`HogiSpotlight`（四周压暗 + 细绿框）、`HogiRipple`（粉绿双环）、`HogiCallout`（海报大字）。
- 转场：`FadeToBlack` / `FadeIn` / `FadeOut`，或 `SweepTransition`（hogi-video-sweep 的扫光，参数默认取 `SWEEP_DEFAULTS`，右上角带 Oii Logo，`logo={false}` 关掉）。
- 片尾 Logo 动画仍用 `Trailer`。

## 封面（参考 B 站封面风格）

- 第 0 帧就是一张完整的封面，可以直接截图作为视频封面。
- 结构：Logo + 功能名标签（如“Seedance 2.5 样片模式”“宫格拆分”，**不写“新功能”**）→ 超大描边标题（白 + 黄，粗墨色描边加硬投影，略微倾斜）→ 白底黑框的一句话卖点 → 右侧几张素材卡片轮流跳动。
- 出场：标题冲向镜头放大并淡出，露出下方已经在播放的画布（约 18 帧重叠）。
- 示例：`videos/2026-10-seedance25-sample-mode/src/Cover.tsx`。

## 步骤字幕

`<StepCaption steps={STEPS} step={n} note=.../>`，左下角，带编号和进度条。文案越短越好（4–6 个字），比如“选参考 / 连线生成 / 写提示词 / 选择样片模式 / 选中成片”。

## 落版

- 在成片最后约 40 帧时叠上落版，然后用成片最后一帧定格（`FinalHold`）继续停留约 54 帧。
- 右上角：`LogoChip` + “× 合作方”，从右侧滑入并配合高斯模糊淡入。
- 左下角：一句 slogan，用综艺花字（黄字粗墨描边）加紧凑的动态底板（旋转放射、斜纹滚动、跳动圆点），底板只包住文字。
- 示例：`videos/2026-10-seedance25-sample-mode/src/Scenes.tsx` 里的 `EndOverlay`。

## 片头痛点与片尾

- 痛点：`MemeTitle` 玩梗大字（例：「我的图呢？／我那么大一张图呢？」），配合镜头一路拉远。每个视频 1–2 个梗，脚本阶段设计好（见 oii-video-new「必备：1–2 个玩梗」）。
- 片尾：最后一个结果直接接 `EndCenter` 式落版——背景高斯模糊变暗，居中大标题 slogan，下面 LogoChip + 功能名，从模糊到清晰进场（示例：`videos/2026-10-color-tags/src/EndCenter.tsx`）。

## 音乐与音效

- 合成脚本（都在 `scripts/`）：`make-music.mjs` 128 BPM 电子（偏躁）/ `make-music-elegant.mjs` 92 BPM 无鼓（被反馈“太平、没鼓点”）/ `make-music-groove.mjs` 118 BPM chill house（被反馈“太吵”）/ **`make-music-light.mjs` 105 BPM 轻律动（颜色标签 v6 起使用）**：1/3 拍软底鼓、2/4 拍响指、八分轻踩镲、电钢琴 + 铺底。
- **参考 BGM（用户指定，2026-10-14）：`videos/2026-10-color-tags/out/color-tags-v9-share.mp4` 里的配乐 = `make-music-light.mjs`（105 BPM）。新视频默认用它：`node scripts/make-music-light.mjs public/sfx/music.wav <秒数>`，按成片时长生成（确定性合成，前段与 color-tags 完全相同），音量曲线照 color-tags（0.26 → 0.22，片尾前淡出）。**
- 用户偏好：有鼓点、节奏稍快，但不能吵；功能介绍片音量放在 0.22–0.26。合成音乐反复不满意时，建议用户直接提供正版配乐。
- 背景音乐基础音量约 0.36，成片自带声音播放时压到 0.1，片尾前淡出。点击音效 `BRAND.click`，音量 0.3。
- 不要加转场“嗖”声（被反馈过“很奇怪”）。

## 文案禁区

- 封面、标题、花字、落版都不写“新功能 / 全新 / 重磅上线”这类字样：我们所有功能都不是新功能，只写功能名和它能做什么。

- 不写具体积分或价格数字（除非用户明确要求）。
- 不显示加速倍数，只显示“xx 生成中”。
