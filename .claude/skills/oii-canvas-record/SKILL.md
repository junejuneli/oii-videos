---
name: oii-canvas-record
description: 录制 OiiOii 画布操作的一镜到底素材：ffmpeg 全屏录制、Chrome 窗口和视口校准、页面内演示光标、React Flow 运镜、录制前检查。Use when the user wants to record a canvas / product demo for an OiiOii video, "录屏", "录一段画布操作", "重新录一遍".
---

# 画布录屏

产出：`videos/<slug>/public/rec/recX.mp4`，3024×1544（1512×772 视口的 Retina 2 倍），30fps。后期所有坐标都用这个“录屏像素”空间（= 视口 CSS 像素 × 2）。

## 录前检查（缺一项就会白录）

1. **Mac 必须解锁、屏幕常亮**。锁屏时 avfoundation 录到的是壁纸。
2. **录制标签页必须在最前面且可见**：先在页面里跑 `scripts/prepare-page.js`（会把标题改成 `REC-TAB …`），再执行 `osascript scripts/front-tab.applescript`，它会把窗口摆到 {0,33,1512,982}，得到 1512×772 视口。
3. 用 `prepare-page.js` 的返回值确认 `visible: "visible"`、`viewport: [1512, 772]`、`store: true`。
4. 产品里会抢镜头的设置（如画布自动聚焦）要征得用户同意后临时关掉，**录完恢复**并告诉用户。
5. 不要动用户自己做的内容（分组、节点、命名）。为了构图可以拖动节点位置，但要先说明。
6. 生成、扣积分、下载这类操作，先问用户再点。

## 录制

```bash
ffmpeg -hide_banner -f avfoundation -list_devices true -i ""   # 找屏幕设备号，通常是 2
cd videos/<slug>/public/rec && exec ffmpeg -hide_banner -loglevel error -y \
  -f avfoundation -capture_cursor 0 -framerate 30 -pixel_format nv12 -i "2:none" \
  -vf "crop=3024:1544:0:420" -c:v h264_videotoolbox -b:v 40M recX.mp4
```

- 用后台方式启动；停止用 `pkill -INT -f "ffmpeg.*recX.mp4"`，等 4 秒，再用 ffprobe 确认时长。不能用 `kill -9`，文件会损坏。
- `crop` 的 y 偏移（420）取决于屏幕分辨率和窗口位置。第一次录先截一帧检查有没有裁准。
- `-capture_cursor 0`：不录系统光标，用页面内的演示光标代替。

## 操作

- 注入 `scripts/demo-cursor.js`，之后每一步都先用 `__demo.move` 移过去，再 `__demo.press()`，然后用真实点击去点同一个位置的元素。演示光标只负责画面，不会触发真实点击。
- 运镜：`__rfStore.getState().panZoom.setViewport({x,y,zoom},{duration:600})`。镜头一次只往一个方向走，不要来回晃。
- 节奏：每个动作之间留 0.5–1 秒的静止画面。后期只能剪静止段，留出静止段后期才好剪。
- 漫长的等待（生成）就让它录着，后期加速。
- 把每一步的录屏时间点记在 `brief.md` 里（`__demo.marks` 里有 Date.now() 时间戳，可以和录制开始时间对齐）。

## 录后

- 抽几帧检查：`ffmpeg -ss T -i recX.mp4 -frames:v 1 /tmp/f.png`
- 更新 `pnpm media:lock`。
