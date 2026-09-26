import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

/** A drag shorter than this is still a click. */
const DRAG_SLOP = 6;

/**
 * A horizontal slider on native scroll snapping (Brands, Services): one big
 * slide centred, its neighbours peeking in. Touch swipes natively; a mouse can
 * drag; goTo() centres a slide. `active` is the slide nearest the middle.
 * Slides are the track's [data-slide] children; the track needs the
 * .slider-track class (index.css) for its snap and end padding.
 */
export function useSnapSlider(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const drag = useRef<{ x: number; left: number; from: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const slides = useCallback(() => [...(trackRef.current?.querySelectorAll<HTMLElement>('[data-slide]') ?? [])], []);

  const goTo = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const track = trackRef.current;
      const slide = slides()[Math.min(count - 1, Math.max(0, index))];
      if (!track || !slide) return;
      track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2, behavior });
    },
    [count, slides],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const middle = track.scrollLeft + track.clientWidth / 2;
      const distances = slides().map((slide) => Math.abs(slide.offsetLeft + slide.clientWidth / 2 - middle));
      setActive(distances.indexOf(Math.min(...distances)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slides]);

  // Mouse drag. Snapping is off while the pointer is down and during the
  // glide to the chosen slide, then back on.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (event.pointerType !== 'mouse' || event.button !== 0 || !track) return;
    drag.current = { x: event.clientX, left: track.scrollLeft, from: activeRef.current, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const state = drag.current;
    if (!track || !state) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) < DRAG_SLOP) return;
    if (!state.moved) {
      state.moved = true;
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = '';
    }
    track.scrollLeft = state.left - dx;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const state = drag.current;
    drag.current = null;
    if (!track || !state?.moved) return;
    track.releasePointerCapture(event.pointerId);
    swallowClick.current = true;
    const dx = event.clientX - state.x;
    // A short flick still moves one slide on; a long drag lands on whichever slide is nearest.
    let target = activeRef.current;
    if (target === state.from && Math.abs(dx) > track.clientWidth * 0.08) target += dx < 0 ? 1 : -1;
    goTo(target);
    const release = () => delete track.dataset.dragging;
    track.addEventListener('scrollend', release, { once: true });
    window.setTimeout(release, 700);
  };
  // The click that ends a drag must not follow a link.
  const onClickCapture = (event: MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    active,
    goTo,
    trackProps: {
      ref: trackRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
  };
}
