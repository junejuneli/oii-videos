---
name: oii-render-release
description: 渲染与交付：预览渲染、抽帧自查、正式版本渲染（响度 -16 LUFS 母版 + 压缩分享版）、版本命名、发给用户。Use when the user asks to "渲染", "导出", "出一版", "发我看看", or a new version is ready.
---

# 渲染与交付

所有命令都在视频目录下执行（`videos/<slug>/`）。`predev`/`prerender`/`prerelease` 会先把 `brand/` 同步到 `public/brand/`。

## 迭代时：快速预览

```bash
npx remotion render <CompId> out/preview-half.mp4 --scale=0.5 --codec=h264 --crf=26 --log=error
ffmpeg -v error -y -i out/preview-half.mp4 -vf "fps=1,scale=480:-1,tile=6x8" /tmp/contact.jpg   # 每秒一帧的拼图
```

改了哪里就重点看哪里：用 `npx remotion still <CompId> f.png --frame=N` 渲染对应时间点的单帧，看清楚再交付。

## 正式版本

```bash
pnpm release v10
```

会在 `out/` 下生成：
- `<name>-v10.mp4`：母版，h264 crf 18，音频 loudnorm I=-16 TP=-1.5 LRA=11，AAC 192k 48kHz
- `<name>-v10-share.mp4`：分享版，crf 23、faststart，用于聊天发送

## 交付

- 用 SendUserFile 发分享版，说明里写这一版改了哪几点（和反馈逐条对应），并告诉用户母版路径。
- 在 `brief.md` 的迭代记录里补上这一版。
- `out/` 和所有视频文件都不进 git。版本号只增不覆盖，旧版本留在本地方便对比。

## 定稿成品

用户确认成品后（征得同意再发布，仓库是公开的）：
1. 把 1080p 母版发到 GitHub Release，一个成品一个 tag：
   ```bash
   cp out/<name>-vN.mp4 /tmp/oiioii-<name>-vN-1080p.mp4
   gh release create <name>-vN /tmp/oiioii-<name>-vN-1080p.mp4 --repo junejuneli/oii-videos --target main --title "<中文标题> vN（成品）" --notes "规格 + 工程链接"
   ```
2. 视频目录写 `README.md`（GitHub 打开目录自动显示）：封面图 `docs/cover.jpg` + 一张要点截图（从成片截，1280 宽 jpg，会进 git）、下载链接、规格、内容时间表、工程结构、命令。参考 `videos/2026-10-color-tags/README.md`。
3. brief 状态改为“✅ 成品 vN”；根 README 视频列表补上状态和成片链接。
4. 提交并推送。
- 提交 git 前先让用户确认。
