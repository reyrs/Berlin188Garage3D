import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useStage } from '../stores/stage';

/**
 * Desktop-only post: bloom picks up only the red scan edge, lamps and
 * specular glints, then Neutral tone mapping keeps brand colours honest.
 *
 * The lit white studio is itself HDR: floor and cyclorama measure up to ~1.6
 * luminance before tone mapping. With the threshold at 1 the whole room
 * bloomed and washed every prop out, so it sits above the room with headroom.
 */
export function Effects() {
  return (
    // SMAA instead of MSAA: cheaper with the bloom chain (threejs-postprocessing).
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={2} luminanceSmoothing={0.3} intensity={0.85} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <SMAA />
    </EffectComposer>
  );
}

/**
 * Mirrors three's loading manager progress into the page store (for the door
 * loader). Subscribes outside React's render and defers the write: loaders
 * report synchronously while another component is rendering.
 */
export function ProgressReporter() {
  useEffect(
    () =>
      useProgress.subscribe((state) => {
        queueMicrotask(() => useStage.getState().setLoadProgress(state.progress / 100));
      }),
    [],
  );
  return null;
}
