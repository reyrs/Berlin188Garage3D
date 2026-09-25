import * as THREE from 'three';
import type { PaintId } from '../data/cars';

interface PaintSpec {
  color: string;
  metalness: number;
  roughness: number;
  clearcoatRoughness: number;
}

/** Car paint copies the colour of the car in each reference photo. */
const PAINTS: Record<PaintId, PaintSpec> = {
  'berlin-blue': { color: '#0065C0', metalness: 0.55, roughness: 0.3, clearcoatRoughness: 0.04 },
  black: { color: '#0b0c0e', metalness: 0.45, roughness: 0.26, clearcoatRoughness: 0.03 },
  graphite: { color: '#4d5157', metalness: 0.62, roughness: 0.32, clearcoatRoughness: 0.05 },
  white: { color: '#eceef2', metalness: 0.08, roughness: 0.28, clearcoatRoughness: 0.04 },
  silver: { color: '#b6bbc2', metalness: 0.85, roughness: 0.3, clearcoatRoughness: 0.05 },
  red: { color: '#dc1420', metalness: 0.52, roughness: 0.28, clearcoatRoughness: 0.04 },
};

/** Re-paint an existing material in place (used between service steps). */
export function applyPaint(material: THREE.MeshPhysicalMaterial, id: PaintId): void {
  const spec = PAINTS[id];
  material.color.set(spec.color);
  material.metalness = spec.metalness;
  material.roughness = spec.roughness;
  material.clearcoatRoughness = spec.clearcoatRoughness;
  material.name = `paint:${id}`;
}

export function createPaint(id: PaintId): THREE.MeshPhysicalMaterial {
  const spec = PAINTS[id];
  return Object.assign(
    new THREE.MeshPhysicalMaterial({
      color: spec.color,
      metalness: spec.metalness,
      roughness: spec.roughness,
      clearcoat: 1,
      clearcoatRoughness: spec.clearcoatRoughness,
    }),
    { name: `paint:${id}` },
  );
}

