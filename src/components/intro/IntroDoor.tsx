import { useCallback, useEffect, useRef, useState } from 'react';
import { useStage } from '../../stores/stage';

type Phase = 'closed' | 'opening' | 'done';

/** Door stays down at least this long so the brand moment reads. */
const MIN_CLOSED_MS = 1100;
/** Longest wait for the 3D studio before lifting anyway. */
const MAX_WAIT_3D_MS = 2800;
/** Phones load 3D on first interaction, so the door doesn't wait for it. */
const MAX_WAIT_NO_3D_MS = 1400;

/**
 * Rolling studio door, once per session (decided before first paint by the
 * inline script in index.html). It doubles as the loader: the red arc under
 * the logo fills with the real asset progress, and the door lifts when the
 * car is ready. Then the car is scanned in and the headline rises.
 */
export function IntroDoor() {
  const [phase, setPhase] = useState<Phase>('closed');
  const [playing, setPlaying] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const openDoor = useStage((s) => s.openDoor);
  const ready = useStage((s) => s.ready);
  const studioActive = useStage((s) => s.studioActive);

  const open = useCallback(() => {
    setPhase((current) => (current === 'closed' ? 'opening' : current));
    openDoor(true);
  }, [openDoor]);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== 'play') {
      openDoor(false);
      setPhase('done');
      return;
    }
    startedAt.current = performance.now();
    setPlaying(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') open();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, openDoor]);

  useEffect(() => {
    if (!playing || phase !== 'closed') return;
    const elapsed = performance.now() - startedAt.current;
    const wait = ready
      ? MIN_CLOSED_MS - elapsed
      : (studioActive ? MAX_WAIT_3D_MS : MAX_WAIT_NO_3D_MS) - elapsed;
    const timer = window.setTimeout(open, Math.max(0, wait));
    return () => window.clearTimeout(timer);
  }, [playing, phase, ready, studioActive, open]);

  // Counter + arc: real asset progress, but never slower than an eased timer
  // toward 90 % of the wait cap, and monotonic so it never jumps back.
  // Written straight to the DOM each frame: no React re-render per frame.
  const arcRef = useRef<SVGSVGElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!playing) return;
    let shown = 0;
    let frame = 0;
    const paint = (value: number) => {
      arcRef.current?.style.setProperty('--load', String(value));
      if (countRef.current) countRef.current.textContent = String(Math.round(value * 100)).padStart(3, '0');
    };
    if (phase !== 'closed') {
      paint(1);
      return;
    }
    const loop = () => {
      const state = useStage.getState();
      const cap = state.studioActive ? MAX_WAIT_3D_MS : MAX_WAIT_NO_3D_MS;
      const x = Math.min(1, (performance.now() - startedAt.current) / cap);
      const timed = (1 - (1 - x) * (1 - x)) * 0.9;
      const real = state.ready ? 1 : state.loadProgress;
      const next = Math.max(shown, timed, real);
      if (next !== shown) paint((shown = next));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, phase]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || phase !== 'opening') return;
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === 'door-lift') setPhase('done');
    };
    panel.addEventListener('animationend', onEnd);
    return () => panel.removeEventListener('animationend', onEnd);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div className={`intro-door ${phase === 'opening' ? 'is-open' : ''}`}>
      <div ref={panelRef} className="intro-door__panel" aria-hidden="true">
        <div className="intro-door__brand">
          <img className="intro-door__logo" src="/brand/logo-on-white.png" alt="" width={700} height={313} />
          <svg ref={arcRef} className="intro-door__arc text-berlin-red" viewBox="0 0 280 24">
            <path className="is-track" d="M6 6 Q140 30 274 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M6 6 Q140 30 274 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
          <div className="intro-door__status">
            <span className="spec-label">Membuka studio</span>
            <span ref={countRef} className="intro-door__count">000</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="intro-skip pointer-events-auto inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-jet-black/15 bg-white px-4 text-[0.9375rem] font-semibold text-jet-black shadow-product transition-colors duration-200 hover:border-berlin-blue hover:text-berlin-blue"
        onClick={open}
      >
        Lewati intro
      </button>
    </div>
  );
}
