import * as THREE from 'three';

/** Brand colours used inside the 3D scene. */
export const BRAND = {
  blue: '#0065C0',
  red: '#F9000D',
  cloudWhite: '#F4F6FF',
  jetBlack: '#181818',
} as const;

const standard = (name: string, params: THREE.MeshStandardMaterialParameters) =>
  Object.assign(new THREE.MeshStandardMaterial(params), { name });

/**
 * Shared prop materials — one instance each, reused by every low-poly prop so
 * the whole garage costs a handful of shader programs.
 * Grey/black tones mirror the dark equipment in the reference photos.
 */
export const MAT = {
  liftBlue: standard('liftBlue', { color: BRAND.blue, metalness: 0.25, roughness: 0.42 }),
  craneRed: standard('craneRed', { color: BRAND.red, metalness: 0.2, roughness: 0.42 }),
  darkMetal: standard('darkMetal', { color: '#2b2e33', metalness: 0.55, roughness: 0.45 }),
  steel: standard('steel', { color: '#aab0b8', metalness: 0.9, roughness: 0.28 }),
  rubber: standard('rubber', { color: BRAND.jetBlack, metalness: 0, roughness: 0.92 }),
  plastic: standard('plastic', { color: '#3b3f45', metalness: 0.05, roughness: 0.62 }),
  screen: standard('screen', {
    color: '#0c1622',
    emissive: new THREE.Color(BRAND.blue),
    emissiveIntensity: 0.45,
    roughness: 0.18,
  }),
};
