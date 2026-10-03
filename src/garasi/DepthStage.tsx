import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from '../lib/gsap';
import type { GarageFrame, KeluhanPart } from '../data/keluhan';

/*
 * The /garasi stage: one photo of the story at a time, shown in depth. Each
 * frame is a grid displaced by its depth map (Depth Anything V2, made offline
 * into public/images/garasi/), so the camera can move into it and the car
 * shifts against the workshop behind it. One draw call, one texture pair,
 * nothing animated while idle: the canvas only renders while the camera or a
 * frame change is moving (frameloop "demand").
 *
 * A frame change is a wipe left to right behind a blue scan line, like the
 * home page story, so two different shots never ghost through each other.
 */

const PLANE_W = 16;
const PLANE_H = 9;
const FOV = 30;
/** How far the nearest point (depth 1) comes out of the photo, in plane units. */
const DEPTH = 1.5;
/** A little extra zoom so the edges of the photo never show while the camera moves. */
const OVERSCAN = 1.05;
/** Pointer parallax: how far the camera slides around its spot. */
const SWAY = 0.32;
const T = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const FRAMES: GarageFrame[] = ['serah', 'urai', 'xray'];
const colorUrl = (frame: GarageFrame, wide: boolean) => `/images/anatomi/${frame}-${wide ? 2400 : 1600}.webp`;
const depthUrl = (frame: GarageFrame) => `/images/garasi/${frame}-depth.png`;

interface FrameData {
  color: THREE.Texture;
  depth: THREE.Texture;
  /** Depth on the CPU, to put the markers on the surface. */
  sample: (x: number, y: number) => number;
}

const cache = new Map<string, Promise<FrameData>>();

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

