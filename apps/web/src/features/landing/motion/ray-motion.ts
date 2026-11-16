/** Bounded, frame-independent pointer damping shared with the hero shader. */
export class RayMotion {
  x = 0;
  y = 0;
  focus = 0;
  private targetX = 0;
  private targetY = 0;
  private active = false;
  point(x: number, y: number, active: boolean) {
    this.active = active;
    this.targetX = active ? Math.max(-1, Math.min(1, x)) * 0.5 : 0;
    this.targetY = active ? Math.max(-1, Math.min(1, y)) * 0.5 : 0;
  }
  update(delta: number) {
    // Frame-rate-independent damping; no overshoot or fresh random seeds.
    const ease = 1 - Math.exp(-Math.max(0, Math.min(delta, 0.05)) * 6);
    this.x += (this.targetX - this.x) * ease;
    this.y += (this.targetY - this.y) * ease;
    this.focus += ((this.active ? 0.5 : 0) - this.focus) * ease;
  }
}
