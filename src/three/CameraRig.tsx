import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStage } from '../stores/stage';
import { SERVICES, type CategoryId } from '../data/services';

const TARGET = new THREE.Vector3(0, 0.62, 0);
/** Hero camera direction, from +X (the car's nose) toward +Z: a 3/4 front view. */
export const CAMERA_AZIMUTH = THREE.MathUtils.degToRad(35);
const ELEVATION = THREE.MathUtils.degToRad(9);
/** Width (m) that must stay in frame: car + the lift and crane beside it. */
const FRAME_WIDTH = 7.6;
const FRAME_WIDTH_PORTRAIT = 5.8;
const ORBIT_AMPLITUDE = THREE.MathUtils.degToRad(4);
const ORBIT_PERIOD = 16; // seconds
const PARALLAX_YAW = THREE.MathUtils.degToRad(2.4);
const PARALLAX_PITCH = THREE.MathUtils.degToRad(1.2);
// Door-up reveal: the camera glides in from a lower, more side-on, farther spot.
const INTRO_YAW = THREE.MathUtils.degToRad(32);
const INTRO_PITCH = THREE.MathUtils.degToRad(-6);
const INTRO_PUSH = 0.5;
// Scrolling the hero away swings the camera round the nose and in a little.
const SCROLL_YAW = THREE.MathUtils.degToRad(26);
const SCROLL_PITCH = THREE.MathUtils.degToRad(5);
const SCROLL_PULL = 0.14;

const deg = THREE.MathUtils.degToRad;
/**
 * One framing per service category, as offsets from the hero view. Each tells
 * the eye where that work happens: engine bay from the front, doors/cabin from
 * the side for electrics, low on the wheels, paint from the rear, wide for
 * logistics. Services in the same category share a framing, so the camera only
 * travels when the story changes chapter.
 */
interface Framing {
  yaw: number;
  pitch: number;
  push: number;
  lift: number;
}
const HERO_FRAMING: Framing = { yaw: SCROLL_YAW, pitch: SCROLL_PITCH, push: 1 - SCROLL_PULL, lift: 0 };
const CATEGORY_FRAMING: Record<CategoryId, Framing> = {
  'mesin-transmisi': { yaw: deg(-14), pitch: deg(7), push: 0.9, lift: 0.1 },
  'elektrikal-komputer': { yaw: deg(42), pitch: deg(2), push: 0.92, lift: 0 },
  'kaki-kaki-ac': { yaw: deg(-24), pitch: deg(-4), push: 0.84, lift: -0.18 },
  'bodi-eksterior': { yaw: deg(100), pitch: deg(5), push: 0.95, lift: 0 },
  'pendukung-darurat': { yaw: deg(22), pitch: deg(13), push: 1.1, lift: -0.05 },
};

/**
 * Hero camera. Desktop pushes the car to the right of the copy column; phones
 * push it into the upper half. Choreography: intro glide when the door lifts,
 * idle orbit + pointer parallax (fine pointers), and a scroll-scrubbed swing
 * as the hero leaves. All motion is dropped when `still` (reduced motion/capture).
 */
export function CameraRig({ still }: { still: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const radius = useRef(10.5);
  const scroll = useRef(0);
  // Smoothed framing offsets (eased toward the active step's framing every frame).
  const framing = useRef<Framing>({ yaw: 0, pitch: 0, push: 1, lift: 0 });
  const target = useRef(new THREE.Vector3());
  // 0 = waiting behind the door, 1 = settled.
  const intro = useRef({
    t: !still && typeof document !== 'undefined' && document.documentElement.dataset.intro === 'play' ? 0 : 1,
  });
  const doorOpen = useStage((s) => s.doorOpen);

  useLayoutEffect(() => {
    const { width, height } = size;
    const aspect = width / height;
    const portrait = aspect < 0.9;
    camera.fov = portrait ? 34 : 26;
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect);
    const frameWidth = portrait ? FRAME_WIDTH_PORTRAIT : FRAME_WIDTH;
    const usable = portrait ? 1 : 0.64; // desktop: car lives in the right ~64%
    radius.current = THREE.MathUtils.clamp(frameWidth / usable / 2 / Math.tan(hfov / 2), 8.5, 24);
    if (portrait) camera.setViewOffset(width, height, 0, height * 0.2, width, height);
    else camera.setViewOffset(width, height, -width * 0.16, 0, width, height);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => {
    if (!doorOpen || intro.current.t >= 1) return;
    const tween = gsap.to(intro.current, { t: 1, duration: 2.8, delay: 0.15, ease: 'power3.out' });
    return () => {
      tween.kill();
    };
  }, [doorOpen]);

  useEffect(() => {
    if (still || !window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [still]);

  useFrame((state, delta) => {
    const p = pointer.current;
    const ease = 1 - Math.exp(-delta * 3);
    p.sx += (p.x - p.sx) * ease;
    p.sy += (p.y - p.sy) * ease;
    const { heroProgress, step } = useStage.getState();
    // Target framing: the hero swing while in the hero, then one framing per category.
    let goal: Framing;
    if (step > 0) goal = CATEGORY_FRAMING[SERVICES[step - 1].categoryId];
    else {
      const hp = still ? 0 : heroProgress;
      scroll.current += (hp - scroll.current) * (1 - Math.exp(-delta * 6));
      const k = scroll.current;
      goal = {
        yaw: HERO_FRAMING.yaw * k,
        pitch: HERO_FRAMING.pitch * k,
        push: 1 + (HERO_FRAMING.push - 1) * k,
        lift: 0,
      };
    }
    const f = framing.current;
    const follow = still ? 1 : 1 - Math.exp(-delta * 2.2);
    f.yaw += (goal.yaw - f.yaw) * follow;
    f.pitch += (goal.pitch - f.pitch) * follow;
    f.push += (goal.push - f.push) * follow;
    f.lift += (goal.lift - f.lift) * follow;
    const pending = 1 - intro.current.t;

    const t = still ? 0 : state.clock.elapsedTime;
    const orbit = still ? 0 : Math.sin((t / ORBIT_PERIOD) * Math.PI * 2) * ORBIT_AMPLITUDE;
    const azimuth = CAMERA_AZIMUTH + orbit + p.sx * PARALLAX_YAW + pending * INTRO_YAW + f.yaw;
    const elevation = ELEVATION + p.sy * PARALLAX_PITCH + pending * INTRO_PITCH + f.pitch;
    const r = radius.current * (1 + pending * INTRO_PUSH) * f.push;
    target.current.set(TARGET.x, TARGET.y + f.lift, TARGET.z);
    const aim = target.current;
    camera.position.set(
      aim.x + r * Math.cos(elevation) * Math.cos(azimuth),
      aim.y + r * Math.sin(elevation),
      aim.z + r * Math.cos(elevation) * Math.sin(azimuth),
    );
    camera.lookAt(aim);
  });

  return null;
}
