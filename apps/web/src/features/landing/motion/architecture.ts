import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadArchitecture() {
  const loader = new THREE.TextureLoader();
  const results = await Promise.allSettled([
    new GLTFLoader().loadAsync('/landing/architecture/atrium.glb'),
    loader.loadAsync('/landing/architecture/indirect-light.png'),
    loader.loadAsync('/landing/architecture/ambient-occlusion.png'),
  ]);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const root = results[0].status === 'fulfilled' ? results[0].value.scene : undefined;
  if (root) root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const result of results.slice(1)) if (result.status === 'fulfilled' && result.value instanceof THREE.Texture) textures.add(result.value);
  const dispose = () => {
    geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    textures.forEach(value => { value.dispose(); if (value.image instanceof ImageBitmap) value.image.close(); });
  };
  if (results.some(result => result.status === 'rejected')) { dispose(); throw new Error('Architectural asset loading failed'); }
  const light = results[1].status === 'fulfilled' ? results[1].value as THREE.Texture : undefined;
  const ao = results[2].status === 'fulfilled' ? results[2].value as THREE.Texture : undefined;
  if (!root || !light || !ao) { dispose(); throw new Error('Incomplete architectural assets'); }
  light.flipY = ao.flipY = false; light.channel = ao.channel = 1;
  light.colorSpace = THREE.LinearSRGBColorSpace; ao.colorSpace = THREE.NoColorSpace;
  const edges: THREE.MeshStandardMaterial[] = [];
  let floor: THREE.MeshStandardMaterial | undefined;
  root.updateMatrixWorld(true);
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    // Narrow authored strip boxes undersample at distance. Correct only this named
    // emitter mesh, keeping walls, UVs and genuinely occluded surfaces unchanged.
    if (node.material instanceof THREE.MeshStandardMaterial && node.material.name.includes('edge emitter')) {
      const positions = node.geometry.getAttribute('position') as THREE.BufferAttribute;
      const groups = new Map<number, { indices: number[]; bounds: THREE.Box3 }>();
      const point = new THREE.Vector3(), inverse = node.matrixWorld.clone().invert();
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(node.matrixWorld);
        const key = Math.round(point.z * 2);
        if (!groups.has(key)) groups.set(key, { indices: [], bounds: new THREE.Box3() });
        const group = groups.get(key)!; group.indices.push(i); group.bounds.expandByPoint(point);
      }
      for (const { indices, bounds } of groups.values()) {
        const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
        if (size.x >= .16 || size.z > .2 || size.y < 2) continue;
        const width = .12, depth = size.z, right = bounds.max.x;
        for (const i of indices) {
          point.fromBufferAttribute(positions, i).applyMatrix4(node.matrixWorld);
          point.x = right - width + (point.x - bounds.min.x) / size.x * width;
          point.z = center.z + (point.z - center.z) / size.z * depth;
          point.applyMatrix4(inverse); positions.setXYZ(i, point.x, point.y, point.z);
        }
      }
      positions.needsUpdate = true; node.geometry.computeBoundingBox(); node.geometry.computeBoundingSphere();
    }
    node.receiveShadow = true;
    for (const mat of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      mat.lightMap = light; mat.lightMapIntensity = 1.5;
      mat.aoMap = ao; mat.aoMapIntensity = .55;
      mat.envMapIntensity = .6; mat.side = THREE.FrontSide;
      if (mat.name.includes('Cold ceiling')) {
        mat.emissiveIntensity = .55;
        mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -2;
      }
      if (mat.name.includes('Recessed crimson')) mat.emissiveIntensity = 1.6;
      node.castShadow = !mat.name.includes('basalt');
      if (mat.name.includes('basalt')) floor = mat;
      if (mat.name.includes('edge emitter')) {
        // Separate flush emitters from the wall in the depth buffer as the camera moves.
        mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -2;
        edges.push(mat);
      }
      mat.needsUpdate = true;
    }
  });
  return { root, floor, edges, dispose };
}
