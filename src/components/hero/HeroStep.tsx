import { useEffect, useRef } from 'react';
import { ArrowDown, WhatsappLogo } from '@phosphor-icons/react';
import { ButtonLink } from '../ui/ButtonLink';
import { HERO } from '../../data/content';
import { bookingLink } from '../../lib/whatsapp';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';
import { useStage } from '../../stores/stage';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Step 0 of the studio story: the copy sits left, the car stays on the
 * sticky stage to the right. Four text elements only (address, headline,
 * one sentence, two CTAs); everything else lives below the hero.
 */
export function HeroStep() {
  const rootRef = useRef<HTMLDivElement>(null);
  const doorOpen = useStage((s) => s.doorOpen);
  const setHeroProgress = useStage((s) => s.setHeroProgress);
  const reducedMotion = useReducedMotion();

  // 0 → 1 while the hero scrolls away; the camera rig swings with it.
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => setHeroProgress(self.progress),
    });
    return () => trigger.kill();
  }, [setHeroProgress]);

  // The copy waits behind the door, then types in as the door lifts.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !doorOpen) return;
    const items = root.querySelectorAll<HTMLElement>('[data-hero-reveal]');
    if (reducedMotion) {
      gsap.set(items, { opacity: 1, animation: 'none' });
      return;
    }

    let ctx: gsap.Context | undefined;
    let cancelled = false;
    // SplitText measures glyphs, so wait for Poppins before splitting.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create('.hero-split', {
          type: 'words,chars',
          mask: 'words',
          wordsClass: 'hs-word',
          charsClass: 'hs-char',
        });
        gsap.set(items, { opacity: 1, animation: 'none' });
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.hero-eyebrow', { y: 16, autoAlpha: 0, duration: 0.7 }, 0)
          .from(split.chars, { yPercent: 118, duration: 1.05, stagger: 0.022 }, 0.08)
          .fromTo(
            '.hero-emphasis',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' },
            0.3,
          )
          .from('.hero-sub', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.55)
          .from('.hero-ctas > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.65);
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [doorOpen, reducedMotion]);

  return (
    <div
      ref={rootRef}
      id="top"
      className="relative flex min-h-[100svh] items-end pt-24 pb-[max(2.5rem,6svh)] md:items-center md:pb-0"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p data-hero-reveal className="hero-eyebrow spec-label text-jet-black/70">
            {HERO.eyebrow}
          </p>
          <h1 data-hero-reveal className="brand-headline mt-5 text-[clamp(2.4rem,5.2vw,5rem)] leading-[0.95]">
            <span className="hero-split block">{HERO.headlineLead}</span>
            <span className="hero-emphasis brand-emphasis mt-[0.14em] whitespace-nowrap">
              <span className="hero-split">{HERO.headlineEmphasis}</span>
            </span>
          </h1>
          <p data-hero-reveal className="hero-sub mt-6 max-w-md text-base leading-relaxed text-jet-black/75 sm:text-lg">
            {HERO.subtitle}
          </p>
          <div data-hero-reveal className="hero-ctas mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={bookingLink()} external>
              <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
              {HERO.primaryCta}
            </ButtonLink>
            <ButtonLink href="#layanan" variant="secondary">
              {HERO.secondaryCta}
              <ArrowDown weight="duotone" size={20} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
