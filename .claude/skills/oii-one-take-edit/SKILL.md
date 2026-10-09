---
name: oii-one-take-edit
description: 把一条长录屏剪成连续顺滑的“一镜到底”：用 @oii/kit 的 buildTake 做时间重映射，用 PSNR 校验切点，加速等待段，镜头连续继承，用 FreezePatch 盖掉被剪掉的步骤。Use when editing screen-recording footage in Remotion, "剪得连贯点", "一镜到底", "画面闪了一下", "加速等待".
---

# 一镜到底剪辑

核心原则：观众感觉不到剪辑点。只剪“画面静止”的片段，切点前后两帧几乎一样，镜头路径连续。

## 用 buildTake 写镜头表

```ts
const SHOTS: TakeShot[] = [
  { id: "select", start: 1.0, end: 4.9, rate: OP,
    cam: [{ t: 0, x: 1512, y: 772, s: 0.72 }, { t: 1, x: 1250, y: 860, s: 0.82 }],
    clicks: [2.97] },
  { id: "wait", start: 107.2, end: 210.4, rate: 150, xfade: 0, cam: [{ t: 1, x: 1512, y: 520, s: 1.02 }] },
];
const take = buildTake(staticFile("rec/recC.mp4"), SHOTS);
```

- `start`/`end`：录屏里的秒数。`rate`：操作段一般用 1.6–1.9，等待段 40–150。
- `cam`：`(x, y)` 是录屏像素里放在画面中心的点，`s` 是缩放。第一个 key 默认继承上一个镜头的结束位置，这是镜头连续的关键。只有确实需要重新起镜时才写 `fresh: true`，并配合 `xfade`。
- `xfade`：和上一个镜头交叉溶解的帧数，默认 4。连续段（同一时刻接着播）设为 0。
- `clicks`：点击时刻，用来对齐点击音效（`take.clicks`）。
- `take.span(id, toId)` 和 `take.frameOf(id, t)`：用来把字幕、标注对齐到镜头上。

## 选切点：PSNR 校验

切点 A 的结束帧和 B 的开始帧必须几乎相同（缩小后 PSNR ≥ 35 比较安全，等于 inf 最好）：

```bash
python3 .claude/skills/oii-one-take-edit/scripts/cut_psnr.py public/rec/recC.mp4 4.9:23.0 91.0:103.0
```

PSNR 低就说明切点处画面在动（弹窗、hover 状态、加载动画），换一个时间点，或者用 FreezePatch 处理。

## 去掉中间某个步骤：FreezePatch + PatchCursor

例如“选分辨率”这步要剪掉，但前后画面不一样：
1. 从剪掉步骤之前的录屏帧里截出弹窗区域（`ffmpeg -ss T ... -vf crop=w:h:x:y patch/x.png`）。
2. 镜头一开始就用 `<FreezePatch until={N} pieces={[{src, x, y, w, h}]}/>` 把这块区域定格。
3. 用 `<PatchCursor keys=[...]/>` 画一个替身光标从原位置直接走到下一个目标，在 `until` 那一帧交给录屏里的真实光标。
4. 坐标全部用录屏像素。

## 闪变排查清单

- 前后两个镜头的 Video 都必须是同一个源、同一帧（用 `trimBefore` 对齐）。
- 加速段的结尾 `rate` 太高时，最后一帧会跳。可以加一个低速的 `xxReady` 镜头（rate 1.5，xfade 0）过渡。
- 转到全屏成片：先推近节点，点击时用极低 rate 定格（例如 `rate: 0.025`），再让成片从节点矩形 `from={{x,y,w,h}}` 放大到 1920×1080，并和画布叠化重叠约 18 帧。成片的 `trimBefore` 要对齐节点内预览已经播到的位置。
- 每次改完，用半尺寸渲染逐秒抽帧检查（见 oii-feedback-loop）。

## 节奏：操作快、结果慢

- 全局提速只作用在光标移动的镜头上（`rate > 1` 的乘一个 `PACE`，约 1.1）；**结果停留镜头保持原速**，每个核心结果停 1.5–2s（绿点出现、叠加多色、批量结果、高亮、定位、改名、下载完成）。
- 关键的小操作（如在颜色面板里连续点两个颜色）放慢到接近真实速度，否则观众看不清。
- 结束：最后一个结果后直接进入高斯模糊落版（EndCenter），不要再拉回全景之类的多余镜头。

## 多条录屏拼成一镜到底

- `TakeShot` 支持 `src`，一条时间线可以混用多条录屏（如 recA + 补录的 recB）。
- 补录时把画布摆到和原录屏**完全相同的机位**（同样的 `setViewport` 参数），在这个机位上做接缝，再用 4–8 帧 xfade。
- 补录前把画布状态（标签、命名）整理成和视频叙事一致，避免后面的镜头出现“没交代过”的状态。

## 产品自带动画

- 产品自己的聚焦/飞行动画（如点列表名字后画布飞到节点）直接用真实画面，放慢到 0.6× 即可，不要自己用叠化伪造（会被指出不连贯）。
- 飞行落点如果缩略图还没加载（空框），把飞行段提前收尾，叠化到加载完成后的画面。
