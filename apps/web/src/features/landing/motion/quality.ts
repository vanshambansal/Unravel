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
    if (this.samples.length < 120 && (this.elapsed < 2000 || this.samples.length < 12)) return false;
    const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples = [];
    this.elapsed = 0;
    this.badWindows = mean > 48 ? this.badWindows + 1 : 0;
    return this.badWindows >= 3;
  }
  reset() { this.samples = []; this.badWindows = 0; this.elapsed = 0; }
}
