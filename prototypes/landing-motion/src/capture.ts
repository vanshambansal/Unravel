import { initializeScene } from './scene';

// Maintenance-only Vite entry. Capture the actual renderer, without UI or duplicated CSS overlays.
const canvas = document.querySelector('canvas')!;
const scene = await initializeScene(canvas, innerWidth <= 700 ? 'mobile' : 'desktop');
scene.resize(innerWidth, innerHeight);
scene.pauseAmbient(true);
scene.updateProgress(new URLSearchParams(location.search).get('frame') === 'hero' ? 1 : 0);
scene.render(0);
document.documentElement.dataset.captureReady = 'true';
window.addEventListener('pagehide', () => scene.dispose(), { once: true });
