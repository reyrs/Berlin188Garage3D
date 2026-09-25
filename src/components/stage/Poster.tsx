import { POSTER } from '../../data/poster';

interface PosterImage {
  src: string;
  width: number;
  height: number;
}

interface PosterSet {
  version: string;
  desktop: PosterImage;
  mobile: PosterImage;
}

/**
 * Still render of the hero studio, same framing as the live canvas: it is the
 * LCP image, holds the stage until three.js is ready, and is the whole visual
 * for devices that get no 3D (then it drifts slowly unless motion is reduced).
 */
export function Poster({ drift }: { drift: boolean }) {
  const poster = POSTER as PosterSet | null;
  if (!poster) return null;
  const v = `?v=${poster.version}`;
  return (
    <picture>
      <source media="(max-aspect-ratio: 9/10)" type="image/avif" srcSet={`${poster.mobile.src}.avif${v}`} />
      <source media="(max-aspect-ratio: 9/10)" type="image/webp" srcSet={`${poster.mobile.src}.webp${v}`} />
      <source type="image/avif" srcSet={`${poster.desktop.src}.avif${v}`} />
      <img
        src={`${poster.desktop.src}.webp${v}`}
        alt=""
        width={poster.desktop.width}
        height={poster.desktop.height}
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${drift ? 'poster-drift' : ''}`}
      />
    </picture>
  );
}
