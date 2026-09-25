import * as THREE from 'three';
import { BRAND } from './materials';

/**
 * "Materialise" effect for a car (adapted from the noctis-hypercar project):
 * fragments are discarded by 3D noise + a front-to-back sweep, and the moving
 * edge glows Berlin Red — the car is scanned into the bay nose first.
 *
 * uDissolve: 1 = invisible, 0 = solid. uCarInv puts the noise in car space so
 * it does not swim when the car moves.
 */
export interface Dissolve {
  uniforms: {
    uDissolve: { value: number };
    uEdgeColor: { value: THREE.Color };
    uCarInv: { value: THREE.Matrix4 };
    uHalfLength: { value: number };
  };
  apply: <M extends THREE.Material>(material: M) => M;
}

export function createDissolve(halfLength = 2.4): Dissolve {
  const uniforms = {
    uDissolve: { value: 0 },
    uEdgeColor: { value: new THREE.Color(BRAND.red) },
    uCarInv: { value: new THREE.Matrix4() },
    uHalfLength: { value: halfLength },
  };

  function apply<M extends THREE.Material>(material: M): M {
    const previous = material.onBeforeCompile;
    material.onBeforeCompile = (shader, renderer) => {
      previous?.call(material, shader, renderer);
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform mat4 uCarInv;\nvarying vec3 vCarPos;')
        .replace(
          '#include <fog_vertex>',
          '#include <fog_vertex>\nvCarPos = (uCarInv * modelMatrix * vec4(transformed, 1.0)).xyz;',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
uniform float uDissolve;
uniform vec3 uEdgeColor;
uniform float uHalfLength;
varying vec3 vCarPos;
float dHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float dNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dHash(i), dHash(i + vec3(1, 0, 0)), f.x), mix(dHash(i + vec3(0, 1, 0)), dHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(dHash(i + vec3(0, 0, 1)), dHash(i + vec3(1, 0, 1)), f.x), mix(dHash(i + vec3(0, 1, 1)), dHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}`,
        )
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
// Nose (+x) materialises first; noise breaks the front into grains.
float dv = dNoise(vCarPos * 5.0) * 0.45 + clamp((uHalfLength + vCarPos.x) / (2.0 * uHalfLength), 0.0, 1.0) * 0.55;
float dTh = uDissolve * 1.12 - 0.06;
if (dv < dTh) discard;
float dEdge = (1.0 - smoothstep(0.0, 0.05, dv - dTh)) * step(0.001, uDissolve) * step(uDissolve, 0.999);`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          // Luminance ~2.8: well above the bloom threshold (2), so the edge glows.
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdgeColor * dEdge * 14.0;',
        );
    };
    material.customProgramCacheKey = () => `dissolve-${material.type}-${material.name}`;
    material.needsUpdate = true;
    return material;
  }

  return { uniforms, apply };
}
