/** Set by build.mjs: true when media/sweep-a.mp4 and media/sweep-b.mp4 are present. */
declare const __SWEEP_CLIPS__: boolean;

interface Window {
  oiiPreview?: { setFocus(id: string | null): void };
}
