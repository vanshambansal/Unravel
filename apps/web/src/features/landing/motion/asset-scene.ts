import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { choreography } from './choreography';
import { framing } from './framing';
import { loadArchitecture } from './architecture';
import type { Quality } from './quality';

/** Broad glow does not need the scene's fine-edge raster budget. */
class ArchitecturalBloom extends UnrealBloomPass {
  override setSize(width: number, height: number) {
    super.setSize(Math.max(1, Math.round(width * 0.65)), Math.max(1, Math.round(height * 0.65)));
  }
}

export interface SceneMetrics {
  drawCalls: number;
  triangles: number;
  quality: Quality;
  pixelRatio: number;
  resolutionScale: number;
  camera: number[];
  ambientTime: number;
  bloom: number;
  renderer: string;
  asset: string;
  environment: {
    crimsonIntensity: number;
    edgeIntensity: number;
    hazeOffset: number;
    reflectionStrength: number;
  };
}
export interface ArchitecturalScene {
  updateProgress(progress: number): void;
  resize(width: number, height: number): void;
  pauseAmbient(paused: boolean): void;
  reduceResolution(): boolean;
  reduceQuality(): boolean;
  render(delta: number): void;
  metrics(): SceneMetrics;
  dispose(): void;
}

function atmosphereTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffff35');
  gradient.addColorStop(0.4, '#ffffff12');
  gradient.addColorStop(1, '#ffffff00');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/** The preview stays visible until the GLB/maps and the first live frame are ready. */
