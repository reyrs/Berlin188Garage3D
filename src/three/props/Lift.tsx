import type { ThreeElements } from '@react-three/fiber';
import { MAT } from '../materials';

const POST_Z = 1.72;
const POST_H = 2.8;

function Arm({ side, dir }: { side: number; dir: number }) {
  // Arms swing from the carriage toward the car, splayed front/rear.
  return (
    <group position={[0, 0.2, -side * 0.26]} rotation-y={dir * 0.45 * side}>
      <mesh material={MAT.darkMetal} position={[0, 0, -side * 0.55]}>
        <boxGeometry args={[0.11, 0.07, 1.1]} />
      </mesh>
      <mesh material={MAT.rubber} position={[0, 0.05, -side * 1.06]}>
        <cylinderGeometry args={[0.075, 0.075, 0.05, 20]} />
      </mesh>
    </group>
  );
}

function Post({ z, withMotor = false, height = 0 }: { z: number; withMotor?: boolean; height?: number }) {
  const side = Math.sign(z);
  return (
    <group position={[0, 0, z]}>
      <mesh material={MAT.darkMetal} position={[0, 0.015, 0]}>
        <boxGeometry args={[0.62, 0.03, 0.56]} />
      </mesh>
      <mesh material={MAT.liftBlue} position={[0, POST_H / 2, 0]}>
        <boxGeometry args={[0.28, POST_H, 0.36]} />
      </mesh>
      {/* Inner channel facing the bay. */}
      <mesh material={MAT.darkMetal} position={[0, POST_H / 2, -side * 0.182]}>
        <boxGeometry args={[0.12, POST_H - 0.2, 0.01]} />
      </mesh>
      {/* Moving carriage & arms */}
      <group position-y={height}>
        <mesh material={MAT.liftBlue} position={[0, 0.42, -side * 0.21]}>
          <boxGeometry args={[0.34, 0.5, 0.1]} />
        </mesh>
        <Arm side={side} dir={1} />
        <Arm side={side} dir={-1} />
      </group>
      {/* Head cap; the power post also carries the motor pack, as in the photos. */}
      <mesh material={MAT.darkMetal} position={[0, POST_H + 0.03, 0]}>
        <boxGeometry args={[0.36, 0.06, 0.44]} />
      </mesh>
      {withMotor && (
        <group position={[0, POST_H - 0.32, side * 0.27]}>
          <mesh material={MAT.plastic}>
            <boxGeometry args={[0.22, 0.3, 0.16]} />
          </mesh>
          <mesh material={MAT.steel} position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.2, 20]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export type LiftProps = ThreeElements['group'] & {
  height?: number;
};

/** Two-post floor-plate lift in Berlin Blue (as in the reference photos). */
export function Lift({ height = 0, ...props }: LiftProps) {
  return (
    <group {...props}>
      <Post z={POST_Z} withMotor height={height} />
      <Post z={-POST_Z} height={height} />
      {/* Floor plate covering the hydraulic line between the posts. */}
      <mesh material={MAT.darkMetal} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.3, 0.04, POST_Z * 2 - 0.5]} />
      </mesh>
    </group>
  );
}
