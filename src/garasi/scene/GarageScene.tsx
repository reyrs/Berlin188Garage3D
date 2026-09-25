import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, MeshReflectorMaterial, useGLTF, useTexture } from '@react-three/drei';
import { gsap } from '../../lib/gsap';
import { createDissolve } from '../../three/dissolve';
import { serviceInquiryLink } from '../../lib/whatsapp';
import { GARAGE_META } from '../garageMeta';
import { LIFT_TOP, story } from '../story';
import { resolveCar, type CarSource } from './cars';

const BASE = '/garage';
const DRACO = '/draco/';
/** Bay centre on the floor (Blender x 0.3, y 0 → three x 0.3, z 0). */
const BAY = new THREE.Vector3(0.3, 0, 0);
/** Pads start this far under the sills: the car only rises once they touch. */
const PAD_GAP = 0.04;

type TexSet = { diff: THREE.Texture; rough: THREE.Texture; nor: THREE.Texture };

function tiled(set: TexSet, repeatX: number, repeatY = repeatX): TexSet {
  const out = {} as TexSet;
  for (const key of ['diff', 'rough', 'nor'] as const) {
    const t = set[key].clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    t.anisotropy = 8;
    t.colorSpace = key === 'diff' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.needsUpdate = true;
    out[key] = t;
  }
  return out;
}

function useTexSet(id: string): TexSet {
  const [diff, rough, nor] = useTexture([`${BASE}/tex/${id}_diff.jpg`, `${BASE}/tex/${id}_rough.jpg`, `${BASE}/tex/${id}_nor.jpg`]);
  return { diff, rough, nor };
}

/**
 * The baked room. Diffuse surfaces are unlit (texture × baked lightmap, so they
 * look exactly as in Blender); metals keep PBR shading for reflections of the
 * environment, with the lightmap as their diffuse fill. Lightmaps are stored
 * as (irradiance / intensity)^(1/2.2): sRGB decoding undoes the curve and
 * three's lightmap maths divides by π, hence intensity × π.
 */
function Garage({ liftRef }: { liftRef: React.RefObject<THREE.Group | null> }) {
  const gltf = useGLTF(`${BASE}/garage.glb`, DRACO);
  const lightmap = useTexture(`${BASE}/${GARAGE_META.room.lightmap}`);
  const logo = useTexture('/brand/logo-dark.png');
  const wall = useTexSet('wall');
  const shutter = useTexSet('shutter');
  const plate = useTexSet('plate');

  const scene = useMemo(() => {
    lightmap.flipY = false; // glTF UV convention
    lightmap.channel = 1;
    lightmap.colorSpace = THREE.SRGBColorSpace;
    lightmap.needsUpdate = true;

    // Logo sign in glTF has V=0 at top and V=1 at bottom, so flipY = false renders it upright and unmirrored
    const logoFixed = logo.clone();
    logoFixed.flipY = false;
    logoFixed.colorSpace = THREE.SRGBColorSpace;
    logoFixed.needsUpdate = true;

    const lmI = GARAGE_META.room.intensity * Math.PI;
    const tile = GARAGE_META.tile;
    const wallT = tiled(wall, 1 / tile.wall);
    const shutterT = tiled(shutter, 1 / tile.shutter);
    const plateT = tiled(plate, 1 / tile.plate);

    const root = gltf.scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const orig = mesh.material as THREE.MeshStandardMaterial;
      const baked = Boolean(mesh.geometry.attributes.uv1);
      const lm = baked ? { lightMap: lightmap, lightMapIntensity: lmI } : {};
      const std = (extra: THREE.MeshStandardMaterialParameters = {}) =>
        new THREE.MeshStandardMaterial({
          color: orig.color,
          roughness: orig.roughness,
          metalness: orig.metalness,
          envMapIntensity: 0.9,
          ...lm,
          ...extra,
        });
      switch (orig.name) {
        case 'wall':
          mesh.material = new THREE.MeshBasicMaterial({ map: wallT.diff, ...lm });
          break;
        case 'ceiling':
        case 'rubber':
        case 'paint_red':
          mesh.material = new THREE.MeshBasicMaterial({ color: orig.color, ...lm });
          break;
        case 'shutter':
          mesh.material = std({ color: 0xffffff, map: shutterT.diff, roughnessMap: shutterT.rough, normalMap: shutterT.nor });
          break;
        case 'plate':
          mesh.material = std({ color: 0xffffff, map: plateT.diff, roughnessMap: plateT.rough, normalMap: plateT.nor });
          break;
        case 'led':
          mesh.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.98, 0.95).multiplyScalar(4) });
          break;
        case 'screen':
          mesh.material = new THREE.MeshBasicMaterial({ color: new THREE.Color('#8fb8ff').multiplyScalar(1.4) });
          break;
        case 'logo':
          mesh.material = new THREE.MeshBasicMaterial({ map: logoFixed, transparent: true, depthWrite: false });
          break;
        default:
          mesh.material = std();
      }
    });
    return root;
  }, [gltf, lightmap, logo, wall, shutter, plate]);

  // The moving lift parts are handed to the rig that raises them.
  useLayoutEffect(() => {
    const group = liftRef.current;
    if (!group) return;
    for (const name of ['lift_l', 'lift_r']) {
      const part = scene.getObjectByName(name);
      if (part) group.add(part);
    }
  }, [scene, liftRef]);

  return <primitive object={scene} />;
}

