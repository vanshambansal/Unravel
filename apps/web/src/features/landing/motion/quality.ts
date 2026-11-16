export type Quality = 'desktop' | 'mobile' | 'low';
/** Sustained poor rendering, rather than a single shader-compilation hitch, triggers fallback. */
export class PerformanceGuard {
  private samples: number[] = [];
  private badWindows = 0;
  private elapsed = 0;
  push(milliseconds: number) {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return false;
    this.samples.push(Math.min(milliseconds, 250));
    this.elapsed += milliseconds;
    // Keep the normal 120-frame window, but don't wait minutes on a stalled GPU.
    // Twelve samples and three bad windows still reject isolated startup hitches.
    if (this.samples.length < 120 && (this.elapsed < 2000 || this.samples.length < 12))
      return false;
    const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples = [];
    this.elapsed = 0;
    this.badWindows = mean > 48 ? this.badWindows + 1 : 0;
    return this.badWindows >= 3;
  }
  reset() {
    this.samples = [];
    this.badWindows = 0;
    this.elapsed = 0;
  }
}

/** Require repeated missed frame budgets before a small resolution adjustment. */
export class ResolutionGuard {
  private samples: number[] = [];
  private poorWindows = 0;
  private warmup = 30;
  push(milliseconds: number): boolean {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return false;
    if (this.warmup > 0) {
      this.warmup--;
      return false;
    }
    this.samples.push(milliseconds);
    if (this.samples.length < 60) return false;
    this.samples.sort((a, b) => a - b);
    const slow = this.samples[45] > 20;
    this.samples = [];
    this.poorWindows = slow ? this.poorWindows + 1 : 0;
    if (this.poorWindows < 2) return false;
    this.poorWindows = 0;
    return true;
  }
  reset() {
    this.samples = [];
    this.poorWindows = 0;
    this.warmup = 30;
  }
}
