# Architectural asset study v1

Approved on 2026-11-09: use installed Blender 4.2 and a small set of free CC0 materials to improve the existing prototype. This is a programmatically authored Blender asset study, not a claim of final reference-level photorealism or a purchased architectural scene.

## Contents

- `unravel-architecture.blend`: editable geometry, PBR materials, lights and two cameras. Texture paths are project-relative; retain the processed maps under the prototype's public/architecture directory.
- `build-scene.py`: reproducible arrangement, UVs, bevels, bakes, GLB export and two offline look-development renders.
- `textures/` and `texture-provenance.json`: six original 1K JPG colour/normal/roughness maps from Poly Haven, with download URLs, MD5 hashes, sizes and license link. Concrete Wall 006 and Concrete Floor Worn 02 are [CC0 assets](https://polyhaven.com/license).
- `blender-opening.png` / `blender-hero.png`: offline Cycles reference renders, not runtime posters. The WebGL renderer has its own lighting; its output must be reviewed independently.
- `build-report.json`: actual Blender version, build duration and geometry counts. The latest full build used Blender 4.2.1 LTS, CPU/6 threads, 24 samples and took 157.92 seconds. The shell has 1,760 vertices, 1,762 polygons and six material slots.

## Rebuild

From the repository root, in PowerShell:

```powershell
& ./design/assets/architecture-v1/download-textures.ps1
$env:BLENDER_USER_CONFIG = "$PWD/.cache/blender-config"
& 'C:/Program Files/Blender Foundation/Blender 4.2/blender.exe' --background --factory-startup --python "$PWD/design/assets/architecture-v1/build-scene.py"
```

The script writes an approximately 1.98MB GLB, a 1K indirect-light atlas and a separate 1K AO atlas to `prototypes/landing-motion/public/architecture`. It also writes processed material copies needed by the editable Blender file. GLB PBR textures are embedded, so those JPG copies are not fetched separately at runtime. Original downloads are preserved. Backups created by Blender are ignored, not deleted.

Source portability check:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 4.2/blender.exe' --background "$PWD/design/assets/architecture-v1/unravel-architecture.blend" --python "$PWD/design/assets/architecture-v1/inspect-source.py"
```

The check reopened the source, confirmed all six referenced images exist via relative paths, and exited 0. This Blender installation emits a nonfatal TBB allocator warning on stderr; do not infer success or failure solely from PowerShell's treatment of that stderr. Check the process exit code, completion report and outputs.

## Runtime integration and boundaries

The browser uses native Three.js GLTFLoader, a separate light/AO UV channel, scanned normal/roughness maps, filtered local environment fill and broad area lights. Static indirect light is baked; one live overhead spot updates its shadow at a bounded cadence. Desktop has a masked planar floor reflection. The light-shaft mesh is a depth-tested approximation, not physically simulated volumetric scattering. Mobile omits expensive reflection/shadow work.

After rebuilding, regenerate all four browser-derived posters with the prototype's capture script, stamp their manifest and run its checks/build. The hash guard includes the GLB and both bake atlases. Do not substitute either offline Cycles render as a browser preview: first-frame continuity depends on captures of the actual WebGL scene.

No add-on, MCP server, paid asset, account or new npm dependency was installed. The next gate is user review of the opening and hero in the browser; the rest of the landing page remains deferred.