/** Floor: a real-time reflection over the baked floor texture + lightmap. */
function Floor({ mobile }: { mobile: boolean }) {
  const floor = useTexSet('floor');
  const lightmap = useTexture(`${BASE}/${GARAGE_META.floor.lightmap}`);
  const [w, d] = GARAGE_META.floor.size;
  const [cx, cy] = GARAGE_META.floor.centre;
  const tex = useMemo(() => {
    lightmap.colorSpace = THREE.SRGBColorSpace;
    lightmap.channel = 0;
    lightmap.needsUpdate = true;
    return tiled(floor, w / GARAGE_META.tile.floor, d / GARAGE_META.tile.floor);
  }, [floor, lightmap, w, d]);
  return (
    // Blender (x, y) → three (x, -z); the plane's UVs match the bake's planar UVs.
    <mesh rotation-x={-Math.PI / 2} position={[cx, 0, -cy]}>
      <planeGeometry args={[w, d]} />
      <MeshReflectorMaterial
        map={tex.diff}
        roughnessMap={tex.rough}
        normalMap={tex.nor}
        normalScale={new THREE.Vector2(0.6, 0.6)}
        lightMap={lightmap}
        lightMapIntensity={GARAGE_META.floor.intensity * Math.PI}
        roughness={1}
        metalness={0}
        envMapIntensity={0.25}
        resolution={mobile ? 512 : 1024}
        blur={[400, 120]}
        mixBlur={1.2}
        mixStrength={2.2}
        mixContrast={1}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.3}
        mirror={0}
      />
    </mesh>
  );
}

interface ExplodedPart {
  node: THREE.Object3D;
  origPos: THREE.Vector3;
  targetOffset: THREE.Vector3;
}

