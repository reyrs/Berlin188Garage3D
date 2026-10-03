import { useRef } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { JOURNEY, type JourneyPhoto } from '../../data/journey';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ButtonLink } from '../ui/ButtonLink';

const WIDTHS = [480, 960];

function Photo({ photo, sizes }: { photo: JourneyPhoto; sizes: string }) {
  const srcSet = (ext: string) => WIDTHS.map((w) => `/images/bengkel/${photo.id}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <img
        src={`/images/bengkel/${photo.id}-960.webp`}
        srcSet={srcSet('webp')}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </picture>
  );
}

/**
 * The five process steps on one line, from check-in to hand-over, with real
 * photos of the workshop. The line fills as the steps scroll past, each red
 * ring fills when the line reaches it, and the photos drift at their own
 * depth. Under reduced motion the line is full and nothing moves.
 */
export function Journey() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;
      const q = gsap.utils.selector(root);

      gsap.fromTo(
        q('.journey-progress'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('.journey-steps')[0], start: 'top 60%', end: 'bottom 60%', scrub: true } },
      );

      q('[data-step]').forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 60%',
          toggleClass: { targets: step.querySelector('.journey-marker'), className: 'is-passed' },
        });
      });

      q('[data-depth]').forEach((el) => {
        const depth = Number((el as HTMLElement).dataset.depth);
        gsap.fromTo(
          el,
          { yPercent: depth * 10 },
          { yPercent: -depth * 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <section ref={rootRef} id="proses" aria-labelledby="proses-title" className="relative scroll-mt-16 bg-cloud-white py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header data-reveal className="max-w-2xl">
          <h2 id="proses-title" className="brand-headline text-[clamp(2rem,4vw,3.5rem)] leading-[0.98]">
            Dari check-in <span className="brand-emphasis mt-[0.1em]">sampai pulang</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-berlin-blue-dark/80 sm:text-lg">
            Lima tahap yang sama untuk setiap mobil. Semuanya bisa Anda pantau dari HP.
          </p>
        </header>

        <ol className="journey-steps relative mt-14 lg:mt-20">
          {/* The line: its track, and the part already travelled. */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[9px] w-px bg-berlin-blue/15 lg:left-1/2">
            <span className="journey-progress absolute inset-0 origin-top bg-berlin-blue" />
          </span>

          {JOURNEY.map((step, i) => {
            // Desktop: the text sits against the line, alternating sides; the photos take the other side.
            const textLeft = i % 2 === 0;
            const [main, extra] = step.photos;
            return (
              <li key={step.title} data-step className="relative grid gap-6 pb-16 pl-10 last:pb-0 lg:grid-cols-2 lg:gap-x-24 lg:pb-28 lg:pl-0">
                <span aria-hidden="true" className={`journey-marker absolute top-2 left-0 lg:left-1/2 lg:-translate-x-1/2 ${reducedMotion ? 'is-passed' : ''}`} />

                <div
                  data-reveal
                  className={`lg:row-start-1 lg:max-w-sm ${textLeft ? 'lg:col-start-1 lg:justify-self-end lg:text-right' : 'lg:col-start-2'}`}
                >
                  <h3 className="brand-headline text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.05]">{step.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-berlin-blue-dark/80 sm:text-lg">{step.description}</p>
                </div>

                {main && (
                  <div className={`relative lg:row-start-1 ${textLeft ? 'lg:col-start-2' : 'lg:col-start-1'}`}>
                    <div
                      data-depth="0.6"
                      className={`overflow-hidden rounded-media shadow-product ${main.height > main.width ? 'max-w-xs sm:max-w-sm' : ''} ${
                        textLeft ? '' : 'lg:ml-auto'
                      }`}
                    >
                      <Photo photo={main} sizes="(min-width: 1024px) 34vw, 88vw" />
                    </div>
                    {extra && (
                      <div
                        data-depth="1.4"
                        className={`relative z-10 -mt-14 w-1/2 overflow-hidden rounded-media shadow-float ring-4 ring-cloud-white sm:-mt-20 ${
                          textLeft ? 'ml-auto -mr-2 lg:-mr-10' : '-ml-2 lg:-ml-10'
                        }`}
                      >
                        <Photo photo={extra} sizes="(min-width: 1024px) 17vw, 44vw" />
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-14 pl-10 lg:mt-6 lg:pl-0 lg:text-center">
          <ButtonLink href="#cek-servis">
            Cek status servis
            <ArrowRight weight="bold" size={18} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
