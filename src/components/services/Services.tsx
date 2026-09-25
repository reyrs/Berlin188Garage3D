import { useCallback, useEffect, useRef, useState } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react';
import { CATEGORIES, SERVICES, type Service } from '../../data/services';
import { VIDEOS } from '../../data/media';
import { serviceInquiryLink } from '../../lib/whatsapp';
import { ScrollTrigger } from '../../lib/gsap';
import { ScrubController } from '../../lib/scrub';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ScrubVideo } from '../media/ScrubVideo';
import { CurveAccent } from '../ui/CurveAccent';

const WIDTHS = [480, 960, 1536];
const CATEGORY_NAME = new Map(CATEGORIES.map((category) => [category.id, category.short]));
const pad = (n: number) => String(n).padStart(2, '0');

function ServicePicture({ service, sizes }: { service: Service; sizes: string }) {
  const base = `/images/services/${service.id}-portrait`;
  const srcSet = (ext: string) => WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <img
        src={`${base}-960.webp`}
        srcSet={srcSet('webp')}
        sizes={sizes}
        width={1536}
        height={1920}
        alt={service.photoAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

/** Photo with its scroll-scrubbed clip (if one has been built) layered on top. */
function ServiceMedia({
  service,
  scrubber,
  load,
  sizes,
}: {
  service: Service;
  scrubber: ScrubController;
  load: boolean;
  sizes: string;
}) {
  const slot = VIDEOS[`service-${service.id}`];
  return (
    <>
      <ServicePicture service={service} sizes={sizes} />
      {slot && <ScrubVideo slot={slot} scrubber={scrubber} load={load} className="absolute inset-0 h-full w-full object-cover" />}
    </>
  );
}

/**
 * Fourteen services as a scroll story. Desktop: the list scrolls past a
 * sticky 4:5 frame that swaps to the service crossing the middle of the
 * screen. Phones: every service carries its own photo. A service with a clip
 * in VIDEOS plays it frame by frame while it scrolls through.
 */
export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [active, setActive] = useState(0);
  // Frames are mounted as the story reaches them, not all fourteen up front.
  const [reach, setReach] = useState(1);
  const [scrubbers] = useState(() => SERVICES.map(() => new ScrubController()));

  const activate = useCallback((index: number) => {
    setActive(index);
    setReach((current) => Math.max(current, index + 1));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('[data-row]')];
    const triggers = rows.flatMap((row, i) => {
      const list = [
        ScrollTrigger.create({
          trigger: row,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) activate(i);
          },
        }),
      ];
      if (VIDEOS[`service-${SERVICES[i].id}`]) {
        list.push(
          ScrollTrigger.create({
            trigger: row,
            // Desktop: while the row owns the frame. Phones: while its photo is on screen.
            start: isDesktop ? 'top 65%' : 'top bottom',
            end: isDesktop ? 'bottom 35%' : 'center top',
            onUpdate: (self) => scrubbers[i].setProgress(self.progress),
          }),
        );
      }
      return list;
    });
    return () => triggers.forEach((trigger) => trigger.kill());
  }, [activate, isDesktop, scrubbers]);

  return (
    <section ref={rootRef} id="layanan" aria-labelledby="layanan-title" className="relative scroll-mt-16 bg-cloud-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header data-reveal className="max-w-2xl pt-24 pb-10 lg:pt-32 lg:pb-16">
          <p className="spec-label text-berlin-blue">Layanan</p>
          <h2 id="layanan-title" className="brand-headline mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98]">
            Dari mesin sampai <span className="brand-emphasis mt-[0.1em]">towing</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-jet-black/75 sm:text-lg">
            Empat belas layanan untuk mobil Eropa Anda, dikerjakan di satu bengkel.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-2 lg:gap-20">
          <div className="pb-16 lg:pb-[20svh]">
            {SERVICES.map((service, i) => {
              const isActive = isDesktop && i === active;
              return (
                <article
                  key={service.id}
                  id={`layanan-${service.id}`}
                  data-row
                  aria-labelledby={`layanan-${service.id}-title`}
                  className="scroll-mt-20 border-t border-jet-black/10 py-10 lg:flex lg:min-h-[58svh] lg:items-center lg:py-12"
                >
                  {!isDesktop && (
                    <figure className="mb-6">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-white shadow-product">
                        <ServiceMedia
                          service={service}
                          scrubber={scrubbers[i]}
                          load={Math.abs(i - active) <= 1}
                          sizes="calc(100vw - 2rem)"
                        />
                      </div>
                    </figure>
                  )}
                  <div className="lg:max-w-md">
                    <p className={`spec-label tabular-nums transition-colors duration-300 ${isActive || !isDesktop ? 'text-berlin-blue' : 'text-jet-black/60'}`}>
                      {pad(i + 1)} · {CATEGORY_NAME.get(service.categoryId)}
                    </p>
                    <h3
                      id={`layanan-${service.id}-title`}
                      className={`brand-headline mt-3 text-[clamp(1.75rem,2.4vw,2.5rem)] leading-[1.02] transition-colors duration-300 ${
                        isActive || !isDesktop ? 'text-jet-black' : 'text-jet-black/60'
                      }`}
                    >
                      {service.name}
                    </h3>
                    <CurveAccent
                      className={`mt-3 hidden h-2 w-24 transition-opacity duration-300 lg:block ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <p className={`mt-4 leading-relaxed transition-colors duration-300 ${isActive || !isDesktop ? 'text-jet-black/75' : 'text-jet-black/60'}`}>
                      {service.description}
                    </p>
                    <a
                      href={serviceInquiryLink(service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-berlin-blue transition-colors duration-200 hover:text-berlin-blue-dark"
                    >
                      <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
                      Tanya layanan ini
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {isDesktop && (
            <div aria-hidden="true">
              <div className="sticky top-24 ml-auto w-full max-w-[calc((100svh-8rem)*0.8)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-white shadow-float">
                  {SERVICES.map((service, i) =>
                    i <= reach ? (
                      <div
                        key={service.id}
                        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out-quint ${
                          i === active ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'
                        }`}
                      >
                        <ServiceMedia
                          service={service}
                          scrubber={scrubbers[i]}
                          load={Math.abs(i - active) <= 1}
                          sizes="(min-width: 1280px) 36rem, 45vw"
                        />
                      </div>
                    ) : null,
                  )}
                  <p className="spec-label absolute top-4 left-4 rounded-lg bg-white/90 px-3 py-2 tabular-nums text-jet-black">
                    {pad(active + 1)} / {pad(SERVICES.length)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