/** The car: normalised to its real length, nose to +X, wheels on the floor, centred on the bay. */
function Car({
  source,
  carRef,
  onCarYChange,
}: {
  source: CarSource;
  carRef: React.RefObject<THREE.Group | null>;
  onCarYChange?: (y: number) => void;
}) {
  const gltf = useGLTF(source.url, DRACO);
  const dissolve = useMemo(() => createDissolve(), []);
  const partsRef = useRef<ExplodedPart[]>([]);

  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.rotation.y = source.yaw;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    root.scale.setScalar(source.length / Math.max(size.x, size.z));
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    const centre = box.getCenter(new THREE.Vector3());
    root.position.set(-centre.x, -box.min.y, -centre.z);

    // Register parts that detach during exploded view
    const parts: ExplodedPart[] = [];
    root.traverse((o: THREE.Object3D) => {
      const name = o.name.toLowerCase();
      // Identify movable components
      if (/wheel_fl|rim_fl|tire.*fl/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(-0.15, 0, 0.7) });
      } else if (/wheel_fr|rim_fr|tire.*fr/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(-0.15, 0, -0.7) });
      } else if (/wheel_rl|rim_rl|tire.*rl/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(0.15, 0, 0.7) });
      } else if (/wheel_rr|rim_rr|tire.*rr/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(0.15, 0, -0.7) });
      } else if (/^body$/i.test(name) || /hood/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(0, 0.38, 0) });
      } else if (/^glass$/i.test(name)) {
        parts.push({ node: o, origPos: o.position.clone(), targetOffset: new THREE.Vector3(0, 0.58, 0) });
      }
    });
    partsRef.current = parts;

    // Apply dissolve shader to all meshes
    const clones = new Map<THREE.Material, THREE.Material>();
    root.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const original = mesh.material as THREE.Material;
      if (Array.isArray(original)) {
        mesh.material = original.map((m) => {
          if (!clones.has(m)) clones.set(m, dissolve.apply(m.clone()));
          return clones.get(m)!;
        });
      } else if (original) {
        if (!clones.has(original)) clones.set(original, dissolve.apply(original.clone()));
        mesh.material = clones.get(original)!;
      }
    });

    return root;
  }, [gltf, source, dissolve]);

  // Entrance dissolve scan-in
  useEffect(() => {
    dissolve.uniforms.uDissolve.value = 1;
    const tween = gsap.to(dissolve.uniforms.uDissolve, {
      value: 0,
      duration: 2.2,
      delay: 0.25,
      ease: 'power2.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [dissolve]);

  useFrame(() => {
    if (carRef.current) {
      dissolve.uniforms.uCarInv.value.copy(carRef.current.matrixWorld).invert();
      onCarYChange?.(carRef.current.position.y);
    }
    // Exploded view animation: parts separate during explode, assemble back during outro
    const p = ease(story.explode) * (1 - ease(story.outro));
    for (const part of partsRef.current) {
      part.node.position.x = part.origPos.x + part.targetOffset.x * p;
      part.node.position.y = part.origPos.y + part.targetOffset.y * p;
      part.node.position.z = part.origPos.z + part.targetOffset.z * p;
    }
  });

  return (
    <group ref={carRef} position={BAY}>
      <primitive object={model} />
    </group>
  );
}

// ---------------------------------------------------------------- hotspots

interface ServiceHotspot {
  id: string;
  name: string;
  category: string;
  pos: [number, number, number];
  desc: string;
}

const SERVICE_HOTSPOTS: ServiceHotspot[] = [
  {
    id: 'mesin-transmisi',
    name: 'Mesin & Transmisi',
    category: 'Overhaul & Kalibrasi',
    pos: [1.1, 0.95, 0],
    desc: 'Penurunan mesin menyeluruh, overhaul transmisi matic, flushing oli, & kalibrasi injector piezo.',
  },
  {
    id: 'kaki-kaki',
    name: 'Kaki-kaki & Suspensi',
    category: 'Under-Chassis & Balancing',
    pos: [1.2, 0.35, 1.2],
    desc: 'Uji shaking machine, wheel balancer, bushing arm, tie rod, & peredam kejut presisi.',
  },
  {
    id: 'elektrikal',
    name: 'Elektrikal & Modul ECU',
    category: 'OEM Computer Diagnostics',
    pos: [0.0, 1.25, 0],
    desc: 'Full scan all-brand OEM, coding modul baru, & perbaikan fisik sirkuit motherboard ECU.',
  },
  {
    id: 'ac',
    name: 'Sistem AC & Pendingin',
    category: 'Climate & Radiator',
    pos: [2.0, 0.65, 0],
    desc: 'Flushing jalur refrigerant, servis kompresor magnetik, kondensor, & kuras radiator.',
  },
  {
    id: 'bodi',
    name: 'Salon Bodi & Eksterior',
    category: 'Finishing & Coating',
    pos: [-1.2, 1.35, -0.65],
    desc: 'Poles multi-tahap, restorasi cat bodi, & perlindungan nano ceramic coating kilap tinggi.',
  },
];

function ExplodedHotspots({ carY }: { carY: number }) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useFrame(() => {
    const show = story.explode > 0.05 && story.outro < 0.25;
    if (show !== visible) setVisible(show);
  });

  if (!visible) return null;

  return (
    <group position={[BAY.x, carY, BAY.z]}>
      {SERVICE_HOTSPOTS.map((spot) => {
        const isOpen = active === spot.id;
        return (
          <group key={spot.id} position={spot.pos}>
            <Html center distanceFactor={14} style={{ pointerEvents: 'auto' }}>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActive(isOpen ? null : spot.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md border shadow-float cursor-pointer transition-all duration-300 ${
                    isOpen
                      ? 'bg-berlin-red border-white text-white scale-105'
                      : 'bg-jet-black/85 border-cloud-white/20 text-cloud-white hover:border-berlin-red hover:scale-105'
                  }`}
                  aria-label={`Lihat detail ${spot.name}`}
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-berlin-red opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-berlin-red" />
                  </span>
                  <span className="text-xs font-bold whitespace-nowrap">{spot.name}</span>
                </button>
                {isOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 rounded-xl bg-jet-black/95 p-3.5 backdrop-blur-lg border border-cloud-white/15 shadow-2xl text-left z-50">
                    <p className="spec-label text-berlin-blue-light text-[0.65rem]">{spot.category}</p>
                    <p className="mt-1 font-bold text-sm text-cloud-white">{spot.name}</p>
                    <p className="mt-1 text-xs text-cloud-white/80 leading-relaxed">{spot.desc}</p>
                    <a
                      href={serviceInquiryLink(spot.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-berlin-red-light hover:underline"
                    >
                      Konsultasikan via WhatsApp &rarr;
                    </a>
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------- camera path

type Pose = { pos: THREE.Vector3; look: THREE.Vector3 };
const pose = (px: number, py: number, pz: number, lx: number, ly: number, lz: number): Pose => ({
  pos: new THREE.Vector3(px, py, pz),
  look: new THREE.Vector3(lx, ly, lz),
});
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Around the bay: front three-quarter (θ ≈ 45°) through the profile to the rear. */
function orbit(theta: number, radius: number, height: number, out: Pose) {
  out.pos.set(BAY.x + Math.cos(theta) * radius, height, BAY.z + Math.sin(theta) * radius);
  out.look.set(BAY.x, 0.72, BAY.z);
  return out;
}
const TH0 = THREE.MathUtils.degToRad(44);
const TH1 = THREE.MathUtils.degToRad(205);
const UNDER = pose(3.3, 0.32, 3.1, 0.3, 1.35, 0);
const EXPLODED = pose(4.5, 2.2, 4.0, 0.3, 1.45, 0);
const WIDE = pose(6.1, 2.7, 7.3, -1.2, 1.15, -1.1);

function lerpPose(a: Pose, b: Pose, t: number, out: Pose) {
  out.pos.lerpVectors(a.pos, b.pos, t);
  out.look.lerpVectors(a.look, b.look, t);
  return out;
}

function Rig({
  carRef,
  liftRef,
  reducedMotion,
  mobile,
}: {
  carRef: React.RefObject<THREE.Group | null>;
  liftRef: React.RefObject<THREE.Group | null>;
  reducedMotion: boolean;
  mobile: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const current = useRef<Pose | null>(null);
  const scratch = useMemo(() => ({ a: pose(0, 0, 0, 0, 0, 0), b: pose(0, 0, 0, 0, 0, 0), target: pose(0, 0, 0, 0, 0, 0) }), []);
  const lift = useRef(0);

  useFrame((_, dt) => {
    const { a, target } = scratch;
    // Phones stand further back so the whole car fits the narrow frame.
    const r = mobile ? 8.4 : 6.2;
    const hRaise = mobile ? 0.5 : 0;

    // Chapters run in order: the latest one active determines target camera pose
    orbit(TH0, r + 0.7 * (1 - story.hero), 1.55 + hRaise, target);
    if (story.process > 0) {
      const p = ease(story.process);
      orbit(TH0 + (TH1 - TH0) * p, r, 1.45 + hRaise + 0.5 * Math.sin(p * Math.PI), target);
    }
    if (story.lift > 0) {
      orbit(TH1, r, 1.45 + hRaise, a);
      lerpPose(a, UNDER, ease(clamp01(story.lift / 0.7)), target);
    }
    if (story.explode > 0) {
      lerpPose(UNDER, EXPLODED, ease(story.explode), target);
    }
    if (story.outro > 0) {
      lerpPose(EXPLODED, WIDE, ease(story.outro), target);
    }

    if (!current.current) current.current = pose(0, 0, 0, 0, 0, 0);
    const cur = current.current;
    const first = cur.pos.lengthSq() === 0;
    const k = reducedMotion || first ? 1 : 1 - Math.exp(-dt * 3.5);
    cur.pos.lerp(target.pos, k);
    cur.look.lerp(target.look, k);
    camera.position.copy(cur.pos);
    camera.lookAt(cur.look);

    // Lift: carriages rise over the lift chapter and stay raised during explode & outro
    let want = 0;
    if (story.lift > 0) {
      want = LIFT_TOP * THREE.MathUtils.smoothstep(story.lift, 0.15, 0.85);
    }
    if (story.explode > 0 || story.outro > 0) {
      want = LIFT_TOP;
    }
    lift.current += (want - lift.current) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    if (liftRef.current) liftRef.current.position.y = lift.current;
    if (carRef.current) carRef.current.position.y = Math.max(0, lift.current - PAD_GAP);
  });
  return null;
}

// --------------------------------------------------------------------- canvas

export function GarageCanvas({ reducedMotion, onReady }: { reducedMotion: boolean; onReady: () => void }) {
  const [car, setCar] = useState<CarSource | null>(null);
  const [carY, setCarY] = useState(0);
  const mobile = useMemo(() => window.matchMedia('(max-width: 767px)').matches, []);
  const carRef = useRef<THREE.Group>(null);
  const liftRef = useRef<THREE.Group>(null);

  useEffect(() => {
    resolveCar().then(setCar);
  }, []);

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: mobile ? 50 : 38, near: 0.05, far: 60, position: [6, 1.6, 6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={['#0b0b0c']} />
      <Suspense fallback={null}>
        <Environment files={`${BASE}/env.hdr`} environmentIntensity={1} />
        <Garage liftRef={liftRef} />
        <Floor mobile={mobile} />
        <group ref={liftRef} />
        {car && <Car source={car} carRef={carRef} onCarYChange={setCarY} />}
        <ExplodedHotspots carY={carY} />
        <ContactShadows position={[BAY.x, 0.006, BAY.z]} scale={[6.5, 3.4]} resolution={512} blur={2.4} far={1.4} opacity={0.85} />
        <Ready onReady={onReady} when={Boolean(car)} />
      </Suspense>
      <Rig carRef={carRef} liftRef={liftRef} reducedMotion={reducedMotion} mobile={mobile} />
    </Canvas>
  );
}

/** Fires once everything inside the Suspense boundary has rendered a frame. */
function Ready({ onReady, when }: { onReady: () => void; when: boolean }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current || !when) return;
    done.current = true;
    onReady();
  });
  return null;
}