export async function initializeScene(
  canvas: HTMLCanvasElement,
  quality: Quality,
): Promise<ArchitecturalScene> {
  RectAreaLightUniformsLib.init();
  const architecture = await loadArchitecture();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    architecture.dispose();
    throw error;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'desktop' ? 1.25 : 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  // Authored indirect/AO supplies soft architectural grounding. The old punctual
  // shadow map produced hard moving floor bands, unlike a broad ceiling aperture.
  renderer.shadowMap.enabled = false;
  renderer.info.autoReset = false;
  architecture.root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture)
          value.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    }
  });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05090d');
  scene.fog = new THREE.FogExp2('#0a141b', 0.01);
  scene.add(architecture.root);
  const camera = new THREE.PerspectiveCamera(53, 1, 0.15, 180);

  // Local softbox environment, rather than an unrelated outdoor panorama.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#27313b');
  const softboxes: THREE.Mesh[] = [];
  for (const [color, x, y, z, rx, ry] of [
    ['#bad6e4', -4, 16, -8, Math.PI / 2, 0],
    ['#7d0c20', 16, 8, -24, 0, -Math.PI / 2],
    ['#344451', -14, 8, -25, 0, Math.PI / 2],
  ] as const) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    studio.add(mesh);
    softboxes.push(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.12, 0.1, 100);
  scene.environment = environment.texture;
  pmrem.dispose();
  softboxes.forEach((mesh) => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });

  const hemisphere = new THREE.HemisphereLight('#9fbccd', '#0a0c10', 1.1);
  scene.add(hemisphere);
  const cool = new THREE.DirectionalLight('#bed8e5', 2.5);
  cool.position.set(-10, 24, 10);
  scene.add(cool);
  const ceilingFill = new THREE.RectAreaLight('#b7d2df', 3.5, 12, 12);
  ceilingFill.position.set(-5, 21, 1);
  ceilingFill.lookAt(2, 0, -16);
  scene.add(ceilingFill);
  const overhead = new THREE.SpotLight('#a8c9df', 1150, 110, 0.6, 1, 1.6);
  overhead.position.set(-8, 24, -5);
  overhead.target.position.set(2, 0, -30);
  scene.add(overhead, overhead.target);
  // A tall fixture needs an area source, not a concentrated point-light hot spot.
  const doorway = new THREE.RectAreaLight('#f7193c', 1.8, 0.12, 15);
  doorway.position.set(6.43, 8, 0.84);
  doorway.lookAt(0, 7, 9);
  scene.add(doorway);
  const crimson = new THREE.RectAreaLight('#ff062c', 4, 7, 12);
  crimson.position.set(17, 9, -25);
  crimson.lookAt(3, 3, -30);
  scene.add(crimson);
  const rear = new THREE.PointLight('#d80b27', 45, 40, 1.4);
  rear.position.set(14, 5, -58);
  scene.add(rear);

  let reflection: Reflector | undefined;
  let reflectionDirty = true,
    reflectedAt = -1;
  const roughness = architecture.floor?.roughnessMap;
  if (quality === 'desktop' && roughness) {
    reflection = new Reflector(new THREE.PlaneGeometry(84, 144), {
      color: 0x626c77,
      textureWidth: 768,
      textureHeight: 512,
      clipBias: 0.004,
      multisample: 2,
    });
    reflection.rotation.x = -Math.PI / 2;
    reflection.position.set(3, -0.035, -28);
    const shader = reflection.material as THREE.ShaderMaterial;
    shader.transparent = true;
    shader.depthWrite = false;
    // Mip filtering integrates a rough reflection continuously; offset taps made
    // narrow emitters appear as several disconnected parallel streaks.
    const reflectedTexture = reflection.getRenderTarget().texture;
    reflectedTexture.generateMipmaps = true;
    reflectedTexture.minFilter = THREE.LinearMipmapLinearFilter;
    shader.uniforms.surfaceRoughness = { value: roughness };
    shader.uniforms.reflectionStrength = { value: 0.3 };
    shader.vertexShader = shader.vertexShader
      .replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 floorUv;')
      .replace(
        'vUv = textureMatrix',
        'vec3 world = (modelMatrix * vec4(position, 1.0)).xyz; floorUv = vec2(world.x / 2.8, 1.0 - world.z / 2.8); vUv = textureMatrix',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'uniform vec3 color;',
        'uniform vec3 color; uniform sampler2D surfaceRoughness; uniform float reflectionStrength; varying vec2 floorUv;',
      )
      .replace(
        'vec4 base = texture2DProj( tDiffuse, vUv );',
        `
        float rough = texture2D(surfaceRoughness, floorUv).g;
        vec2 uv = vUv.xy / vUv.w;
        vec4 base = texture2D(tDiffuse, uv, 1.5 + rough * 2.0);
      `,
      )
      .replace(
        'gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
        'gl_FragColor = vec4(base.rgb, reflectionStrength * (1.0 - rough * .7));',
      );
    scene.add(reflection);
    const updateReflection = reflection.onBeforeRender.bind(reflection);
    reflection.onBeforeRender = (...args) => {
      // Every moving-camera frame is fresh. At rest, only the very slow haze
      // changes; reuse its reflection briefly instead of rendering the room twice.
      if (!reflectionDirty && ambient - reflectedAt < 0.1) return;
      updateReflection(...args);
      reflectionDirty = false;
      reflectedAt = ambient;
    };
  }

  const atmosphere = atmosphereTexture();
  const haze: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 2; i++) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 8),
      new THREE.MeshBasicMaterial({
        map: atmosphere,
        color: i ? '#ff2846' : '#8caebf',
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    mesh.position.set(i ? 15 : -9, 5 + i, -22 - i * 15);
    scene.add(mesh);
    haze.push(mesh);
  }
  // Canvas antialiasing cannot smooth geometry rendered into the composer's target.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new ArchitecturalBloom(new THREE.Vector2(512, 512), 0.18, 0.65, 1.25);
  composer.addPass(bloom);
  const output = new OutputPass();
  composer.addPass(output);
  const antialias = new ShaderPass(FXAAShader);
  // Full edge search keeps narrow architectural highlights continuous.
  composer.addPass(antialias);
  let progress = 0,
    ambient = 0,
    paused = false,
    disposed = false,
    sceneDirty = true;
  let currentQuality = quality,
    width = 1,
    height = 1;
  const originalRatio = renderer.getPixelRatio();
  let resolutionScale = 1;
  const context = renderer.getContext(),
    debug = context.getExtension('WEBGL_debug_renderer_info');
  const rendererName = debug
    ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    : 'WebGL2';
  function updateCamera() {
    const frame = choreography(progress);
    const x = framing(width, height, innerWidth).mobile
      ? 1.5 + 1.5 * ((frame.camera.x + 3.5) / 6.5)
      : frame.camera.x;
    camera.position.set(x, frame.camera.y, frame.camera.z);
    camera.lookAt(frame.look.x, frame.look.y, frame.look.z);
    bloom.strength = (quality === 'desktop' ? 0.18 : 0.12) + frame.glow * 0.16;
    doorway.intensity = 1.8 + frame.glow * 1.4;
  }
  function resize() {
    reflectionDirty = sceneDirty = true;
    const frame = framing(width, height, innerWidth);
    camera.aspect = frame.aspect;
    camera.fov = frame.fov;
    camera.updateProjectionMatrix();
    renderer.setSize(frame.width, frame.height, false);
    composer.setSize(frame.width, frame.height);
    antialias.uniforms.resolution.value.set(
      1 / (frame.width * renderer.getPixelRatio()),
      1 / (frame.height * renderer.getPixelRatio()),
    );
    updateCamera();
  }
  const api: ArchitecturalScene = {
    updateProgress(value) {
      if (value === progress) return;
      reflectionDirty = sceneDirty = true;
      progress = value;
      updateCamera();
    },
    resize(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      resize();
    },
    pauseAmbient(value) {
      paused = value;
    },
    reduceResolution() {
      const minimumScale = Math.min(1, 1 / originalRatio);
      if (currentQuality === 'low' || resolutionScale <= minimumScale) return false;
      resolutionScale = Math.max(minimumScale, Math.round((resolutionScale - 0.1) * 10) / 10);
      renderer.setPixelRatio(originalRatio * resolutionScale);
      composer.setPixelRatio(originalRatio * resolutionScale);
      resize();
      return true;
    },
    reduceQuality() {
      if (currentQuality === 'low') return false;
      currentQuality = 'low';
      resolutionScale = 0.75 / originalRatio;
      if (reflection) reflection.visible = false;
      renderer.shadowMap.enabled = false;
      bloom.enabled = false;
      renderer.setPixelRatio(0.75);
      composer.setPixelRatio(0.75);
      resize();
      return true;
    },
    render(delta) {
      if (disposed) return;
      if (!paused) ambient += Math.min(delta, 0.05);
      if (!sceneDirty) {
        renderer.info.reset();
        return;
      }
      // Anchored illumination and haze reuse their last frame until input changes.
      crimson.intensity = 4;
      architecture.edges.forEach((material) => {
        material.emissiveIntensity = 1;
      });
      haze.forEach((mesh, i) => {
        mesh.position.x = (i ? 15 : -9) + Math.sin(i) * 1.6;
      });
      renderer.info.reset();
      composer.render(delta);
      sceneDirty = false;
    },
    metrics() {
      return {
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        quality: currentQuality,
        pixelRatio: renderer.getPixelRatio(),
        resolutionScale,
        camera: camera.position.toArray(),
        ambientTime: ambient,
        bloom: bloom.enabled ? bloom.strength : 0,
        renderer: rendererName,
        asset: 'Blender architecture-v1 / scanned PBR + indirect/AO atlases',
        environment: {
          crimsonIntensity: crimson.intensity,
          edgeIntensity: architecture.edges[0]?.emissiveIntensity ?? 0,
          hazeOffset: haze[0].position.x,
          reflectionStrength: reflection
            ? (reflection.material as THREE.ShaderMaterial).uniforms.reflectionStrength.value
            : 0,
        },
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      architecture.dispose();
      haze.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      atmosphere.dispose();
      antialias.dispose();
      reflection?.geometry.dispose();
      reflection?.dispose();
      environment.dispose();
      overhead.shadow.dispose();
      bloom.dispose();
      output.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
  // Prepare PBR programs through KHR_parallel_shader_compile before the first
  // visible frame. Keep the poster and controls responsive while the driver works.
  try {
    // Match RenderPass's offscreen target: compiling for the default framebuffer
    // prepares different tone-mapping/color-space variants and stalls again later.
    renderer.setRenderTarget(composer.readBuffer);
    await renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(null);
    return api;
  } catch (error) {
    api.dispose();
    throw error;
  }
}
