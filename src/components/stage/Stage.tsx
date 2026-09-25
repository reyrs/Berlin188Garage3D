import { lazy, Suspense, useEffect } from 'react';
import { useDeviceTier } from '../../hooks/useDeviceTier';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useStudioActivation } from '../../hooks/useStudioActivation';
import { useStage } from '../../stores/stage';
import { Poster } from './Poster';

const StudioCanvas = lazy(() => import('../../three/StudioCanvas'));

/**
 * Sticky visual layer behind the hero/service copy. Purely decorative for
 * assistive tech — every word that matters lives in the DOM overlay.
 */
export function Stage() {
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const active = useStudioActivation(tier);
  const degraded = useStage((s) => s.degraded);

  const show3d = active && !degraded && (tier === 'mid' || tier === 'high');
  const photoOnly = tier === 'none' || degraded;
  const setStudioActive = useStage((s) => s.setStudioActive);
  useEffect(() => setStudioActive(show3d), [show3d, setStudioActive]);

  return (
    <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-cloud-white" aria-hidden="true">
      <Poster drift={photoOnly && !reducedMotion} />
      {show3d && (
        <Suspense fallback={null}>
          <StudioCanvas tier={tier} reducedMotion={reducedMotion} />
        </Suspense>
      )}
      {/* Feather the render into the page so its edges always meet Cloud White. */}
      <div className="stage-feather pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-linear-to-b from-cloud-white to-transparent" />
      <div className="stage-feather pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-linear-to-t from-cloud-white to-transparent" />
    </div>
  );
}
