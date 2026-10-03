import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * A rolling door over the top of the light section that follows the dark
 * hero. The hero's dark carries on as the closed door, and the door rolls up
 * as the section scrolls in, with daylight leaking under its edge. Place it
 * as the first child of a positioned section. Decorative; not rendered under
 * reduced motion.
 */
export function RollingDoor() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const door = ref.current;
      const section = door?.parentElement;
      const panel = door?.firstElementChild;
      if (!section || !panel) return;
      gsap.fromTo(
        panel,
        { yPercent: 0 },
        {
          yPercent: -100,
          ease: 'none',
          // Fully up once the section top reaches the bottom of the 64px header.
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top+=64', scrub: true },
        },
      );
    },
    { dependencies: [reducedMotion], revertOnUpdate: true },
  );

  if (reducedMotion) return null;

  return (
    <div ref={ref} aria-hidden="true" className="rolling-door">
      <div className="rolling-door__panel">
        <span className="rolling-door__seam" />
      </div>
    </div>
  );
}
