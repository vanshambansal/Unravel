/** Poster and renderer share an intrinsic composition; both are cropped with object-fit: cover. */
export function framing(width: number, _height: number, viewportWidth = width) {
  const mobile = viewportWidth <= 700;
  const aspect = mobile ? 390 / 844 : 1440 / 900;
  // Canonical raster sizes preserve the exact crop/pixel grid of each source poster.
  // CSS cover handles viewport variation; the existing pixel-ratio cap bounds GPU cost.
  return {
    mobile,
    aspect,
    width: mobile ? 390 : 1440,
    height: mobile ? 844 : 900,
    fov: mobile ? 64 : 53,
  };
}
