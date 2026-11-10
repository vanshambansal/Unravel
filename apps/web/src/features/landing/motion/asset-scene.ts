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

export interface SceneMetrics {
  drawCalls: number; triangles: number; quality: Quality; pixelRatio: number;
  camera: number[]; ambientTime: number; bloom: number; renderer: string; asset: string;
  environment: { crimsonIntensity: number; edgeIntensity: number; hazeOffset: number; reflectionStrength: number };
}
export interface ArchitecturalScene {
  updateProgress(progress: number): void; resize(width: number, height: number): void;
  pauseAmbient(paused: boolean): void; reduceQuality(): boolean;
  render(delta: number): void; metrics(): SceneMetrics; dispose(): void;
}

function atmosphereTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffff35'); gradient.addColorStop(.4, '#ffffff12'); gradient.addColorStop(1, '#ffffff00');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/** The preview stays visible until the GLB/maps and the first live frame are ready. */
export async function initializeScene(canvas: HTMLCanvasElement, quality: Quality): Promise<ArchitecturalScene> {
  RectAreaLightUniformsLib.init();
  const architecture = await loadArchitecture();
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
  catch (error) { architecture.dispose(); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'desktop' ? 1.25 : 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  // Authored indirect/AO supplies soft architectural grounding. The old punctual
  // shadow map produced hard moving floor bands, unlike a broad ceiling aperture.
  renderer.shadowMap.enabled = false;
  renderer.info.autoReset = false;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05090d');
  scene.fog = new THREE.FogExp2('#0a141b', .01); scene.add(architecture.root);
  const camera = new THREE.PerspectiveCamera(53, 1, .15, 180);

  // Local softbox environment, rather than an unrelated outdoor panorama.
  const studio = new THREE.Scene(); studio.background = new THREE.Color('#27313b');
  const softboxes: THREE.Mesh[] = [];
  for (const [color, x, y, z, rx, ry] of [
    ['#bad6e4', -4, 16, -8, Math.PI / 2, 0],
    ['#7d0c20', 16, 8, -24, 0, -Math.PI / 2],
    ['#344451', -14, 8, -25, 0, Math.PI / 2],
  ] as const) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0); studio.add(mesh); softboxes.push(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .12, .1, 100);
  scene.environment = environment.texture; pmrem.dispose();
  softboxes.forEach(mesh => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });

  const hemisphere = new THREE.HemisphereLight('#9fbccd', '#0a0c10', 1.1); scene.add(hemisphere);
  const cool = new THREE.DirectionalLight('#bed8e5', 2.5); cool.position.set(-10, 24, 10); scene.add(cool);
  const ceilingFill = new THREE.RectAreaLight('#b7d2df', 3.5, 12, 12);
  ceilingFill.position.set(-5, 21, 1); ceilingFill.lookAt(2, 0, -16); scene.add(ceilingFill);
  const overhead = new THREE.SpotLight('#a8c9df', 1150, 110, .6, 1, 1.6);
  overhead.position.set(-8, 24, -5); overhead.target.position.set(2, 0, -30);
  scene.add(overhead, overhead.target);
  // A tall fixture needs an area source, not a concentrated point-light hot spot.
  const doorway = new THREE.RectAreaLight('#f7193c', 5, .5, 15);
  doorway.position.set(6.1, 8, .65); doorway.lookAt(0, 7, 9); scene.add(doorway);
  const crimson = new THREE.RectAreaLight('#ff062c', 4, 7, 12); crimson.position.set(17, 9, -25); crimson.lookAt(3, 3, -30); scene.add(crimson);
  const rear = new THREE.PointLight('#d80b27', 45, 40, 1.4); rear.position.set(14, 5, -58); scene.add(rear);

  let reflection: Reflector | undefined;
  const roughness = architecture.floor?.roughnessMap;
  if (quality === 'desktop' && roughness) {
    reflection = new Reflector(new THREE.PlaneGeometry(84, 144), { color: 0x626c77, textureWidth: 640, textureHeight: 400, clipBias: .004, multisample: 0 });
    reflection.rotation.x = -Math.PI / 2; reflection.position.set(3, -.035, -28);
    const shader = reflection.material as THREE.ShaderMaterial;
    shader.transparent = true; shader.depthWrite = false;
    // Mip filtering integrates a rough reflection continuously; offset taps made
    // narrow emitters appear as several disconnected parallel streaks.
    const reflectedTexture = reflection.getRenderTarget().texture;
    reflectedTexture.generateMipmaps = true;
    reflectedTexture.minFilter = THREE.LinearMipmapLinearFilter;
    shader.uniforms.surfaceRoughness = { value: roughness }; shader.uniforms.reflectionStrength = { value: .3 };
    shader.vertexShader = shader.vertexShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 floorUv;')
      .replace('vUv = textureMatrix', 'vec3 world = (modelMatrix * vec4(position, 1.0)).xyz; floorUv = vec2(world.x / 2.8, 1.0 - world.z / 2.8); vUv = textureMatrix');
    shader.fragmentShader = shader.fragmentShader.replace('uniform vec3 color;', 'uniform vec3 color; uniform sampler2D surfaceRoughness; uniform float reflectionStrength; varying vec2 floorUv;')
      .replace('vec4 base = texture2DProj( tDiffuse, vUv );', `
        float rough = texture2D(surfaceRoughness, floorUv).g;
        vec2 uv = vUv.xy / vUv.w;
        vec4 base = texture2D(tDiffuse, uv, 1.5 + rough * 2.0);
      `)
      .replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );', 'gl_FragColor = vec4(base.rgb, reflectionStrength * (1.0 - rough * .7));');
    scene.add(reflection);
  }

  const atmosphere = atmosphereTexture();
  const haze: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 2; i++) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(22, 8), new THREE.MeshBasicMaterial({ map: atmosphere, color: i ? '#ff2846' : '#8caebf', transparent: true, opacity: .18, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.position.set(i ? 15 : -9, 5 + i, -22 - i * 15); scene.add(mesh); haze.push(mesh);
  }
  // Canvas antialiasing cannot smooth geometry rendered into the composer's target.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .24, .65, 1.15); composer.addPass(bloom);
  const output = new OutputPass(); composer.addPass(output);
  const antialias = new ShaderPass(FXAAShader); // Preserve fine PBR texture; reserve the edge search for architectural contrast.
  antialias.material.fragmentShader = antialias.material.fragmentShader
    .replace('#define EDGE_STEP_COUNT 6', '#define EDGE_STEP_COUNT 3')
    .replace('#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0', '#define EDGE_STEPS 1.0, 2.0, 4.0')
    .replace('_ContrastThreshold = 0.0312', '_ContrastThreshold = 0.08')
    .replace('_RelativeThreshold = 0.063', '_RelativeThreshold = 0.18');
  composer.addPass(antialias);
  let progress = 0, ambient = 0, paused = false, disposed = false;
  let currentQuality = quality, width = 1, height = 1;
  const context = renderer.getContext(), debug = context.getExtension('WEBGL_debug_renderer_info');
  const rendererName = debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : 'WebGL2';
  function updateCamera() {
    const frame = choreography(progress);
    const x = framing(width, height, innerWidth).mobile ? 1.5 + 1.5 * ((frame.camera.x + 3.5) / 6.5) : frame.camera.x;
    camera.position.set(x, frame.camera.y, frame.camera.z); camera.lookAt(frame.look.x, frame.look.y, frame.look.z);
    bloom.strength = (quality === 'desktop' ? .24 : .16) + frame.glow * .32;
    doorway.intensity = 5 + frame.glow * 6;
  }
  function resize() {
    const frame = framing(width, height, innerWidth);
    camera.aspect = frame.aspect; camera.fov = frame.fov; camera.updateProjectionMatrix();
    renderer.setSize(frame.width, frame.height, false); composer.setSize(frame.width, frame.height);
    antialias.uniforms.resolution.value.set(1 / (frame.width * renderer.getPixelRatio()), 1 / (frame.height * renderer.getPixelRatio())); updateCamera();
  }
  return {
    updateProgress(value) { progress = value; updateCamera(); },
    resize(nextWidth, nextHeight) { width = nextWidth; height = nextHeight; resize(); },
    pauseAmbient(value) { paused = value; },
    reduceQuality() {
      if (currentQuality === 'low') return false;
      currentQuality = 'low'; if (reflection) reflection.visible = false;
      renderer.shadowMap.enabled = false; bloom.enabled = false;
      renderer.setPixelRatio(.75); composer.setPixelRatio(.75); resize(); return true;
    },
    render(delta) {
      if (disposed) return;
      if (!paused) ambient += Math.min(delta, .05);
      crimson.intensity = 4 + Math.sin(ambient * .25) * .5;
      crimson.position.z = -25 + Math.sin(ambient * .12) * 3;

      architecture.edges.forEach(material => { material.emissiveIntensity = 1.3 + Math.sin(ambient * .18) * .035; });
      if (reflection) (reflection.material as THREE.ShaderMaterial).uniforms.reflectionStrength.value = .3 + Math.sin(ambient * .24) * .025;
      haze.forEach((mesh, i) => { mesh.position.x = (i ? 15 : -9) + Math.sin(ambient * .08 + i) * 1.6; });
      renderer.info.reset(); composer.render(delta);
    },
    metrics() { return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, quality: currentQuality, pixelRatio: renderer.getPixelRatio(), camera: camera.position.toArray(), ambientTime: ambient, bloom: bloom.enabled ? bloom.strength : 0, renderer: rendererName, asset: 'Blender architecture-v1 / scanned PBR + indirect/AO atlases', environment: { crimsonIntensity: crimson.intensity, edgeIntensity: architecture.edges[0]?.emissiveIntensity ?? 0, hazeOffset: haze[0].position.x, reflectionStrength: reflection ? (reflection.material as THREE.ShaderMaterial).uniforms.reflectionStrength.value : 0 } }; },
    dispose() {
      if (disposed) return; disposed = true; architecture.dispose();
      haze.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); }); atmosphere.dispose();
      antialias.dispose(); reflection?.geometry.dispose(); reflection?.dispose();
      environment.dispose(); overhead.shadow.dispose(); bloom.dispose(); output.dispose(); composer.dispose(); renderer.dispose();
    },
  };
}
