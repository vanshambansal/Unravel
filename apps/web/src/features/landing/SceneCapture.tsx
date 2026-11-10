'use client';
import { useEffect, useRef } from 'react';
import type { ArchitecturalScene } from './motion/scene';

export function SceneCapture({ frame }: { frame: 'start' | 'hero' }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false; let scene: ArchitecturalScene | undefined;
    const node = canvas.current!;
    void import('./motion/scene').then(async ({ initializeScene }) => {
      if (cancelled) return;
      const initialized = await initializeScene(node, innerWidth <= 700 ? 'mobile' : 'desktop');
      if (cancelled) { initialized.dispose(); return; }
      scene = initialized; scene.resize(innerWidth, innerHeight); scene.pauseAmbient(true);
      scene.updateProgress(frame === 'hero' ? 1 : 0); scene.render(0);
      node.dataset.captureReady = 'true';
    }).catch(error => { if (!cancelled) node.dataset.captureError = String(error); });
    return () => { cancelled = true; scene?.dispose(); delete node.dataset.captureReady; };
  }, [frame]);
  return <canvas ref={canvas} style={{ display: 'block', width: '100vw', height: '100vh', objectFit: 'cover' }} />;
}
