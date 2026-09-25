import { useEffect, useRef, useState } from 'react';
import { ArrowDown, WhatsappLogo } from '@phosphor-icons/react';
import { HERO } from '../../data/content';
import { SHOWROOM } from '../../data/showroom';
import { VIDEOS } from '../../data/media';
import { bookingLink } from '../../lib/whatsapp';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { ScrubController } from '../../lib/scrub';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIntroOpen } from '../../lib/intro';
import { ButtonLink } from '../ui/ButtonLink';
import { BrandMarkIcon } from '../ui/BrandMarkIcon';
import { CurveAccent } from '../ui/CurveAccent';
import { ScrubVideo } from '../media/ScrubVideo';
import { ShowroomPicture } from './ShowroomPicture';

const COUNT = SHOWROOM.length;
/** Timeline length in units: the hero, one unit per make change, a short hold. */
const UNITS = COUNT + 0.3;
/** Scroll distance per timeline unit. */
const UNIT_SVH = 80;
/** Timeline position where make i starts to come in (make 0 is there from the start). */
const changeAt = (i: number) => (i === 0 ? 0 : i + 0.1);
/** The rail and counter switch halfway through each change. */
const activeAt = (t: number) => SHOWROOM.reduce((n, _, i) => (i > 0 && t >= changeAt(i) + 0.3 ? i : n), 0);
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The hero and the makes the workshop services, as one pinned dark showroom.
 * Scrolling lifts each photo like a garage door to reveal the next make;
 * a make with a clip in VIDEOS plays it frame by frame with the scroll.
 */
