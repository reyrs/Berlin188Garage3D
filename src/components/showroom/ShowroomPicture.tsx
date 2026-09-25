import type { ShowroomCar } from '../../data/showroom';

const WIDE = [1280, 1920, 2560];
const TALL = [540, 864];

/** Art-directed photo: 16:9 on landscape screens, 9:16 (badge-centred) on portrait. */
export function ShowroomPicture({ car, priority = false }: { car: ShowroomCar; priority?: boolean }) {
  const base = `/images/showroom/${car.id}`;
  const set = (kind: 'wide' | 'tall', widths: number[], ext: string) =>
    widths.map((w) => `${base}-${kind}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source media="(orientation: portrait)" type="image/avif" srcSet={set('tall', TALL, 'avif')} sizes="100vw" />
      <source media="(orientation: portrait)" type="image/webp" srcSet={set('tall', TALL, 'webp')} sizes="100vw" />
      <source type="image/avif" srcSet={set('wide', WIDE, 'avif')} sizes="100vw" />
      <img
        src={`${base}-wide-1920.webp`}
        srcSet={set('wide', WIDE, 'webp')}
        sizes="100vw"
        width={2560}
        height={1440}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'low'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}
