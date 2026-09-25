import type { ThreeElements } from '@react-three/fiber';
import { MAT } from '../materials';

const PIVOT: [number, number, number] = [0.05, 1.6, 0];
const RAM_BASE: [number, number] = [0.05, 0.55];
const BOOM_LENGTH = 1.65;

/** Hydraulic ram between the mast foot and the boom, recomputed for a boom angle. */
function ramTransform(boomAngle: number) {
  // Attachment point on the boom, 0.6 m out from the pivot, just below it.
  const lx = -0.6;
  const ly = -0.05;
  const cos = Math.cos(boomAngle);
  const sin = Math.sin(boomAngle);
  const px = PIVOT[0] + lx * cos - ly * sin;
  const py = PIVOT[1] + lx * sin + ly * cos;
  const vx = px - RAM_BASE[0];
  const vy = py - RAM_BASE[1];
  const length = Math.hypot(vx, vy);
  return {
    position: [RAM_BASE[0] + vx / 2, RAM_BASE[1] + vy / 2, 0] as [number, number, number],
    rotationZ: Math.atan2(-vx, vy),
    length,
  };
}

function Caster({ position }: { position: [number, number, number] }) {
  return (
    <mesh material={MAT.rubber} position={position} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[0.055, 0.055, 0.04, 16]} />
    </mesh>
  );
}

interface EngineCraneProps extends Omit<ThreeElements['group'], 'children'> {
  /** Boom angle around Z in radians; negative lifts the tip. */
  boomAngle?: number;
}

/** Folding shop crane in Berlin Red. The boom reaches toward local -X. */
export function EngineCrane({ boomAngle = -0.25, ...props }: EngineCraneProps) {
  const ram = ramTransform(boomAngle);
  return (
    <group {...props}>
      {/* Base: two legs toward -X, a rear cross member, four casters. */}
      {[-0.34, 0.34].map((z) => (
        <mesh key={z} material={MAT.craneRed} position={[-0.68, 0.1, z]}>
          <boxGeometry args={[1.45, 0.08, 0.08]} />
        </mesh>
      ))}
      <mesh material={MAT.craneRed} position={[0.05, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.76]} />
      </mesh>
      <Caster position={[-1.36, 0.055, 0.34]} />
      <Caster position={[-1.36, 0.055, -0.34]} />
      <Caster position={[0.05, 0.055, 0.34]} />
      <Caster position={[0.05, 0.055, -0.34]} />

      {/* Mast. */}
      <mesh material={MAT.craneRed} position={[0.05, 0.86, 0]}>
        <boxGeometry args={[0.1, 1.52, 0.1]} />
      </mesh>

      {/* Ram: red barrel with a steel rod. */}
      <group position={ram.position} rotation-z={ram.rotationZ}>
        <mesh material={MAT.craneRed} position={[0, -ram.length * 0.2, 0]}>
          <cylinderGeometry args={[0.045, 0.045, ram.length * 0.6, 16]} />
        </mesh>
        <mesh material={MAT.steel} position={[0, ram.length * 0.25, 0]}>
          <cylinderGeometry args={[0.022, 0.022, ram.length * 0.5, 12]} />
        </mesh>
      </group>

      {/* Boom, pivoting at the mast top. */}
      <group position={PIVOT} rotation-z={boomAngle}>
        <mesh material={MAT.craneRed} position={[-BOOM_LENGTH / 2, 0, 0]}>
          <boxGeometry args={[BOOM_LENGTH, 0.09, 0.09]} />
        </mesh>
        <mesh material={MAT.steel} position={[-BOOM_LENGTH - 0.12, 0, 0]}>
          <boxGeometry args={[0.3, 0.065, 0.065]} />
        </mesh>
        {/* Chain + hook hang straight down whatever the boom angle. */}
        <group position={[-BOOM_LENGTH - 0.24, 0, 0]} rotation-z={-boomAngle}>
          <mesh material={MAT.steel} position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
          </mesh>
          <mesh material={MAT.steel} position={[0, -0.4, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.05, 0.013, 8, 20, Math.PI * 1.5]} />
          </mesh>
        </group>
      </group>

      {/* Push handle. */}
      <mesh material={MAT.rubber} position={[0.2, 0.95, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
      </mesh>
    </group>
  );
}
