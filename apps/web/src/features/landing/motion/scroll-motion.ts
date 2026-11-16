/** Follow discrete scroll targets at the same rate on different refresh rates. */
export function advanceScroll(current: number, target: number, seconds: number): number {
  const destination = Math.max(0, Math.min(1, target));
  if (Math.abs(destination - current) < 0.0001) return destination;
  // A short filter removes discrete wheel steps without a long trailing camera.
  return (
    current + (destination - current) * -Math.expm1(-48 * Math.max(0, Math.min(seconds, 0.25)))
  );
}
