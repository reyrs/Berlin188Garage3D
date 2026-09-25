import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceTier } from '../hooks/useDeviceTier';
import { HERO_CAR } from '../data/cars';
import { useStage } from '../stores/stage';
import { BRAND } from './materials';
import { Studio } from './Studio';
import { Car, CarBoundary } from './Car';
import { CameraRig } from './CameraRig';
import { Effects, ProgressReporter } from './Effects';

interface StudioCanvasProps {
  tier: DeviceTier;
  reducedMotion: boolean;
}

/** Stop rendering entirely while the stage is scrolled out of view. */
function useInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '120px 0px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

/** Falls back to photos when the GPU sits under ~20 fps for 4 s straight. */
function FpsGuard() {
  const degrade = useStage((s) => s.degrade);
  const ready = useStage((s) => s.ready);
  const slowFor = useRef(0);
  useFrame((_, delta) => {
    // Ignore the first frame after a tab switch or an off-screen pause.
    if (!ready || delta > 0.5) return;
    slowFor.current = delta > 1 / 20 ? slowFor.current + delta : 0;
    if (slowFor.current > 4) degrade();
  });
  return null;
}

export default function StudioCanvas({ tier, reducedMotion }: StudioCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef);
  const ready = useStage((s) => s.ready);
  const [maxDpr, setMaxDpr] = useState(tier === 'high' ? 1.5 : 1.25);
  const [capture] = useState(() => new URLSearchParams(window.location.search).has('capture'));

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 transition-opacity duration-500 ease-out-quint ${ready ? 'opacity-100' : 'opacity-0'}`}
      data-studio-ready={ready ? 'true' : 'false'}
    >
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, maxDpr]}
        camera={{ fov: 28, near: 0.1, far: 80, position: [8.6, 2.2, 6] }}
        gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: capture }}
        onCreated={(state) => {
          // Neutral keeps Berlin Blue/Red and the white studio true to the brand.
          state.gl.toneMapping = THREE.NeutralToneMapping;
          state.gl.toneMappingExposure = 1;
          state.scene.background = new THREE.Color(BRAND.cloudWhite);
          // Dev-only handle for scripts/qa-shot.mjs --eval.
          if (import.meta.env.DEV) (window as unknown as { __studio: unknown }).__studio = state;
        }}
      >
        <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
        {!capture && <FpsGuard />}
        <ProgressReporter />
        <Studio tier={tier} />
        <CarBoundary slot={HERO_CAR}>
          <Suspense fallback={null}>
            <Car slot={HERO_CAR} />
          </Suspense>
        </CarBoundary>
        <CameraRig still={reducedMotion || capture} />
        {tier === 'high' && <Effects />}
      </Canvas>
    </div>
  );
}
