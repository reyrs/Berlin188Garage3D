import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { markIntroOpen } from '../../lib/intro';

type Phase = 'closed' | 'opening' | 'done';

/** The door stays down at least this long so the brand moment reads. */
const MIN_CLOSED_MS = 1100;
/** Longest wait for the first showroom photo before lifting anyway. */
const MAX_WAIT_MS = 3000;

/**
 * Dark rolling garage door over the showroom, once per session (decided
 * before first paint by the inline script in index.html). It doubles as the
 * loader: the red curve under the logo fills until the first photo and the
 * fonts are ready. Then light leaks under the door, it unlatches, lifts, and
 * the showroom lights come on behind it (Showroom.tsx).
 *
 * Scrolling, Escape or the skip button open it straight away.
 */
export function GarageDoor() {
  const [phase, setPhase] = useState<Phase>(() =>
    document.documentElement.dataset.intro === 'play' ? 'closed' : 'done',
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const arcRef = useRef<SVGSVGElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  // Written straight to the DOM each frame: no React render per frame.
  const paint = (value: number) => {
    arcRef.current?.style.setProperty('--load', String(value));
    if (countRef.current) countRef.current.textContent = String(Math.round(value * 100)).padStart(3, '0');
  };

  // Loading: an eased timer toward 90 %, then a quick run to 100 % once the
  // first photo and Poppins are in. Monotonic, so it never jumps back.
  useEffect(() => {
    if (phase !== 'closed') return;
    const start = performance.now();
    let ready = false;
    let shown = 0;
    let frame = 0;

    const photo = document.querySelector<HTMLImageElement>('#top [data-slide] img');
    const photoReady =
      !photo || photo.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            photo.addEventListener('load', () => resolve(), { once: true });
            photo.addEventListener('error', () => resolve(), { once: true });
          });
    Promise.all([photoReady, document.fonts.ready]).then(() => {
      ready = true;
    });

    const loop = () => {
      const elapsed = performance.now() - start;
      const x = Math.min(1, elapsed / MAX_WAIT_MS);
      const timed = (1 - (1 - x) * (1 - x)) * 0.9;
      shown = Math.max(shown, ready ? Math.min(1, shown + 0.06) : timed);
      paint(shown);
      if ((ready && shown >= 1 && elapsed >= MIN_CLOSED_MS) || elapsed >= MAX_WAIT_MS) {
        setPhase('opening');
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const skip = () => setPhase('opening');
    const onKey = (event: KeyboardEvent) => {
      if (['Escape', ' ', 'Enter', 'ArrowDown', 'PageDown'].includes(event.key)) skip();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
  }, [phase]);

  // Opening: light leaks under the door, it unlatches (a small dip), lifts.
  useEffect(() => {
    if (phase !== 'opening') return;
    paint(1);
    const tl = gsap
      .timeline({ onComplete: () => setPhase('done') })
      .to([brandRef.current, skipRef.current], { y: -18, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0)
      .to(seamRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0.02)
      .to(glowRef.current, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.12)
      .to(panelRef.current, { yPercent: 1.4, duration: 0.14, ease: 'power1.out' }, 0.2)
      .to(panelRef.current, { yPercent: -103, duration: 1.1, ease: 'power3.inOut' }, 0.34)
      // The headline starts rising once the bottom of the screen is uncovered.
      .call(markIntroOpen, [], 0.58);
    return () => {
      tl.kill();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') markIntroOpen();
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div className="garage-door">
      <div ref={panelRef} className="garage-door__panel" aria-hidden="true">
        <div ref={brandRef} className="garage-door__brand">
          <img className="garage-door__logo" src="/brand/logo-dark.png" alt="" width={354} height={168} />
          <svg ref={arcRef} className="garage-door__arc text-berlin-red" viewBox="0 0 280 24">
            <path className="is-track" d="M6 6 Q140 30 274 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M6 6 Q140 30 274 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          <div className="garage-door__status">
            <span className="spec-label">Membuka showroom</span>
            <span ref={countRef} className="garage-door__count">000</span>
          </div>
        </div>
        <div ref={seamRef} className="garage-door__seam" />
        <div ref={glowRef} className="garage-door__glow" />
      </div>
      <button
        ref={skipRef}
        type="button"
        className="garage-door__skip pointer-events-auto inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-cloud-white/35 px-4 text-[0.9375rem] font-semibold text-cloud-white transition-colors duration-200 hover:border-cloud-white hover:bg-cloud-white/10"
        onClick={() => setPhase('opening')}
      >
        Lewati intro
      </button>
    </div>
  );
}
