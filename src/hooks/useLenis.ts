import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';

const HEADER_OFFSET = -64;

/**
 * Smooth scrolling on desktop pointers only (touch keeps native scrolling) and
 * never under reduced motion. Also routes in-page anchor links through Lenis
 * and moves focus to the target, so the skip link keeps working.
 */
export function useLenis(reducedMotion: boolean) {
  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (!link || !hash || hash.length < 2) return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: hash === '#top' ? 0 : HEADER_OFFSET });
      window.history.pushState(null, '', hash);
      if (target.tabIndex < 0 && !target.matches('a, button, input, select, textarea')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
