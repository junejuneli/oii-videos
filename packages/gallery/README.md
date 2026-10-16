# @oii/gallery

所有可复用组件（`@oii/kit`）的实时预览页：每张卡片直接运行 kit 源码，背后的画布是示意。点卡片放大，带播放控制和声音。

```bash
pnpm gallery          # 构建到 packages/gallery/dist/
pnpm gallery:serve    # 构建并打开 http://localhost:4173
```

- 新增或修改 kit 组件后，在 `src/previews.tsx` 里加一个预览，并在 `index.html` 里加一张卡片。
- SweepTransition 的预览默认用两段画布示意。要看和 hogi-marketing-kit 一模一样的扫光 demo，把它仓库里的 `assets/video-sweep/source-a.mp4`、`source-b.mp4` 复制成本目录下的 `media/sweep-a.mp4`、`media/sweep-b.mp4`（不进 git），再重新构建。
- 字体、Logo、水印等都从仓库根目录的 `brand/` 复制进 `dist/brand/`，和视频里的 `BRAND.*` 是同一份文件。
