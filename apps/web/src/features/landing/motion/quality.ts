export type Quality = 'desktop' | 'mobile' | 'low';
/** Sustained poor rendering, rather than a single shader-compilation hitch, triggers fallback. */
export class PerformanceGuard {
  private samples: number[] = [];
  private badWindows = 0;
  push(milliseconds: number) {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return false;
    this.samples.push(Math.min(milliseconds, 250));
    if (this.samples.length < 120) return false;
    const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples = [];
    this.badWindows = mean > 48 ? this.badWindows + 1 : 0;
    return this.badWindows >= 3;
  }
  reset() { this.samples = []; this.badWindows = 0; }
}
