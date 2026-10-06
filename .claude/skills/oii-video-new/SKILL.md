---
name: oii-video-new
description: 开始做一个新的 OiiOii 视频：澄清需求、创建视频目录、写 brief.md、规划素材与结构。Use when the user wants to make a new video ("做一个视频", "新功能宣传片", "做个 PR 视频"), before any recording or code.
---

# 新建视频

## 1. 问清楚（只问会影响做法的）

- 宣传哪个功能？一句话核心卖点是什么？（例：“快速低成本出多个样片，挑一条成片”）
- 给谁看、发在哪里：决定时长和画幅（16:9 1920×1080 / 9:16 1080×1920 / 1:1）
- 素材从哪来：录画布操作 / 用户提供的成片和图片 / 纯动效
- 是否需要真的触发生成（会消耗积分）

## 2. 建目录

```bash
pnpm new <kebab-slug> "标题"     # -> videos/YYYY-MM-<slug>/
pnpm install
pnpm --filter <slug> dev
```

模板里已经带好了水印、渐黑和片尾 Logo。

## 3. 写 brief.md

填写目标、素材表、分镜结构表。用户给的原始素材放到 `public/raw/`，在素材表里写明来源。

## 4. 下一步

- 需要录屏：oii-canvas-record
- 剪辑录屏：oii-one-take-edit
- 包装：oii-brand-package
- 出片：oii-render-release

## 什么时候往 kit 里加东西

只在第二个视频也要用到某个组件时才把它抽进 `packages/kit`，改 kit 时要确认已有视频的渲染没有变化（`pnpm typecheck`，并渲染旧视频的几帧对比）。
