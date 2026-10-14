/** Edit tables for the real screen recordings (1512x772 viewport coordinates). */
export type Seg = [from: number, to: number, speed: number];

export const SEGS: Record<string, Seg[]> = {
  G01: [[9.5, 26, 1], [62, 110, 2], [110, 122, 1], [122, 214, 12], [214, 228, 1]],
  G02: [[9.5, 26, 1], [62, 92, 1.5], [92, 100, 1]],
  G04: [[10, 14, 1], [40, 90, 1.5], [90, 122, 4], [122, 150, 1.5], [150, 166, 1], [166, 286, 16], [294, 356, 16], [356, 368, 1]],
};

/** original recording time -> time inside the edited clip (seconds). */
export const clipT = (clip: string, t: number): number => {
  let acc = 0;
  for (const [a, b, sp] of SEGS[clip]) {
    if (t < a) return acc;
    if (t <= b) return acc + (t - a) / sp;
    acc += (b - a) / sp;
  }
  return acc;
};

export type Rect4 = [x: number, y: number, w: number, h: number];
export type Cue = { a: number; b: number; rect?: Rect4; label?: string; sticker?: boolean; mask?: boolean };
export type Cam = [t: number, cx: number, cy: number, z: number];
export type TypeCue = { a: number; b: number; text: string; rect: Rect4 };

export type RecPlan = { cues: Cue[]; cam: Cam[]; type?: TypeCue; };

export const PLANS: Record<string, RecPlan> = {
  // G01 is a freshly recorded take with real element rects (see brief.md); no camera zoom:
  // the full image + toolbar + prompt box stay visible the whole time.
  G01: {
    cam: [],
    cues: [
      { a: 1.0, b: 3.6, rect: [350, 530, 830, 242], mask: true },
      { a: 0.2, b: 1.5, rect: [580, 254, 354, 264], label: "① 点选要改的图" },
      { a: 1.6, b: 3.4, rect: [364, 188, 98, 34], label: "② 点「局部编辑」" },
      { a: 5.0, b: 6.6, rect: [600, 187, 62, 24], label: "③ 默认就是「涂抹」" },
      { a: 7.3, b: 10.0, rect: [596, 392, 296, 140], label: "④ 涂在要改的地方" },
      { a: 10.3, b: 19.2, rect: [482, 622, 548, 46], label: "⑤ 说一句话，想要什么直接说" },
      { a: 19.4, b: 20.7, rect: [1000, 740, 32, 32], label: "⑥ 点提交" },
      { a: 21.3, b: 25.4, rect: [1028, 236, 400, 300], label: "✓ 得到：新图", sticker: true },
    ],
    type: { a: 10.6, b: 16, text: "把涂抹的卫衣改成奶油黄色，花束保持不变", rect: [478, 612, 556, 62] },
  },
  // G02 v3: re-recorded with real element rects (toolbar 局部编辑 -> 框选 -> box 1 -> prompt -> send -> compare).
  G02: {
    cam: [],
    cues: [
      { a: 5.6, b: 8.2, rect: [580, 254, 354, 264], label: "① 点选要改的图" },
      { a: 8.2, b: 10.8, rect: [401, 189, 103, 36], label: "② 点「局部编辑」" },
      { a: 53.0, b: 56.0, rect: [667, 187, 62, 24], label: "③ 切到「框选」" },
      { a: 73.3, b: 76.0, rect: [676, 266, 104, 102], label: "④ 框住要改的地方（编号 1）" },
      { a: 76.2, b: 78.0, rect: [482, 622, 548, 46], label: "⑤ 一处一句话" },
      { a: 78.1, b: 80.0, rect: [1000, 740, 32, 32], label: "⑥ 点提交" },
      { a: 82.5, b: 87.5, label: "✓ 得到：新图", sticker: true },
      { a: 88.6, b: 91.0, rect: [556, 226, 872, 310], label: "⑦ 拖框选中原图和新图" },
      { a: 99.6, b: 102.0, rect: [1079, 86, 36, 32], label: "⑧ 点「对比」" },
      { a: 102.2, b: 113.6, label: "拖动滑条：脸变了，花没变" },
    ],
    type: { a: 76.3, b: 77.9, text: "1: 表情改为张大嘴大笑，露出牙齿，其余不变", rect: [482, 622, 548, 46] },
  },
  // G04 v2: re-recorded with real element rects, tight box -> auto label -> dropdown -> chip -> paint -> prompt -> send.
  G04: {
    cam: [],
    cues: [
      { a: 0.7000000000000002, b: 4.3, rect: [486, 250, 360, 270], label: "① 点选要改的图" },
      { a: 3.7, b: 6.1, rect: [311, 188, 103, 36], label: "② 点「局部编辑」" },
      { a: 23.9, b: 38.2, rect: [482, 561, 52, 52], label: "③ 点「引用」" },
      { a: 38.5, b: 43.9, rect: [1320, 434, 32, 32], label: "④ 在参考图上框住要引用的东西" },
      { a: 43.9, b: 53.4, rect: [1356, 436, 28, 28], label: "⑤ 点星标：自动识别" },
      { a: 53.4, b: 62.7, rect: [1322, 418, 98, 22], label: "⑥ 识别不准？点标签自己选", sticker: true },
      { a: 62.7, b: 68.5, rect: [1322, 434, 36, 36], label: "⑦ 点选框，确认引用" },
      { a: 68.5, b: 69.6, rect: [735, 340, 80, 100], label: "⑧ 涂在要放的地方" },
      { a: 69.6, b: 74.5, rect: [482, 622, 548, 46], label: "⑨ 补一句话" },
      { a: 74.5, b: 76.5, rect: [1000, 740, 32, 32], label: "⑩ 点提交" },
      { a: 88.2, b: 102.7, label: "✓ 得到：新图", sticker: true },
    ],
  },
};
