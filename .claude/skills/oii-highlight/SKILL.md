---
name: oii-highlight
description: 在录屏上做标注强调：流光圆角矩形（GlowRect）、点击涟漪、手绘圈、信息气泡，以及如何从录屏帧里精确量出 UI 元素坐标。Use when the user asks to "圈一下", "重点标出", "流光框", "高亮这个按钮", or a highlight is misaligned.
---

# 标注与强调

所有标注都作为镜头的 `overlay` 放进 `TakeShot`，坐标用录屏像素（3024×1544），这样会跟着镜头一起移动和缩放。

## 组件（@oii/kit）

| 组件 | 用途 | 要点 |
|---|---|---|
| `GlowRect` | 流光圆角矩形 | 从左上角开始顺时针快速画（默认 7 帧），画完后有一道白色流光一直绕框转。`at` 是开始帧，`until` 结束（最后 5 帧淡出），`drawFrames={0}` 表示直接显示完整框（用于跨镜头延续） |
| `Ripple` | 点击涟漪 | 录屏里本来就有光标，只补一个涟漪 |
| `HighlightRing` | 手绘椭圆圈 + 标签 | 偏活泼的风格 |
| `Callout` | 贴在 UI 上的信息气泡 | 如“✓ 4 个样片已生成” |

## 量坐标（不要估）

1. 抽出这一刻的原始帧：`ffmpeg -ss <rec秒> -i public/rec/recC.mp4 -frames:v 1 f.png`
2. 裁出目标附近区域放大看，或者用 Python/PIL 求亮像素的边界：
   ```python
   from PIL import Image; import numpy as np
   a = np.asarray(Image.open("f.png").convert("L").crop((x0, y0, x1, y1)))
   ys, xs = np.where(a > 200); print(x0 + xs.min(), x0 + xs.max(), y0 + ys.min(), y0 + ys.max())
   ```
3. 框要比内容四周各多出约 20px 留白，并且**上下居中**于内容（之前被反馈过“偏高了”）。
4. 圆角 `r` 和产品 UI 的圆角保持一致（20–24 比较合适）。

## 规则（来自过往反馈）

- 只圈当前这一步真正要点的东西，但要圈完整：例如“样片模式”要连同右侧的开关一起圈。
- 画框要快、顺时针、一笔画完；出现时机是光标到达之前或者正在点击的时候。
- 一个画面里同时最多一个强调元素。
