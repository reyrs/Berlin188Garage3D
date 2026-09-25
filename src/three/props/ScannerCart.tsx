import type { ThreeElements } from '@react-three/fiber';
import { MAT } from '../materials';

/** Diagnostic scanner cart (dark body, monitor on a pole). */
export function ScannerCart(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh material={MAT.plastic} position={[0, 0.48, 0]}>
        <boxGeometry args={[0.52, 0.74, 0.42]} />
      </mesh>
      {/* Drawer fronts. */}
      {[0.3, 0.5, 0.7].map((y) => (
        <mesh key={y} material={MAT.darkMetal} position={[0.262, y, 0]}>
          <boxGeometry args={[0.01, 0.16, 0.36]} />
        </mesh>
      ))}
      <mesh material={MAT.darkMetal} position={[0, 0.87, 0]}>
        <boxGeometry args={[0.56, 0.04, 0.46]} />
      </mesh>
      <mesh material={MAT.steel} position={[-0.12, 1.05, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.36, 10]} />
      </mesh>
      <group position={[-0.1, 1.28, 0]} rotation-z={-0.18}>
        <mesh material={MAT.darkMetal}>
          <boxGeometry args={[0.05, 0.32, 0.48]} />
        </mesh>
        <mesh material={MAT.screen} position={[0.027, 0, 0]}>
          <boxGeometry args={[0.005, 0.27, 0.43]} />
        </mesh>
      </group>
      {[
        [0.2, 0.17],
        [0.2, -0.17],
        [-0.2, 0.17],
        [-0.2, -0.17],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} material={MAT.rubber} position={[x, 0.05, z]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.035, 14]} />
        </mesh>
      ))}
    </group>
  );
}
