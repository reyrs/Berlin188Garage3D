import { useEffect, useState } from 'react';

/**
 * - none: no 3D at all (no WebGL2, data saver, weak phone, or ?no3d) — photos + CSS.
 * - mid:  3D without the reflective floor and with fewer particles (phones/tablets).
 * - high: full scene (desktop).
 */
export type DeviceTier = 'pending' | 'none' | 'mid' | 'high';

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectDeviceTier(): Exclude<DeviceTier, 'pending'> {
  const params = new URLSearchParams(window.location.search);
  if (params.has('no3d')) return 'none';
  if (params.has('capture')) return 'high';

  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return 'none';
  if (!hasWebGL2()) return 'none';

  const memory = nav.deviceMemory; // Chromium only; undefined on Safari/Firefox.
  const cores = nav.hardwareConcurrency ?? 8;
  const touchFirst = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 1023px)').matches;

  if (touchFirst && narrow) {
    // Only trust the weak-device signals where the browser actually reports them.
    if (memory !== undefined && (memory <= 3 || cores <= 4)) return 'none';
    return 'mid';
  }
  if ((memory !== undefined && memory <= 4) || cores <= 4) return 'mid';
  return 'high';
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('pending');
  useEffect(() => {
    setTier(detectDeviceTier());
  }, []);
  return tier;
}
