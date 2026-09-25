import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Html, Lightformer, useGLTF } from '@react-three/drei';
import type { PaintId } from '../../data/cars';
import { createPaint } from '../../three/paints';
import { BRAND } from '../../three/materials';
import { Lift } from '../../three/props/Lift';
import { resolveCar, type CarSource } from './cars';

const DRACO = '/draco/';
const BAY = new THREE.Vector3(0, 0, 0);

export type ViewMode = 'overview' | 'side' | 'rear' | 'lift' | 'exploded';

export interface HotspotInfo {
  id: string;
  name: string;
  category: string;
  pos: [number, number, number];
  summary: string;
}

export const HOTSPOTS: HotspotInfo[] = [
  {
    id: 'mesin-transmisi',
    name: 'Mesin & Transmisi',
    category: 'Overhaul & Kalibrasi',
    pos: [-0.9, 0.82, 0],
    summary: 'Overhaul mesin total, flushing transmisi otomatis, dan kalibrasi injector piezo.',
  },
  {
    id: 'kaki-kaki',
    name: 'Kaki-kaki & Suspensi',
    category: 'Under-Chassis & Balancing',
    pos: [1.35, 0.38, 0.95],
    summary: 'Diagnosa shaking machine, balancing roda presisi, bushing arm, dan shock absorber.',
  },
  {
    id: 'elektrikal',
    name: 'Elektrikal & Modul ECU',
    category: 'OEM Computer Diagnostics',
    pos: [0.05, 0.9, -0.3],
    summary: 'Scanning sistem all-brand, coding modul ECU pasca-ganti part, dan perbaikan PCB.',
  },
  {
    id: 'ac',
    name: 'Sistem AC & Pendingin',
    category: 'Climate & Radiator',
    pos: [1.9, 0.42, 0],
    summary: 'Flushing jalur freon khusus, perbaikan kompresor magnetik, dan kuras radiator.',
  },
  {
    id: 'bodi',
    name: 'Salon Bodi & Finishing',
    category: 'Protection & Detailing',
    pos: [0.55, 0.82, 0.85],
    summary: 'Poles multi-tahap, restorasi cat kusam, dan pelapisan nano ceramic coating.',
  },
];

const CAMERA_PRESETS: Record<ViewMode, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [4.4, 1.4, 3.2], target: [0, 0.45, 0] },
  side: { pos: [0.0, 1.1, 5.2], target: [0, 0.45, 0] },
  rear: { pos: [-4.2, 1.3, 3.0], target: [0, 0.45, 0] },
  lift: { pos: [3.0, 0.5, 2.4], target: [0, 1.25, 0] },
  exploded: { pos: [4.2, 2.2, 3.6], target: [0, 0.75, 0] },
};

