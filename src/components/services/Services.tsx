import { useEffect, useRef } from 'react';
import { ArrowRight, WhatsappLogo } from '@phosphor-icons/react';
import { CATEGORIES, SERVICES, type Service } from '../../data/services';
import { bookingLink, serviceInquiryLink } from '../../lib/whatsapp';
import { useSnapSlider } from '../../hooks/useSnapSlider';
import { ButtonLink } from '../ui/ButtonLink';
import { CurveAccent } from '../ui/CurveAccent';
import { SliderControls } from '../ui/SliderControls';

const COUNT = SERVICES.length;
const WIDTHS = [480, 960, 1536];
const pad = (n: number) => String(n).padStart(2, '0');
const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.id, c.short]));
/** Where each group starts in the slider. */
const FIRST = new Map(CATEGORIES.map((c) => [c.id, SERVICES.findIndex((s) => s.categoryId === c.id)]));

function ServicePicture({ service }: { service: Service }) {
  const base = `/images/services/${service.id}-card`;
  const srcSet = (ext: string) => WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  const sizes = '(min-width: 1024px) 44vw, 88vw';
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <img
        src={`${base}-960.webp`}
        srcSet={srcSet('webp')}
        sizes={sizes}
        width={1536}
        height={1152}
        alt={service.photoAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

/**
 * The fourteen services as one slider, like the makes below it: a big card
 * in the middle, its neighbours peeking in. The five groups sit above it as
 * jump buttons and light up as the slider moves through them. Every service
 * keeps its #layanan-<id> anchor: a link to one slides it into place.
 */
export function Services() {
  const { active, goTo, trackProps } = useSnapSlider(COUNT);
  const activeCategory = SERVICES[active]?.categoryId;
  const groupsRef = useRef<HTMLUListElement>(null);
  const controls = { active, count: COUNT, onPrev: () => goTo(active - 1), onNext: () => goTo(active + 1), noun: 'Layanan', tone: 'light' as const };

  // Links to one service (the hero's hotspots, shared URLs): slide it into
  // place at once, so the page scroll lands on the right card.
  useEffect(() => {
    const indexOf = (hash: string) => SERVICES.findIndex((s) => `#layanan-${s.id}` === hash);
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#layanan-"]');
      const i = link ? indexOf(link.getAttribute('href') ?? '') : -1;
      if (i >= 0) goTo(i, 'instant');
    };
    document.addEventListener('click', onClick, true);
    const initial = indexOf(window.location.hash);
    if (initial >= 0) {
      requestAnimationFrame(() => {
        goTo(initial, 'instant');
        document.getElementById('layanan')?.scrollIntoView();
      });
    }
    return () => document.removeEventListener('click', onClick, true);
  }, [goTo]);

  // Phones: keep the lit group in view as the slider moves through the groups.
  useEffect(() => {
    const row = groupsRef.current;
    const pill = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !pill || row.scrollWidth <= row.clientWidth) return;
    const offset = pill.getBoundingClientRect().left - row.getBoundingClientRect().left;
    row.scrollTo({ left: row.scrollLeft + offset - 16, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <section id="layanan" aria-labelledby="layanan-title" aria-roledescription="carousel" className="relative scroll-mt-16 overflow-hidden bg-cloud-white py-20 lg:py-28">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <header data-reveal className="max-w-2xl">
          <p className="spec-label text-berlin-blue">Layanan</p>
          <h2 id="layanan-title" className="brand-headline mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98]">
            Dari mesin sampai <span className="brand-emphasis mt-[0.1em]">towing</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-jet-black/75 sm:text-lg">
            Empat belas layanan dalam lima kelompok. Geser atau pilih kelompoknya.
          </p>
        </header>
        <SliderControls {...controls} className="hidden lg:flex" />
      </div>

      {/* The groups: jump to the first service of each; the one on screen is lit. */}
      <nav aria-label="Kelompok layanan" className="mx-auto mt-8 max-w-7xl lg:mt-10 lg:px-8">
        <ul ref={groupsRef} className="scroll-row flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6 lg:flex-wrap lg:px-0">
          {CATEGORIES.map((c) => {
            const current = c.id === activeCategory;
            const size = SERVICES.filter((s) => s.categoryId === c.id).length;
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(FIRST.get(c.id) ?? 0)}
                  aria-current={current ? 'true' : undefined}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors duration-200 ${
                    current
                      ? 'bg-jet-black text-cloud-white'
                      : 'bg-white text-jet-black/75 ring-1 ring-jet-black/10 hover:text-jet-black hover:ring-jet-black/25'
                  }`}
                >
                  {c.short}
                  <span className={`text-xs tabular-nums ${current ? 'text-cloud-white/60' : 'text-jet-black/45'}`}>{size}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div {...trackProps} className="slider-track scroll-row mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto py-4 lg:mt-8 lg:gap-6">
        {SERVICES.map((service, i) => {
          const current = i === active;
          return (
            <article
              key={service.id}
              id={`layanan-${service.id}`}
              data-slide
              aria-roledescription="slide"
              aria-labelledby={`layanan-${service.id}-title`}
              className={`flex shrink-0 scroll-mt-24 snap-center flex-col overflow-hidden rounded-card bg-white shadow-float ring-1 ring-jet-black/5 transition-[opacity,scale] duration-500 ease-out-quint lg:flex-row ${
                current ? 'opacity-100' : 'scale-[0.94] opacity-40'
              }`}
            >
              <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-cloud-white lg:w-[56%]">
                <ServicePicture service={service} />
              </div>
              <div
                className={`flex flex-1 flex-col p-5 transition-[opacity,translate] duration-500 ease-out-quint sm:p-8 lg:p-10 ${
                  current ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <p className="spec-label tabular-nums text-berlin-blue">
                  {pad(i + 1)} · {CATEGORY_NAME.get(service.categoryId)}
                </p>
                <h3 id={`layanan-${service.id}-title`} className="brand-headline mt-3 text-[clamp(1.6rem,2.8vw,2.75rem)] leading-[1.02]">
                  {service.name}
                </h3>
                <CurveAccent className="mt-4 h-2 w-20" />
                <p className="mt-4 leading-relaxed text-jet-black/75 lg:text-lg">{service.description}</p>
                <div className="mt-auto pt-6">
                  <ButtonLink href={serviceInquiryLink(service.name)} external size="sm" tabIndex={current ? 0 : -1}>
                    <WhatsappLogo weight="duotone" size={20} aria-hidden="true" />
                    Tanya layanan ini
                  </ButtonLink>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Progress through the fourteen, the arrows on smaller screens, and a way to ask about anything else. */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:mt-8 lg:px-8">
        <div className="h-0.5 overflow-hidden rounded-full bg-jet-black/10" aria-hidden="true">
          <div
            className="h-full origin-left rounded-full bg-jet-black transition-transform duration-500 ease-out-quint"
            style={{ transform: `scaleX(${(active + 1) / COUNT})` }}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <a
            href={bookingLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-berlin-blue transition-colors duration-200 hover:text-berlin-blue-dark"
          >
            Keluhan lain? Tanya via WhatsApp
            <ArrowRight weight="bold" size={16} aria-hidden="true" />
          </a>
          <SliderControls {...controls} className="flex lg:hidden" />
        </div>
      </div>
    </section>
  );
}
