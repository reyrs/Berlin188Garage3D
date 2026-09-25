import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { CAR_MODELS, HERO_CAR, type CarSlot, type PaintId } from '../data/cars';
import { SERVICES } from '../data/services';
import { applyPaint, createPaint } from './paints';
import { createDissolve, type Dissolve } from './dissolve';
import { BRAND } from './materials';
import { useStage } from '../stores/stage';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const DRACO_PATH = '/draco/';
const CAR_LENGTH = 4.7;

/** Clone the cached scene, swap "paint…" materials for this slot's paint, give every material the dissolve. */
function prepareCar(source: THREE.Object3D, paint: THREE.Material, dissolve: Dissolve): THREE.Group {
  const root = source.clone(true);
  const materials = new Map<THREE.Material, THREE.Material>();
  const swap = (material: THREE.Material) => {
    if (/^paint/i.test(material.name)) return paint;
    let copy = materials.get(material);
    if (!copy) {
      copy = dissolve.apply(material.clone());
      materials.set(material, copy);
    }
    return copy;
  };
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
  });
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.set(-center.x, -box.min.y, -center.z);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  return wrapper;
}

/**
 * Ready signal + reveal: on a first visit (door intro played) the car starts
 * fully dissolved and is scanned in once the door is up; returning visitors
 * and reduced-motion users get it solid immediately.
 */
