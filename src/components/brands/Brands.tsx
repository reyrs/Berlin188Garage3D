import { WhatsappLogo } from '@phosphor-icons/react';
import { SHOWROOM, type ShowroomCar } from '../../data/showroom';
import { bookingLink } from '../../lib/whatsapp';
import { useSnapSlider } from '../../hooks/useSnapSlider';
import { BrandMarkIcon } from '../ui/BrandMarkIcon';
import { ButtonLink } from '../ui/ButtonLink';
import { CurveAccent } from '../ui/CurveAccent';
import { SliderControls } from '../ui/SliderControls';

const COUNT = SHOWROOM.length;
const WIDE = [1280, 1920, 2560];
const TALL = [540, 864];

/**
 * The makes the workshop services as a model slider, in the manner of a
 * car maker's line-up page: one big car in the middle with its neighbours
 * peeking in, swiped (or dragged, or stepped with the arrows and the name
 * row). Every slide books that make on WhatsApp.
 */
export function Brands() {
  const { active, goTo, trackProps } = useSnapSlider(COUNT);
  const controls = { active, count: COUNT, onPrev: () => goTo(active - 1), onNext: () => goTo(active + 1), noun: 'Merek' };

  return (
    <section id="merek" aria-labelledby="merek-title" aria-roledescription="carousel" className="scroll-mt-16 overflow-hidden bg-jet-black py-20 text-cloud-white lg:py-28">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <header data-reveal className="max-w-2xl">
          <p className="spec-label text-cloud-white/70">Spesialis mobil Eropa</p>
          <h2 id="merek-title" className="brand-headline mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98]">
            Merek yang <span className="brand-emphasis mt-[0.1em]">kami servis</span>
          </h2>
        </header>
        <SliderControls {...controls} className="hidden lg:flex" />
      </div>

      <div {...trackProps} className="slider-track scroll-row mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:mt-14 lg:gap-6">
        {SHOWROOM.map((car, i) => (
          <article
            key={car.id}
            data-slide
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${COUNT}: ${car.brand}`}
            className={`brand-slide relative shrink-0 snap-center overflow-hidden rounded-card transition-[opacity,scale] duration-500 ease-out-quint ${
              i === active ? 'opacity-100' : 'scale-[0.94] opacity-40'
            }`}
          >
            <BrandPicture car={car} />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-jet-black/90 via-jet-black/25 to-jet-black/0" />
            <div
              className={`absolute inset-x-5 bottom-5 transition-[opacity,translate] duration-500 ease-out-quint sm:inset-x-8 sm:bottom-8 lg:inset-x-10 lg:bottom-10 ${
                i === active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <BrandMarkIcon id={car.id} className="text-cloud-white [--mark:2rem] sm:[--mark:2.75rem]" />
              <h3 className="brand-headline mt-3 text-[clamp(2rem,7vw,6.5rem)] leading-[0.9]">{car.brand}</h3>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <ButtonLink
                  href={bookingLink(`Halo Berlin 188 Garage, saya mau booking servis ${car.brand} saya.`)}
                  external
                  size="sm"
                  tabIndex={i === active ? 0 : -1}
                >
                  <WhatsappLogo weight="duotone" size={20} aria-hidden="true" />
                  Booking servis {car.brand}
                </ButtonLink>
                <p className="text-sm text-cloud-white/65 max-sm:hidden">Di foto: {car.model}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* The line-up: every make by name (logo on phones), the active one underlined. */}
      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:mt-10 lg:px-8">
        <ol className="flex flex-1 items-start justify-between gap-2 sm:justify-start sm:gap-6 lg:gap-9">
          {SHOWROOM.map((car, i) => (
            <li key={car.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Tampilkan ${car.brand}`}
                aria-current={i === active ? 'true' : undefined}
                className={`flex min-h-11 cursor-pointer flex-col items-center justify-center gap-2 transition-opacity duration-300 ${
                  i === active ? 'opacity-100' : 'opacity-45 hover:opacity-80'
                }`}
              >
                <BrandMarkIcon id={car.id} className="text-cloud-white [--mark:1.35rem] lg:hidden" />
                <span className="spec-label hidden text-cloud-white lg:block">{car.brand}</span>
                <CurveAccent className={`h-1.5 w-6 transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            </li>
          ))}
        </ol>
        <SliderControls {...controls} className="hidden sm:flex lg:hidden" />
      </div>
    </section>
  );
}

/** The showroom photo: the badge-centred tall crop on phones, the 16:9 frame from sm up. */
function BrandPicture({ car }: { car: ShowroomCar }) {
  const base = `/images/showroom/${car.id}`;
  const set = (kind: 'wide' | 'tall', widths: number[], ext: string) =>
    widths.map((w) => `${base}-${kind}-${w}.${ext} ${w}w`).join(', ');
  const wideSizes = '(min-width: 1024px) 78vw, 88vw';
  return (
    <picture>
      <source media="(max-width: 639px)" type="image/avif" srcSet={set('tall', TALL, 'avif')} sizes="84vw" />
      <source media="(max-width: 639px)" type="image/webp" srcSet={set('tall', TALL, 'webp')} sizes="84vw" />
      <source type="image/avif" srcSet={set('wide', WIDE, 'avif')} sizes={wideSizes} />
      <img
        src={`${base}-wide-1920.webp`}
        srcSet={set('wide', WIDE, 'webp')}
        sizes={wideSizes}
        width={2560}
        height={1440}
        alt={car.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}