function loadFrame(frame: GarageFrame, wide: boolean): Promise<FrameData> {
  const key = `${frame}-${wide}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = Promise.all([loadImage(colorUrl(frame, wide)), loadImage(depthUrl(frame))]).then(([colorImg, depthImg]) => {
      const color = new THREE.Texture(colorImg);
      color.colorSpace = THREE.NoColorSpace; // shown as is: the canvas is "linear" and "flat"
      color.anisotropy = 4;
      color.needsUpdate = true;
      const depth = new THREE.Texture(depthImg);
      depth.colorSpace = THREE.NoColorSpace;
      depth.needsUpdate = true;
      const canvas = document.createElement('canvas');
      canvas.width = depthImg.naturalWidth;
      canvas.height = depthImg.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(depthImg, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sample = (x: number, y: number) => {
        const px = Math.min(width - 1, Math.max(0, Math.round((x / 100) * (width - 1))));
        const py = Math.min(height - 1, Math.max(0, Math.round((y / 100) * (height - 1))));
        return data[(py * width + px) * 4] / 255;
      };
      return { color, depth, sample };
    });
    cache.set(key, promise);
  }
  return promise;
}

const vertexShader = /* glsl */ `
  uniform sampler2D uDepthA;
  uniform sampler2D uDepthB;
  uniform float uWipe;
  uniform float uDepth;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float t = 1.0 - smoothstep(uWipe - 0.03, uWipe + 0.03, uv.x);
    float d = mix(texture2D(uDepthA, uv).r, texture2D(uDepthB, uv).r, t);
    vec3 p = position;
    p.z += d * uDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uColorA;
  uniform sampler2D uColorB;
  uniform float uWipe;
  uniform float uScan;
  varying vec2 vUv;
  void main() {
    vec3 a = texture2D(uColorA, vUv).rgb;
    vec3 b = texture2D(uColorB, vUv).rgb;
    float t = 1.0 - smoothstep(uWipe - 0.012, uWipe + 0.012, vUv.x);
    vec3 c = mix(a, b, t);
    // The scan: a soft blue band with a thin white line at the edge of the wipe.
    float x = vUv.x - uWipe;
    float band = exp(-(x * x) / 0.0012);
    float line = exp(-(x * x) / 0.000006);
    c += (vec3(0.10, 0.50, 0.85) * band * 0.55 + vec3(1.0) * line * 0.75) * uScan;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export interface StageFocus {
  /** Point of the frame, %. */
  x: number;
  y: number;
  zoom: number;
}

interface StageProps {
  frame: GarageFrame;
  focus: StageFocus;
  /** Where on the canvas the focus point should land, 0-1 from the top left. */
  target: { x: number; y: number };
  parts: KeluhanPart[];
  /** Horizontal free area of the canvas in px (between the list and the panel); names stay inside it. */
  bounds: { left: number; right: number };
  reducedMotion: boolean;
  /** Pointer parallax (fine pointers only). */
  sway: boolean;
  onReady: () => void;
}

/** Shared between the scene and the DOM markers, without React renders. */
interface Shared {
  markers: (HTMLElement | null)[];
  parts: KeluhanPart[];
  bounds: { left: number; right: number };
  sample: ((x: number, y: number) => number) | null;
}

function Scene({ frame, focus, target, parts, bounds, reducedMotion, sway, onReady, shared, wide }: StageProps & { shared: Shared; wide: boolean }) {
  const { camera, size, invalidate, gl } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const shown = useRef<GarageFrame | null>(null);
  const view = useRef({ x: 0, y: 0, d: 20 });
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(PLANE_W, PLANE_H, 192, 108), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uColorA: { value: null },
          uColorB: { value: null },
          uDepthA: { value: null },
          uDepthB: { value: null },
          uWipe: { value: -0.2 },
          uScan: { value: 0 },
          uDepth: { value: DEPTH },
        },
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Camera spot for a focus point: the frame covers the canvas at zoom 1, and the
  // focus lands on the target point without the photo's edges coming into view.
  const spotFor = (f: StageFocus) => {
    const aspect = size.width / size.height;
    const dCover = Math.min(PLANE_H / (2 * T), PLANE_W / (2 * T * aspect));
    const d = dCover / (Math.max(f.zoom, 1) * OVERSCAN);
    const halfH = d * T;
    const halfW = halfH * aspect;
    const fx = (f.x / 100 - 0.5) * PLANE_W;
    const fy = (0.5 - f.y / 100) * PLANE_H;
    const ndcX = target.x * 2 - 1;
    const ndcY = 1 - target.y * 2;
    const limitX = PLANE_W / 2 - halfW;
    const limitY = PLANE_H / 2 - halfH;
    return {
      x: THREE.MathUtils.clamp(fx - ndcX * halfW, -limitX, limitX),
      y: THREE.MathUtils.clamp(fy - ndcY * halfH, -limitY, limitY),
      d,
    };
  };

  // Frame changes: load, then wipe in (or show at once the first time).
  useEffect(() => {
    let cancelled = false;
    loadFrame(frame, wide).then((data) => {
      if (cancelled) return;
      const u = material.uniforms;
      const first = shown.current === null;
      shown.current = frame;
      shared.sample = data.sample;
      if (first || reducedMotion) {
        u.uColorA.value = data.color;
        u.uDepthA.value = data.depth;
        u.uColorB.value = data.color;
        u.uDepthB.value = data.depth;
        u.uWipe.value = -0.2;
        invalidate();
        if (first) {
          onReady();
          // Fetch and upload the other frames while idle, so a first pick wipes in at once.
          const warm = () =>
            FRAMES.filter((f) => f !== frame).forEach((f) =>
              loadFrame(f, wide).then((other) => {
                gl.initTexture(other.color);
                gl.initTexture(other.depth);
              }),
            );
          if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(warm, { timeout: 2500 });
          else setTimeout(warm, 1200);
        }
        return;
      }
      if (u.uColorA.value === data.color) return;
      u.uColorB.value = data.color;
      u.uDepthB.value = data.depth;
      gsap.killTweensOf(u.uWipe);
      gsap.killTweensOf(u.uScan);
      gsap
        .timeline({ onUpdate: invalidate })
        .fromTo(u.uWipe, { value: -0.15 }, { value: 1.15, duration: 1.3, ease: 'power2.inOut' }, 0)
        .fromTo(u.uScan, { value: 1 }, { value: 1, duration: 1.1 }, 0)
        .to(u.uScan, { value: 0, duration: 0.25 }, 1.05)
        .call(() => {
          u.uColorA.value = data.color;
          u.uDepthA.value = data.depth;
          u.uWipe.value = -0.2;
          invalidate();
        });
    });
    return () => {
      cancelled = true;
    };
  }, [frame, wide]); // eslint-disable-line react-hooks/exhaustive-deps

  // Camera moves to the focus.
  useEffect(() => {
    const spot = spotFor(focus);
    gsap.killTweensOf(view.current);
    if (reducedMotion) {
      Object.assign(view.current, spot);
      invalidate();
      return;
    }
    gsap.to(view.current, { ...spot, duration: 1.5, ease: 'power3.inOut', delay: 0.1, onUpdate: invalidate });
  }, [focus.x, focus.y, focus.zoom, target.x, target.y, size.width, size.height, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    shared.parts = parts;
    shared.bounds = bounds;
    invalidate();
  }, [parts, bounds, shared, invalidate]);

  // Pointer parallax: the camera slides a little around its spot and keeps looking at it.
  useEffect(() => {
    if (!sway || reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * 2;
      invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [sway, reducedMotion, invalidate]);

  useFrame(() => {
    const p = pointer.current;
    p.x += (p.tx - p.x) * 0.08;
    p.y += (p.ty - p.y) * 0.08;
    if (Math.abs(p.tx - p.x) > 0.001 || Math.abs(p.ty - p.y) > 0.001) invalidate();

    const v = view.current;
    const scale = v.d / 18;
    cam.position.set(v.x + p.x * SWAY * scale, v.y - p.y * SWAY * 0.6 * scale, v.d);
    cam.lookAt(v.x, v.y, 0);
    cam.updateMatrixWorld();

    // Markers sit on the surface of the photo and follow the camera.
    const sample = shared.sample;
    shared.parts.forEach((part, i) => {
      const el = shared.markers[i];
      if (!el || !sample) return;
      tmp.set((part.x / 100 - 0.5) * PLANE_W, (0.5 - part.y / 100) * PLANE_H, sample(part.x, part.y) * DEPTH).project(cam);
      const sx = ((tmp.x + 1) / 2) * size.width;
      const sy = ((1 - tmp.y) / 2) * size.height;
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      // The name goes on its preferred side unless it would leave the free area.
      const label = el.querySelector<HTMLElement>('[data-label]');
      if (label) {
        const room = label.offsetWidth + 20;
        const { left, right } = shared.bounds;
        let side = part.side ?? 'right';
        if (side === 'right' && sx + room > right && sx - room >= left) side = 'left';
        if (side === 'left' && sx - room < left && sx + room <= right) side = 'right';
        label.style.left = side === 'right' ? '1rem' : '';
        label.style.right = side === 'left' ? '1rem' : '';
      }
    });
  });

  return <mesh geometry={geometry} material={material} />;
}

/**
 * The stage canvas with the numbered part markers over it. Phones show the
 * numbers only (the names are in the panel right under the stage).
 */
export function DepthStage(props: StageProps) {
  const [shared] = useState<Shared>(() => ({ markers: [], parts: props.parts, bounds: props.bounds, sample: null }));
  const [ready, setReady] = useState(false);
  const markersRef = useRef<HTMLDivElement>(null);
  const wide = typeof window !== 'undefined' && window.innerWidth * Math.min(window.devicePixelRatio, 2) > 1700;

  // Markers come in one by one once the camera has arrived; they leave at once.
  useEffect(() => {
    const els = shared.markers.slice(0, props.parts.length).filter(Boolean) as HTMLElement[];
    const inner = els.map((el) => el.firstElementChild).filter(Boolean);
    gsap.killTweensOf(inner);
    if (!els.length) return;
    if (props.reducedMotion) {
      gsap.set(inner, { autoAlpha: 1, scale: 1 });
      return;
    }
    gsap.fromTo(inner, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.12, ease: 'back.out(2.2)', delay: 1.35 });
  }, [props.parts, props.reducedMotion, shared]);

  return (
    <div className="absolute inset-0">
      {/* The first frame as a plain photo until the canvas has it. */}
      <img
        src={colorUrl(props.frame, false)}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <Canvas
        frameloop="demand"
        flat
        linear
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 0, 20] }}
        className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      >
        <color attach="background" args={['#04152D']} />
        <Scene
          {...props}
          shared={shared}
          wide={wide}
          onReady={() => {
            setReady(true);
            props.onReady();
          }}
        />
      </Canvas>
      <div ref={markersRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
        {props.parts.map((part, i) => (
          <div
            key={`${props.frame}-${part.label}`}
            ref={(el) => {
              shared.markers[i] = el;
            }}
            className="absolute top-0 left-0"
          >
            <div className="invisible relative">
              <span className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cloud-white bg-stage/85 text-xs font-semibold tabular-nums text-cloud-white shadow-[0_0_0_4px_rgb(4_21_45/0.35)]">
                {i + 1}
              </span>
              <span
                data-label
                className="spec-label absolute top-0 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-stage/85 px-2 py-1 text-[0.6875rem] text-cloud-white sm:block"
              >
                {part.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
