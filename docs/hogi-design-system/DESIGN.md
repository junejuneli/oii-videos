# OiiOii 视频 · Hogi 设计规范（DESIGN.md）

**主题：** 深色（视频画面 1920×1080，30fps）

OiiOii 视频里 `Hogi*` 组件（`packages/kit/src/hogi/`）的设计规范。底子是 Hogi Design System：纯黑画布、白字、品牌粉只给文字强调。文字和动效走 hogi-marketing-kit 的海报语言：Google Sans Flex（宽度 120）配 MiSans，字距收紧，不描边、不投影，可读性靠黑色渐变压暗，入场是上移 16px、600ms 的出现。扫光转场直接移植 hogi-video-sweep。所有取值都在同目录的 [`tokens.css`](./tokens.css)。

和产品设计系统不一致的地方，统一按 marketing kit 的做法保留，并在[「与产品设计系统的差异」](#与产品设计系统的差异营销视频例外)里逐条写明。

## 来源与优先级

| 来源 | 版本 | 用到的内容 |
|---|---|---|
| Hogi Design System | `lavendashan/hogi-design-system-playground@145b5f7`（镜像自 `Hogi2025/hogi-monorepo` `packages/design-system` develop@981ee2e，2026-08-13） | 纯黑画布、白字、`--pink-text` / `--pink-content` / `--green` 色值、Google Sans Flex + MiSansVF 字体 |
| hogi-marketing-kit | `lavendashan/hogi-marketing-kit@86afed2` | `src/brand.json` 的动效；`hogi-promo-poster` 的字体实例、字重、字距、高亮、徽标、渐变遮罩、工作区提示框；`hogi-video-sweep` 的着色器、遮罩算法和默认参数；OiiOii 字标原件 |

优先级：营销视频先按 marketing kit；marketing kit 没写到的按产品设计系统；两者冲突时按 marketing kit，并记进差异表。

## Token 架构

- `tokens.css` 是视频侧的唯一取值来源，变量前缀 `--oii-`。和产品设计系统同值同义的，注释里写了对应的 DS 变量。
- Remotion 组件用内联样式和 WebGL，不能直接读 CSS 变量，所以 kit 镜像了一份：`base.tsx`（`HOGI`、`HOGI_FONT`、`HOGI_MOTION`）、`sweep.tsx`（`SWEEP_DEFAULTS`），以及 `text.tsx` / `emphasis.tsx` / `typing.tsx` 里的字号和版式。
- 改一个值的顺序：先改 `tokens.css`，再改 kit 对应常量，最后用 `pnpm gallery:serve` 看预览。新增 token 要写明来源；没有来源的值先问，不要自己发明。
- 时间换算：帧 = round(ms × 30 / 1000)。600ms = 18 帧，900ms = 27 帧，180ms ≈ 5 帧。

## Tokens — 颜色

| Token | 值 | 用途 |
|---|---|---|
| `--oii-canvas` | `#000` | 画布、视频底色（= DS `--neutral-background`） |
| `--oii-text` | `#fff` | 所有文字（= DS `--neutral-content`） |
| `--oii-text-emphasis` | `#ff6cc2` | 强调词、步骤编号、当前进度、MemeTitle 大标题（= DS `--pink-text`） |
| `--oii-pink` | `#ff1eb4` | 品牌主色（= DS `--pink-content`），视频组件里不直接使用 |
| `--oii-green` | `#d2ff5e` | 强调标记：Spotlight 边线、Ripple 第二环、结果标签底色（= DS `--green`，营销例外） |
| `--oii-toast-surface` | `rgb(44 44 46 / .92)` | 操作提示框、SpeedPill；1.5px `rgb(255 255 255 / .19)` 描边，12px 背景模糊 |
| `--oii-divider` | `rgb(255 255 255 / .2)` | 徽标里 logo 和文案之间的竖线 |
| `--oii-rail-done` / `-todo` | 白 60% / 白 20% | StepCaption 进度条已完成 / 未到 |
| `--oii-track` | 白 15% | SpeedPill 进度轨道 |
| `--oii-spotlight-dim` | 黑 62% | Spotlight 四周压暗 |
| `--oii-callout-shade` | 黑 60% | Callout 背后的局部压暗 |

规则：
- 正文永远是白色，不用灰色。需要层级时用字号和字重区分，不用颜色。
- 强调色只有粉色 `#ff6cc2`，用来改单个短语的颜色（`highlight`）。不做底色，也不描边。每个画面最多一处强调。
- 不用黄色。海报模板里的黄 / 红 / 橙 / 蓝强调色，视频里统一换成粉色。

## Tokens — 字体

| 字体 | 文件 | 角色 |
|---|---|---|
| Google Sans Flex，宽度 120，字重 550 | `brand/fonts/GoogleSansFlex-550-120.woff2` | 拉丁字母和数字的大标题 |
| Google Sans Flex，宽度 120，字重 600 | `brand/fonts/GoogleSansFlex-600-120.woff2` | 拉丁字母和数字的其余文字 |
| MiSans VF（可变字重） | `brand/fonts/MiSansVF.woff2` | 中文，按请求的字重渲染 |

- 字体族 `"Hogi Sans", "MiSans", sans-serif`。拉丁字符走 Google Sans Flex，中文回落到 MiSans。
- kit 用 `useHogiFonts()` 在渲染前加载这三个字体（`delayRender`），不依赖系统字体。
- 字距统一 `-0.01em`，徽标文案 `-0.02em`。不描边，不加文字投影。
- 宽度 120 是字体实例本身的属性，不要用 CSS 横向拉伸来模拟。

### 字号（画面像素）

| 角色 | 字号 | 行高 | 字重 | 用在 |
|---|---|---|---|---|
| Display | 128px | 1.1 | 550 | `HogiEndTitles` 标题、`HogiMemeTitle` 大标题 |
| Headline | 80px | 1.1 | 550 | `HogiTopHeadline` |
| Title | 72px | 1.15 | 600 | `HogiStepCaption` 步骤名 |
| Kicker | 64px | 1.25 | 600 | `HogiMemeTitle` 引子；`HogiCallout` 同字号、行高 1.15（录屏像素） |
| Badge | 0.96 × logo 高度 | 1.26 | 600，字距 -0.02em | `HogiBadge` 文案（logo 48 → 46px） |
| Label | 40px | 1.2 | 600 | `HogiSticker` |
| Pill | 36px | 1.2 | 600 | `HogiSpeedPill` |
| Index | 28px | 1.2 | 600 | `HogiStepCaption` 编号 “02 / 05” |

## Tokens — 动效

| Token | 值 | 帧 | 说明 |
|---|---|---|---|
| `--oii-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | — | 所有入场和强调的缓动 |
| `--oii-reveal` + `--oii-rise` | 600ms，上移 16px | 18 | 文字、徽标、提示框入场 |
| `--oii-settle` | 900ms | 27 | 强调色 → 白，用于 StepCaption 步骤名 |
| `--oii-exit` | 180ms | 5 | Sequence 末尾淡出 |
| `--oii-exit-end-titles` | 400ms | 12 | 落版淡出，接片尾 Logo 动画 |
| `--oii-stagger-line` | 200ms | 6 | 多行逐行入场；MemeTitle 第二行晚 8 帧 |
| `--oii-stagger-part` | 100ms | 3 | StepCaption 编号 → 标题 → 进度条 |
| `--oii-ripple-ring` / `-offset` | 600ms / 167ms | 18 / 5 | 点击环扩散；粉环之后绿环 |
| `--oii-caret-blink` | 500ms | 15 | 打字光标闪烁，打字过程中常亮 |

- 入场只用“上移 + 淡入”，不弹跳、不缩放、不旋转、不晃动。
- 退场只淡出，不位移。

## Logo

- **字标**（`brand/logo/oiioii-wordmark-white.svg` / `-black.svg`，`BRAND.wordmarkWhite` / `wordmarkBlack`）：深色画面用白色，浅色画面用黑色，直接放，不加底、不加描边。比例 143.238 : 48，不要拉伸或重绘。组件是 `HogiLogoChip`。
- **徽标**（`HogiBadge`）：字标 | 2px 竖线（高为 logo 的 0.75，白 20%）| 文案，间距为 logo 高度的一半。来自海报的 “logo | Updates”。
- **扫光 Logo**（`brand/logo/oii-sweep-logo.svg`，`BRAND.sweepLogo`）：只在 `SweepTransition` 里出现，宽为画面的 12.5%，右边距和上边距都是画面宽度的 2.5%，压在扫光上方。
- 片尾 Logo 动画仍是 `Trailer`（`brand/endcard/trailer.mp4`），右下角水印仍是 `Watermark`。

## 组件

| 组件 | 坐标 | 规格 |
|---|---|---|
| `HogiLogoChip` | 布局元素 | `tone` 选白/黑，默认高 48 |
| `HogiBadge` | 布局元素 | 见 Logo |
| `HogiBrandMark` | 画面 | 徽标，左 96、上 64；顶部遮罩 240px / 0.45 |
| `HogiEndTitles` | 画面 | 徽标（logo 56）左 96、上 72；标题按 `\n` 分行，左 96、下 110，Display 字号，`highlight` 的短语变粉；底部遮罩 620px / 0.62、顶部 260px / 0.4；最后 12 帧淡出 |
| `HogiStepCaption` | 画面 | 左 96、上 72：编号（粉）→ 步骤名（粉 → 白）→ 进度条（56×4，间距 8）；顶部遮罩 380px / 0.55；每步包在自己的 Sequence 里 |
| `HogiSticker` | 画面 | `op`：深色提示框 + 白字 + 粉色强调词；`result`：绿底黑字。内边距 0.42 / 0.66 × 字号，圆角 0.4 × 字号，投影 `0 12px 40px` 黑 35% |
| `HogiMemeTitle` | 画面 | 左 96、下 100：白色引子（Kicker）+ 粉色大标题（Display）；底部遮罩 560px / 0.6 |
| `HogiSpeedPill` | 画面 | 顶部居中、上 72：深色提示框，“xx 生成中”（Pill）+ 3px 粉色进度线；最小宽 420，圆角 18。不显示倍速 |
| `HogiTopHeadline` | 画面 | 顶部居中、上 84，Headline 字号，粉色强调词；顶部遮罩 340px / 0.55 |
| `HogiSpotlight` | 录屏 | 目标以外压暗到 62%（边缘 10px 羽化），目标描 4px 绿线；`at` 起 18 帧入场，`until` 前 5 帧淡出 |
| `HogiRipple` | 录屏 | 粉环、绿环先后扩散，半径 12 → 70，描边 5；录屏里已有光标，只补环 |
| `HogiCallout` | 录屏 | 64px 白字 + 粉色强调词，背后局部压暗，无边框无底板 |
| `HogiTypeReveal` | 录屏 | 逐字揭开录屏里已有的文字；按键间隔在 0.55–1.45 倍之间随机，遇到标点多停一拍（权重 +3）；白色光标 4px 宽，高为行高的 72% |
| `SweepTransition` | 画面 | 见转场 |

## 转场

- **淡入淡出**：`FadeToBlack` / `FadeIn` / `FadeOut`（kit 原有）。片尾是 14 帧渐黑，接 `Trailer` 8 帧淡入，水印提前 4 帧开始淡出。
- **扫光**：`SweepTransition`，即 hogi-video-sweep。
  - **光带**：直接用扫光编辑器的片元着色器，以 `mix-blend-mode: screen` 叠在画面上。
  - **揭开遮罩**：按 `sweep.py` 的 `composite()` 逐像素计算，包括弯曲。
  - **默认参数**（`--oii-sweep-*` / `SWEEP_DEFAULTS`）：2 次扫过，每次 1.2 秒，前后至少停 2.2 秒，向右，倾斜 24°，`gradient` 风格；宽度 0.22、柔和度 0.72、羽化 0.168、亮度 0.64、光晕 0.6；粉 `#ff6cc2` → 绿 `#d2ff5e`；`ripple` 形状，弯曲 1%，3 个波；`smooth` 缓动。
  - **次数与结束画面**：多次扫过时 A→B→A… 交替，奇数次停在 B。
  - **Logo**：右上角带扫光 Logo，`logo={false}` 可以关掉。
  - **调参**：参数照扫光编辑器的范围来，不要在组件里写死新值。

## 版式

- **画面**：1920×1080，左右安全边距 96px，顶部 64–84px，底部 100–110px。
- **录屏**：强调组件（Spotlight / Ripple / Callout / TypeReveal）用录屏像素 3024×1544（1512×772 视口 × 2），作为镜头的 overlay，跟着运镜移动缩放。画面层文字用 1920×1080。
- **压暗**：文字从哪一边进来，就在哪一边加渐变压暗。底部渐变是 0% 透明 → 80% 处到满强度，顶部是单段线性。强度见 `--oii-scrim-*`。

## 与产品设计系统的差异（营销视频例外）

产品设计系统管的是产品界面。下面这些是视频场景按 marketing kit 保留的做法。产品界面里不适用。

| 项 | 产品设计系统 | 视频（本规范） | 依据 |
|---|---|---|---|
| 标题字重 | 拉丁 Bold 700 / ExtraBold 800，中文 Bold 630 / Heavy 700 | 550（大标题）/ 600（其余），Google Sans Flex 用宽度 120 的实例 | hogi-promo-poster 设计规范 |
| 字距与行高 | 标题字距 0，行高 1.15；正文字距 0.02em | 统一 -0.01em（徽标 -0.02em），行高 1.1–1.26 | 海报 `letterSpacingEm` 与行高 |
| 中文正文字体 | 正文用 PingFang SC | 统一用 MiSans（视频里没有正文段落，标题和标签都走 MiSans） | brand.json `fonts.heading` |
| 绿色 `#d2ff5e` | 只用于会员 / 权益页 | 用作强调标记：Spotlight 边线、Ripple 第二环、结果标签底色 | brand.json `palette.green`、扫光 `colorB`、海报工作区强调色 |
| 粉色描边动效 | 不用品牌粉做描边，不做发光、脉冲类动效 | `HogiRipple` 第一环是粉色描边扩散（单次 18 帧，不循环发光） | 扫光配色 `colorA`；在组件预览里选定的点击方案 |
| 动效时长 | `--motion-fast` 150ms / `--motion-normal` 200ms | 入场 600ms、退场 180ms、颜色过渡 900ms | brand.json `motion` |

除上表外，产品设计系统的规则照常适用：纯黑画布，白字不用灰值，粉色文字用 `--pink-text`，不额外引入新的强调色。

## Do / Don't

### Do
- 先找 `tokens.css` 里现成的值，代码里用 kit 常量（`HOGI`、`HOGI_MOTION`、`SWEEP_DEFAULTS`）和 `BRAND.*`。
- 一个画面只放一处强调：一个粉色强调词，或者一个 Spotlight / Ripple / Callout。
- 文字压在画面上时，配同侧的黑色渐变压暗。
- 操作提示用 `HogiSticker` 的 `op`，结果用 `result`，在结果出现的那一帧入场。
- 新增或改动组件时，在 `packages/gallery` 加预览，并把新值补进 `tokens.css`。

### Don't
- 不描边、不加文字投影、不用综艺花字式的粗墨边。同一个视频里不要把 `Hogi*` 和综艺风格组件（`Sticker`、`MemeTitle`、`EndTitles` 等）混用。
- 不用黄色，也不引入新的强调色。
- 不拉伸、重绘或描摹字标，不给字标加底。
- 入场不用弹跳、缩放、旋转或晃动。
- 文案不写“新功能 / 全新 / 重磅上线”，不写积分和价格，不显示加速倍数（沿用 oii-brand-package 的文案禁区）。

## 给 Agent 的提示

速查：
- **文字**：`#fff`，强调 `#ff6cc2`（`highlight`），字体族 `"Hogi Sans", "MiSans", sans-serif`，字距 -0.01em
- **字号**：Display 128 / Headline 80 / Title 72 / Kicker 64 / Label 40 / Pill 36 / Index 28
- **动效**：`cubic-bezier(0.22,1,0.36,1)`，上移 16px + 600ms，强调色过渡 900ms，退场 180ms
- **强调**：Spotlight（压暗 62% + 4px 绿边）/ Ripple（粉 → 绿双环）/ Callout（64px 海报字）
- **转场**：Fade 系列，或 `SweepTransition`（默认参数不改）

规则：
1. 用 `@oii/kit` 的 `Hogi*` 组件和常量，不在视频里写死颜色、字号和时长。
2. 需要的值 `tokens.css` 里没有，就先问，不要自己发明。
3. 改 kit 后跑 `pnpm typecheck`，并在 `pnpm gallery:serve` 里看一遍对应预览。
4. 已完成视频里的综艺风格组件不要改；同一个视频里两套风格不混用。

## 预览

`pnpm gallery:serve` 打开 http://localhost:4173 ，每张卡片直接运行 kit 源码。扫光预览要和 marketing kit 的 demo 一致，就把它的两段素材放进 `packages/gallery/media/`，说明见 `packages/gallery/README.md`。