function useReveal(object: THREE.Object3D, dissolve: Dissolve) {
  const setReady = useStage((s) => s.setReady);
  const doorOpen = useStage((s) => s.doorOpen);
  const introPlayed = useStage((s) => s.introPlayed);
  const reducedMotion = useReducedMotion();
  const animate = introPlayed && !reducedMotion;

  useEffect(() => {
    // Start invisible; the effect below scans it in (even if the door opened first).
    if (animate) dissolve.uniforms.uDissolve.value = 1;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
    // Only on mount: later changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setReady]);

  useEffect(() => {
    const u = dissolve.uniforms.uDissolve;
    // Dev-only: ?dissolve=0.5 freezes the scan-in so it can be inspected.
    const frozen = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('dissolve') : null;
    if (frozen !== null) {
      u.value = Number(frozen);
      return;
    }
    if (!doorOpen) return;
    if (!animate) {
      u.value = 0;
      return;
    }
    const tween = gsap.to(u, { value: 0, duration: 2.1, delay: 0.25, ease: 'power2.inOut' });
    return () => {
      tween.kill();
    };
  }, [doorOpen, animate, dissolve]);

  useFrame(() => {
    dissolve.uniforms.uCarInv.value.copy(object.matrixWorld).invert();
  });
}


/** Which car/paint a scroll step shows: 0 is the hero, 1-14 the services. */
export function slotForStep(step: number): CarSlot {
  return step > 0 ? SERVICES[step - 1].car : HERO_CAR;
}

/**
 * Service steps re-paint the car to match each reference photo. The change is
 * a quick scan out and back in (the same Berlin Red edge as the intro), so it
 * reads as "next car in the bay" rather than a colour flicker.
 */
function usePaintSteps(paint: THREE.MeshPhysicalMaterial, dissolve: Dissolve) {
  const reducedMotion = useReducedMotion();
  const current = useRef<PaintId>(slotForStep(useStage.getState().step).paint);

  useEffect(() => {
    let timeline: gsap.core.Timeline | undefined;
    const unsubscribe = useStage.subscribe((state, previous) => {
      if (state.step === previous.step) return;
      const next = slotForStep(state.step).paint;
      if (next === current.current) return;
      current.current = next;
      timeline?.kill();
      if (reducedMotion) {
        applyPaint(paint, next);
        dissolve.uniforms.uDissolve.value = 0;
        return;
      }
      const u = dissolve.uniforms.uDissolve;
      timeline = gsap
        .timeline()
        .to(u, { value: 1, duration: 0.42, ease: 'power2.in' })
        .add(() => applyPaint(paint, next))
        .to(u, { value: 0, duration: 0.95, ease: 'power2.out' });
    });
    return () => {
      unsubscribe();
      timeline?.kill();
    };
  }, [paint, dissolve, reducedMotion]);
}

export function Car({ slot }: { slot: CarSlot }) {
  return <PreviewCar slot={slot} />;
}

/* ------------------------------------------------------------------ */
/* Dev-only preview car (the noctis-hypercar Ferrari, never shipped:   */
/* public/models/_preview is git-ignored) until the real GLBs exist.   */
/* ------------------------------------------------------------------ */

const PREVIEW_FILE = '/models/_preview/ferrari.glb';
const PREVIEW_AO = '/models/_preview/ferrari_ao.png';
const baseName = (object: THREE.Object3D) => object.name.replace(/_\d+$/, '');
const PREVIEW_GROUPS: Record<string, string[]> = {
  paint: ['body'],
  glass: ['glass'],
  trim: ['chrome', 'trim', 'grills', 'plastic_gray', 'metal', 'carbon_fibre_trim', 'wipers', 'brakes', 'brake', 'nuts'],
  rims: ['rim_fl', 'rim_fr', 'rim_rl', 'rim_rr'],
  tires: ['tire'],
  head: ['lights', 'leds'],
  tail: ['lights_red'],
  // Marque shields and hub caps: blacked out so the preview carries no brand.
  badge: ['yellow_trim', 'centre', 'blue'],
};

function PreviewCar({ slot }: { slot: CarSlot }) {
  const gltf = useGLTF(PREVIEW_FILE, DRACO_PATH);
  const ao = useLoader(THREE.TextureLoader, PREVIEW_AO);
  const dissolve = useMemo(() => createDissolve(), []);

  const { object, paint } = useMemo(() => {
    const model = gltf.scene.clone(true);
    const paint = dissolve.apply(createPaint(slot.paint));

    const glass = dissolve.apply(
      new THREE.MeshPhysicalMaterial({
        color: '#0e141c',
        metalness: 0.1,
        roughness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        // Opacity, not transmission: transmission costs an extra full render pass.
        transparent: true,
        opacity: 0.88,
        envMapIntensity: 2.5,
      }),
    );
    const trim = dissolve.apply(
      new THREE.MeshStandardMaterial({ color: '#656a72', metalness: 0.85, roughness: 0.28, envMapIntensity: 1.8 }),
    );
    const rims = dissolve.apply(
      new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.96, roughness: 0.18, envMapIntensity: 2.2 }),
    );
    const tires = dissolve.apply(
      new THREE.MeshStandardMaterial({ color: '#141618', metalness: 0.04, roughness: 0.88 }),
    );
    const head = dissolve.apply(
      new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f0f6ff', emissiveIntensity: 2.8, roughness: 0.1 }),
    );
    const tail = dissolve.apply(
      new THREE.MeshStandardMaterial({ color: '#440000', emissive: BRAND.red, emissiveIntensity: 3.5, roughness: 0.15 }),
    );
    const badge = dissolve.apply(new THREE.MeshStandardMaterial({ color: '#0c0c0e', metalness: 0.7, roughness: 0.35 }));
    const byName = new Map<string, THREE.Material>();
    const table: Record<string, THREE.Material> = { paint, glass, trim, rims, tires, head, tail, badge };
    for (const [group, names] of Object.entries(PREVIEW_GROUPS)) for (const n of names) byName.set(n, table[group]);
    const clones = new Map<THREE.Material, THREE.Material>();
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mapped = byName.get(baseName(mesh));
      if (mapped) mesh.material = mapped;
      else {
        const original = mesh.material as THREE.Material;
        if (!clones.has(original)) clones.set(original, dissolve.apply(original.clone()));
        mesh.material = clones.get(original)!;
      }
    });

    // Baked contact shadow shipped with the model, in model units.
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: ao,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.003;
    shadow.renderOrder = 2;
    model.children[0]?.add(shadow);

    // Normalise: nose to +X, wheels on the floor, CAR_LENGTH long, centred on the bay.
    model.rotation.y = -Math.PI / 2;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(CAR_LENGTH / size.x);
    model.updateMatrixWorld(true);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    const wrapper = new THREE.Group();
    wrapper.add(model);
    return { object: wrapper, paint };
  }, [gltf.scene, ao, dissolve, slot.paint]);

  useReveal(object, dissolve);
  usePaintSteps(paint, dissolve);
  return <primitive object={object} />;
}

interface BoundaryProps {
  slot: CarSlot;
  children: ReactNode;
}

/** A missing/broken model must never take the whole studio down. */
export class CarBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.info(`[studio] ${this.props.slot.model} belum ada, pakai preview car`, error);
    else useStage.getState().setReady(true);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (!import.meta.env.DEV) return null;
    return (
      <Suspense fallback={null}>
        <PreviewCar slot={this.props.slot} />
      </Suspense>
    );
  }
}
