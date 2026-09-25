import { useEffect, useRef } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react';
import { CATEGORIES, SERVICES, type Service } from '../../data/services';
import { serviceInquiryLink } from '../../lib/whatsapp';
import { ScrollTrigger } from '../../lib/gsap';
import { useStage } from '../../stores/stage';

const PHOTO_WIDTHS = [480, 960, 1536];
const CATEGORY_NAME = new Map(CATEGORIES.map((category) => [category.id, category.short]));

function ServicePhoto({ service }: { service: Service }) {
  const base = `/images/services/${service.id}-card`;
  const srcSet = (ext: string) => PHOTO_WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  const sizes = '(min-width: 1024px) 26rem, calc(100vw - 2rem)';
  return (
    <figure className="mt-5">
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
          className="aspect-[16/10] w-full rounded-media object-cover lg:aspect-[4/3]"
        />
      </picture>
      {/* The photos are AI renders, so they are labelled as such. */}
      <figcaption className="mt-2 text-xs text-jet-black/60">Ilustrasi</figcaption>
    </figure>
  );
}

/**
 * Fourteen steps over the sticky studio. Each article is one screen tall;
 * while its card crosses the middle of the viewport it owns the stage
 * (step 1-14), and the car behind it is re-painted to match its photo.
 */
export function ServicesStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const setStep = useStage((s) => s.setStep);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
    const triggers = steps.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setStep(Number(el.dataset.step));
        },
      }),
    );
    // Scrolling back above the first service hands the stage back to the hero.
    if (steps[0]) {
      triggers.push(
        ScrollTrigger.create({
          trigger: steps[0],
          start: 'top 55%',
          onLeaveBack: () => setStep(0),
        }),
      );
    }
    return () => triggers.forEach((trigger) => trigger.kill());
  }, [setStep]);

  return (
    <div ref={rootRef} id="layanan" className="relative scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[70svh] items-center">
          <div data-reveal className="max-w-xl">
            <h2 className="brand-headline text-[clamp(2rem,4vw,3.5rem)] leading-[0.98]">
              Dari mesin sampai <span className="brand-emphasis mt-[0.1em]">towing</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-jet-black/75 sm:text-lg">
              Empat belas layanan untuk mobil Eropa Anda, dikerjakan di satu bengkel.
            </p>
          </div>
        </div>

        {SERVICES.map((service, index) => (
          <article
            key={service.id}
            id={`layanan-${service.id}`}
            data-step={index + 1}
            aria-labelledby={`layanan-${service.id}-title`}
            className="flex min-h-[100svh] scroll-mt-16 items-end pb-6 lg:items-center lg:pb-0"
          >
            <div data-reveal className="w-full rounded-card bg-white p-5 shadow-float sm:p-7 lg:max-w-[26rem]">
              <p className="text-sm font-semibold text-berlin-blue">{CATEGORY_NAME.get(service.categoryId)}</p>
              <h3
                id={`layanan-${service.id}-title`}
                className="brand-headline mt-2 text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[1.02]"
              >
                {service.name}
              </h3>
              <p className="mt-3 leading-relaxed text-jet-black/75">{service.description}</p>
              <ServicePhoto service={service} />
              <a
                href={serviceInquiryLink(service.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-berlin-blue transition-colors duration-200 hover:text-berlin-blue-dark"
              >
                <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
                Booking via WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
