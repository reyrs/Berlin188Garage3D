export interface CarSource {
  url: string;
  yaw: number;
  length: number;
  isFerrari?: boolean;
}

/**
 * Resolves the 3D car model to display in the garage.
 * When bmw-3-g20.glb is placed in /models, it automatically uses it;
 * otherwise it seamlessly falls back to the Ferrari stand-in preview model.
 */
export async function resolveCar(): Promise<CarSource> {
  try {
    const res = await fetch('/models/bmw-3-g20.glb', { method: 'HEAD' });
    const contentType = res.headers.get('content-type') || '';
    // Vite SPA fallback returns 200 OK with index.html (text/html) for missing assets.
    // A real GLB asset will have model/gltf-binary or octet-stream, never text/html.
    if (res.ok && !contentType.includes('text/html')) {
      return {
        url: '/models/bmw-3-g20.glb',
        yaw: 0,
        length: 4.71,
        isFerrari: false,
      };
    }
  } catch {
    // Stand-in fallback below
  }

  return {
    url: '/models/_preview/ferrari.glb',
    yaw: -Math.PI / 2,
    length: 4.7,
    isFerrari: true,
  };
}