/** Softbox studio lighting setup inspired by Lamborghini configurator envstudionewnight. */
function DarkStudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#141820" />
      <directionalLight position={[6, 9.5, 5]} intensity={1.4} />
      <directionalLight position={[-6, 7, -5]} intensity={0.8} color="#cce0ff" />

      <Environment resolution={512} frames={1}>
        {/* Overhead broad bank: defines hood and roof curvature */}
        <Lightformer form="rect" intensity={3.5} position={[0, 7.5, 0]} rotation-x={Math.PI / 2} scale={[14, 6, 1]} />
        {/* Flank lightformers: long sharp reflection along the car side body */}
        <Lightformer form="rect" intensity={2.2} position={[-8, 2.8, 1]} rotation-y={Math.PI / 2} scale={[14, 2.5, 1]} />
        <Lightformer form="rect" intensity={2.0} position={[8, 2.8, -1]} rotation-y={-Math.PI / 2} scale={[14, 2.5, 1]} color="#f0f6ff" />
        {/* Front and rear fills */}
        <Lightformer form="rect" intensity={1.5} position={[1, 3, 9]} scale={[16, 3.5, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#dbe5f2" position={[0, 2.5, -9]} rotation-y={Math.PI} scale={[16, 4.5, 1]} />
        {/* Wheel accent rings */}
        <Lightformer form="ring" intensity={1.8} position={[-5, 0.6, 3]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={1.8} position={[5, 0.6, -3]} scale={[3, 3, 1]} />
      </Environment>
    </>
  );
}

/** Luxury dark showroom floor with subtle signature Berlin Red turntable ring. */
function DarkStudioFloor() {
  return (
    <group position={[0, -0.002, 0]}>
      {/* Dark showroom floor plane */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.42} metalness={0.25} />
      </mesh>

      {/* Signature Berlin Red subtle circular turntable track */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <ringGeometry args={[3.3, 3.34, 160]} />
        <meshBasicMaterial color={BRAND.red} toneMapped={false} transparent opacity={0.4} />
      </mesh>

      {/* Lightweight contact shadow under the car */}
      <ContactShadows position={[0, 0.001, 0]} scale={11} blur={2.2} far={1.6} opacity={0.78} resolution={512} color="#000000" />
    </group>
  );
}

interface ExplodedPart {
  node: THREE.Object3D;
  origPos: THREE.Vector3;
  targetOffset: THREE.Vector3;
}

function StudioCar({
  source,
  paint,
  liftY,
  explodeAmount,
}: {
  source: CarSource;
  paint: PaintId;
  liftY: number;
  explodeAmount: number;
}) {
  const gltf = useGLTF(source.url, DRACO);
  const partsRef = useRef<ExplodedPart[]>([]);
  const carGroupRef = useRef<THREE.Group>(null);

  const paintMaterial = useMemo(() => createPaint(paint), [paint]);

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

    // Register exploded parts
    const parts: ExplodedPart[] = [];
    root.traverse((o: THREE.Object3D) => {
      const name = o.name.toLowerCase();
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

    // Apply materials
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#0e141c',
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.88,
      envMapIntensity: 2.5,
    });
    const trim = new THREE.MeshStandardMaterial({ color: '#656a72', metalness: 0.85, roughness: 0.28, envMapIntensity: 1.8 });
    const rims = new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.96, roughness: 0.18, envMapIntensity: 2.2 });
    const tires = new THREE.MeshStandardMaterial({ color: '#141618', metalness: 0.04, roughness: 0.88 });
    const head = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f0f6ff', emissiveIntensity: 2.8, roughness: 0.1 });
    const tail = new THREE.MeshStandardMaterial({ color: '#440000', emissive: BRAND.red, emissiveIntensity: 3.5, roughness: 0.15 });

    root.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const n = mesh.name.toLowerCase();
      if (/^body$/i.test(n) || /^paint/i.test(n) || (source.isFerrari && /^body/i.test(n))) {
        mesh.material = paintMaterial;
      } else if (/glass/i.test(n)) {
        mesh.material = glass;
      } else if (/rim/i.test(n)) {
        mesh.material = rims;
      } else if (/tire/i.test(n)) {
        mesh.material = tires;
      } else if (/lights_red/i.test(n)) {
        mesh.material = tail;
      } else if (/lights|leds/i.test(n)) {
        mesh.material = head;
      } else if (/trim|chrome|metal|grills/i.test(n)) {
        mesh.material = trim;
      }
    });

    return root;
  }, [gltf, source, paintMaterial]);

  useFrame(() => {
    // Smooth lift movement
    if (carGroupRef.current) {
      carGroupRef.current.position.y = liftY;
    }

    // Exploded view separation
    for (const part of partsRef.current) {
      part.node.position.x = part.origPos.x + part.targetOffset.x * explodeAmount;
      part.node.position.y = part.origPos.y + part.targetOffset.y * explodeAmount;
      part.node.position.z = part.origPos.z + part.targetOffset.z * explodeAmount;
    }
  });

  return (
    <group ref={carGroupRef} position={BAY}>
      <primitive object={model} />
    </group>
  );
}

