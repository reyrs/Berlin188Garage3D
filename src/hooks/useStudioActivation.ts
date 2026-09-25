import { useEffect, useState } from 'react';
import type { DeviceTier } from './useDeviceTier';

const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

/**
 * When to download and start the 3D studio chunk:
 * - desktop (high): as soon as the page is idle after `load`;
 * - phones (mid): on the first interaction, so the poster carries first paint
 *   and three.js never competes with it on a throttled CPU.
 */
export function useStudioActivation(tier: DeviceTier): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (tier === 'pending' || tier === 'none') return;

    let cancelled = false;
    const activate = () => {
      if (!cancelled) setActive(true);
    };

    if (tier === 'high') {
      // The door is covering the page: use that time to load the studio.
      if (document.documentElement.dataset.intro === 'play') {
        activate();
        return () => {
          cancelled = true;
        };
      }
      const whenIdle = () => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(activate, { timeout: 1500 });
        else setTimeout(activate, 200);
      };
      if (document.readyState === 'complete') whenIdle();
      else window.addEventListener('load', whenIdle, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener('load', whenIdle);
      };
    }

    const onFirstInteraction = () => {
      activate();
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onFirstInteraction));
    };
    INTERACTION_EVENTS.forEach((type) =>
      window.addEventListener(type, onFirstInteraction, { passive: true, once: true }),
    );
    return () => {
      cancelled = true;
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onFirstInteraction));
    };
  }, [tier]);

  return active;
}
