export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const journeyTiming = { cameraViewports: 2, fullReveal: .9, holdViewports: .75 } as const;
export const journeyViewports = 1 + journeyTiming.cameraViewports * journeyTiming.fullReveal + journeyTiming.holdViewports;
export function smoothRange(value: number, start: number, end: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}
/** Pure and reversible. Ambient time never changes the camera or presentation progress. */
export function choreography(progress: number) {
  const p = clamp(progress);
  const travel = smoothRange(p, 0, .75);
  const approach = smoothRange(p, 0, .45);
  return {
    camera: { x: -3.5 + 6.5 * approach, y: 3.7, z: 23 - 41 * travel },
    look: { x: 3, y: 5.5 - 1.1 * smoothRange(p, .5, .75), z: -55 },
    glow: Math.sin(Math.PI * smoothRange(p, .32, .72)),
    entrance: 1 - smoothRange(p, .04, .3),
    eyebrow: smoothRange(p, .73, .82),
    title: smoothRange(p, .75, .84),
    description: smoothRange(p, .8, .88),
    actions: smoothRange(p, .86, journeyTiming.fullReveal),
  };
}