function StudioHotspots({
  liftY,
  visible = true,
  selected,
  onSelect,
}: {
  liftY: number;
  visible?: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (!visible) return null;

  return (
    <group position={[BAY.x, liftY, BAY.z]}>
      {HOTSPOTS.map((spot) => {
        const isSelected = selected === spot.id;
        return (
          <group key={spot.id} position={spot.pos}>
            <Html center style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                data-hotspot={spot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(isSelected ? null : spot.id);
                }}
                className={`group relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-berlin-red ring-4 ring-berlin-red/40 scale-125 shadow-[0_0_20px_rgb(249_0_13/0.8)]'
                    : 'bg-jet-black/85 border border-cloud-white/40 hover:border-berlin-red hover:scale-125 hover:bg-jet-black shadow-lg'
                }`}
                aria-label={`Inspeksi ${spot.name}`}
              >
                {/* Subtle pulsing beacon */}
                <span className="absolute -inset-1 rounded-full bg-berlin-red/30 animate-ping pointer-events-none" />

                {/* Core indicator */}
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    isSelected ? 'bg-white' : 'bg-berlin-red'
                  }`}
                />

                {/* Micro tooltip on hover */}
                <span className="pointer-events-none absolute left-1/2 -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-jet-black/95 px-2.5 py-1 text-[11px] font-medium text-cloud-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 border border-cloud-white/20 shadow-xl z-50">
                  {spot.name}
                </span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export interface DarkStudioSceneProps {
  activePaint: PaintId;
  viewMode: ViewMode;
  autoRotate: boolean;
  showHotspots?: boolean;
  selectedHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  onReady?: () => void;
}

function StudioControls({
  controlsRef,
  autoRotate,
}: {
  controlsRef: React.RefObject<CameraControls | null>;
  autoRotate: boolean;
}) {
  useFrame((_, delta) => {
    if (autoRotate && controlsRef.current && controlsRef.current.currentAction === 0) {
      controlsRef.current.azimuthAngle += delta * 0.25;
    }
  });

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={3.2}
      maxDistance={12}
      maxPolarAngle={Math.PI / 2 + 0.02}
      dollyToCursor
    />
  );
}

export function DarkStudioScene({
  activePaint,
  viewMode,
  autoRotate,
  showHotspots = true,
  selectedHotspot,
  onSelectHotspot,
  onReady,
}: DarkStudioSceneProps) {
  const controlsRef = useRef<CameraControls>(null);
  const [car, setCar] = useState<CarSource | null>(null);

  // Animated lift height (0 to 1.75)
  const [liftHeight, setLiftHeight] = useState(0);
  // Animated exploded amount (0 to 1)
  const [explodeAmount, setExplodeAmount] = useState(0);

  useEffect(() => {
    resolveCar().then((c) => {
      setCar(c);
      onReady?.();
    });
  }, [onReady]);

  // Handle camera viewpoints & animation
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (viewMode === 'lift') {
      setLiftHeight(1.75);
      setExplodeAmount(0);
    } else if (viewMode === 'exploded') {
      setLiftHeight(0);
      setExplodeAmount(1);
    } else {
      setLiftHeight(0);
      setExplodeAmount(0);
    }

    const isMobile = window.innerWidth < 640;
    const mult = isMobile ? 1.35 : 1.0;
    const targetPreset = CAMERA_PRESETS[viewMode];
    if (targetPreset) {
      const [px, py, pz] = targetPreset.pos;
      const [tx, ty, tz] = targetPreset.target;
      controls.setLookAt(px * mult, py * mult, pz * mult, tx, ty, tz, true);
    }
  }, [viewMode]);

  // Handle hotspot selection camera focus
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !selectedHotspot) return;
    const spot = HOTSPOTS.find((h) => h.id === selectedHotspot);
    if (!spot) return;

    const isMobile = window.innerWidth < 640;
    const dist = isMobile ? 3.2 : 2.4;
    const [sx, sy, sz] = spot.pos;
    const targetY = sy + liftHeight;
    controls.setLookAt(sx + dist, targetY + 0.6, sz + dist, sx, targetY, sz, true);
  }, [selectedHotspot, liftHeight]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: isMobile ? 46 : 36, near: 0.1, far: 80, position: isMobile ? [5.8, 1.8, 4.2] : [4.4, 1.4, 3.2] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color('#08080a');
      }}
    >
      <fog attach="fog" args={['#08080a', 15, 45]} />
      <DarkStudioLighting />
      <DarkStudioFloor />

      {/* Procedural two-post lift (appears when in Lift mode) */}
      {viewMode === 'lift' && <Lift position={[0, 0, 0]} height={liftHeight} />}

      <Suspense fallback={null}>
        {car && (
          <StudioCar
            source={car}
            paint={activePaint}
            liftY={liftHeight}
            explodeAmount={explodeAmount}
          />
        )}
        <StudioHotspots
          liftY={liftHeight}
          visible={showHotspots}
          selected={selectedHotspot}
          onSelect={onSelectHotspot}
        />
      </Suspense>

      <StudioControls controlsRef={controlsRef} autoRotate={autoRotate} />
    </Canvas>
  );
}