export function Showroom() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const introOpen = useIntroOpen();
  const [active, setActive] = useState(0);
  const [scrubbers] = useState(() => SHOWROOM.map(() => new ScrubController()));

  // Entrance, once the garage door starts lifting (or on load when there is
  // no intro): the showroom lights flicker on, the photo settles, the headline
  // rises. SplitText measures glyphs, so it waits for Poppins.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !introOpen) return;
    const items = root.querySelectorAll<HTMLElement>('[data-hero-reveal]');
    if (reducedMotion) {
      gsap.set(items, { opacity: 1, animation: 'none' });
      gsap.set(root.querySelector('.showroom-dim'), { opacity: 0, animation: 'none' });
      return;
    }
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Masks get "hs-word-mask" (padded in index.css so caps and italics are not clipped).
        const split = SplitText.create('.hero-split', { type: 'words,chars', mask: 'words', wordsClass: 'hs-word' });
        gsap.set(items, { opacity: 1, animation: 'none' });
        gsap.set('.showroom-dim', { animation: 'none' });
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          // Fluorescent tubes catching: two quick flickers, then full light.
          .set('.showroom-dim', { opacity: 0.7 }, 0)
          .to(
            '.showroom-dim',
            {
              keyframes: [
                { opacity: 0.3, duration: 0.06, ease: 'none' },
                { opacity: 0.62, duration: 0.07, ease: 'none' },
                { opacity: 0.18, duration: 0.06, ease: 'none' },
                { opacity: 0.45, duration: 0.08, ease: 'none' },
                { opacity: 0, duration: 0.9, ease: 'power2.out' },
              ],
            },
            0,
          )
          .from('[data-slide]:first-child [data-slide-media]', { scale: 1.08, duration: 2.4, ease: 'power3.out' }, 0)
          .from('.hero-eyebrow', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.15)
          .from(split.chars, { yPercent: 118, duration: 1.05, stagger: 0.022 }, 0.2)
          .fromTo(
            '.hero-emphasis',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' },
            0.45,
          )
          .from('.hero-sub', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.7)
          .from('.hero-ctas > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.8)
          .from('.showroom-rail', { autoAlpha: 0, duration: 0.8 }, 0.9);
      }, root);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [introOpen, reducedMotion]);

  // The scroll story. Transforms and opacity only, so it stays on the compositor.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const slides = q('[data-slide]');
      const inners = q('[data-slide-inner]');
      const medias = q('[data-slide-media]');
      const captions = q('[data-caption]');
      const still = reducedMotion;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const t = self.progress * UNITS;
            setActive(activeAt(t));
            // Each clip runs from its make's arrival until it has lifted away.
            scrubbers.forEach((scrubber, i) => {
              const start = changeAt(i);
              const end = i === COUNT - 1 ? UNITS : changeAt(i + 1) + 0.6;
              scrubber.setProgress((t - start) / (end - start));
            });
          },
        },
      });

      if (still) {
        // Reduced motion: the same story as instant cuts, nothing moves by itself.
        gsap.set(captions.slice(1), { autoAlpha: 0 });
        tl.set(q('.showroom-hero'), { autoAlpha: 0 }, 0.5).set([captions[0], q('.showroom-eyebrow')], { autoAlpha: 1 }, 0.5);
        for (let i = 1; i < COUNT; i++) {
          const at = changeAt(i) + 0.3;
          tl.set(slides[i - 1], { yPercent: -100 }, at).set(captions[i - 1], { autoAlpha: 0 }, at).set(captions[i], { autoAlpha: 1 }, at);
        }
      } else {
        tl.to(q('.showroom-hero'), { autoAlpha: 0, y: -48, duration: 0.45, ease: 'power1.in' }, 0.15)
          .to(q('.showroom-cue'), { autoAlpha: 0, duration: 0.2 }, 0.05)
          .fromTo(q('.showroom-eyebrow'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.55)
          .fromTo(captions[0], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.55);
        for (let i = 1; i < COUNT; i++) {
          const at = changeAt(i);
          // The door lifts (slide up) while its photo stays put (inner down),
          // drifting up a little for depth; the next make settles in behind it.
          tl.to(captions[i - 1], { autoAlpha: 0, y: -36, duration: 0.25, ease: 'power1.in' }, at)
            .to(slides[i - 1], { yPercent: -100, duration: 0.6, ease: 'power2.inOut' }, at)
            .to(inners[i - 1], { yPercent: 88, duration: 0.6, ease: 'power2.inOut' }, at)
            .fromTo(medias[i], { scale: 1.14 }, { scale: 1, duration: 0.75, ease: 'power2.out' }, at)
            .fromTo(captions[i], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.42);
        }
      }
      // Pad to the full length so timeline units match the section height.
      tl.set({}, {}, UNITS);
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative bg-jet-black text-cloud-white"
      style={{ height: `calc(100svh + ${UNITS * UNIT_SVH}svh)` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Slides, first on top. Decorative: the makes are listed as text below. */}
        <div className="absolute inset-0" aria-hidden="true">
          {SHOWROOM.map((car, i) => {
            const slot = VIDEOS[`showroom-${car.id}`];
            return (
              <div key={car.id} data-slide className="absolute inset-0 overflow-hidden" style={{ zIndex: COUNT - i }}>
                <div data-slide-inner className="absolute inset-0">
                  <div data-slide-media className="absolute inset-0 will-change-transform">
                    <ShowroomPicture car={car} priority={i === 0} />
                    {slot && (
                      <ScrubVideo
                        slot={slot}
                        scrubber={scrubbers[i]}
                        load={i <= active + 1}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lights off until the entrance switches them on. */}
        <div aria-hidden="true" className="showroom-dim pointer-events-none absolute inset-0 z-[5] bg-jet-black" />

        {/* Scrims: header legibility on top, copy legibility bottom-left. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-x-0 top-0 h-[55%] bg-linear-to-b from-jet-black/85 via-jet-black/35 to-jet-black/0 lg:h-44 lg:from-jet-black/70 lg:via-jet-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-linear-to-t from-jet-black/90 via-jet-black/45 to-jet-black/0 lg:h-[58%]" />
          <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-linear-to-r from-jet-black/65 to-jet-black/0 lg:block" />
        </div>

        <div className="relative z-20 mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero: headline on top and CTAs in the thumb zone on phones, one block bottom-left on desktop. */}
          <div className="showroom-hero absolute inset-x-4 top-0 bottom-0 flex flex-col justify-between pt-24 pb-28 sm:inset-x-6 lg:inset-x-8 lg:justify-end lg:gap-8 lg:pb-[22svh]">
            <div className="max-w-xl">
              <p data-hero-reveal className="hero-eyebrow spec-label text-cloud-white/80">
                {HERO.eyebrow}
              </p>
              <h1 id="hero-title" data-hero-reveal className="brand-headline mt-5 text-[clamp(2.4rem,5.2vw,5rem)] leading-[0.95]">
                <span className="hero-split block">{HERO.headlineLead}</span>
                <span className="hero-emphasis brand-emphasis mt-[0.14em] whitespace-nowrap">
                  <span className="hero-split">{HERO.headlineEmphasis}</span>
                </span>
              </h1>
              <p data-hero-reveal className="hero-sub mt-6 max-w-md text-base leading-relaxed text-cloud-white/85 sm:text-lg">
                {HERO.subtitle}
              </p>
            </div>
            <div data-hero-reveal className="hero-ctas flex flex-wrap items-center gap-3">
              <ButtonLink href={bookingLink()} external>
                <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
                {HERO.primaryCta}
              </ButtonLink>
              <ButtonLink href="#layanan" variant="on-dark">
                {HERO.secondaryCta}
                <ArrowDown weight="duotone" size={20} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          {/* One caption per make, stacked; the timeline shows one at a time. */}
          <div aria-hidden="true" className="absolute inset-x-4 bottom-24 sm:inset-x-6 lg:inset-x-8 lg:bottom-28">
            <p className="showroom-eyebrow spec-label text-cloud-white/70">Merek yang kami servis</p>
            {/* All captions share one grid cell, so the block is as tall as the tallest. */}
            <div className="mt-4 grid items-end">
              {SHOWROOM.map((car) => (
                <div key={car.id} data-caption className="col-start-1 row-start-1">
                  <div className="flex flex-col gap-3 [--mark:2.25rem] sm:flex-row sm:items-center sm:gap-6 sm:[--mark:3.25rem] lg:[--mark:4.5rem]">
                    <BrandMarkIcon id={car.id} className="text-cloud-white" />
                    <p className="brand-headline text-[clamp(2.1rem,8vw,7.25rem)] leading-[0.9]">{car.brand}</p>
                  </div>
                  <p className="mt-3 text-sm text-cloud-white/75 sm:text-base">
                    {car.model} <span className="text-cloud-white/50">· Ilustrasi</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rail: counter, scroll cue, and the six marks with the active one lit. */}
          <div
            aria-hidden="true"
            className="showroom-rail absolute inset-x-4 bottom-6 flex items-end justify-between gap-6 sm:inset-x-6 lg:inset-x-8 lg:bottom-8"
          >
            <p className="spec-label tabular-nums text-cloud-white/80">
              <span className="text-cloud-white">{pad(active + 1)}</span> / {pad(COUNT)}
            </p>
            <p className="showroom-cue spec-label hidden items-center gap-2 text-cloud-white/70 md:flex">
              Gulir ke bawah <ArrowDown weight="bold" size={14} />
            </p>
            <ol className="flex items-end gap-4 [--mark:1.25rem] sm:gap-7 sm:[--mark:1.5rem]">
              {SHOWROOM.map((car, i) => (
                <li key={car.id} className="flex flex-col items-center gap-2">
                  <BrandMarkIcon
                    id={car.id}
                    className={`transition-opacity duration-300 ${i === active ? 'text-cloud-white opacity-100' : 'text-cloud-white opacity-40'}`}
                  />
                  <CurveAccent className={`h-1.5 w-6 transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <h2 className="sr-only">Merek yang kami servis</h2>
      <ul className="sr-only">
        {SHOWROOM.map((car) => (
          <li key={car.id}>{car.brand}</li>
        ))}
      </ul>
    </section>
  );
}
