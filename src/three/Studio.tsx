import { Backdrop, ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceTier } from '../hooks/useDeviceTier';
import { BRAND } from './materials';
import { CAMERA_AZIMUTH } from './CameraRig';
import { Lift } from './props/Lift';
import { EngineCrane } from './props/EngineCrane';
import { ScannerCart } from './props/ScannerCart';

const CYC_DISTANCE = 12.5;

/*
 * Floor stack, bottom to top. drei's ContactShadows blurs on a plane at the
 * world origin seen from its own camera, which looks up from SHADOW_Y, so
 * that camera must sit below y = 0, and everything that should not cast a
 * contact shadow (floor, painted arc) must sit below the camera.
 */
const FLOOR_Y = -0.006;
const ARC_Y = -0.004;
const SHADOW_Y = -0.002;
/** Backdrop's local +Z (its open side) turned toward the camera azimuth. */
const CYC_YAW = Math.PI / 2 - CAMERA_AZIMUTH;

/**
 * Softbox rig: reflections on the paint without shipping an HDR file. An
 * overhead bank, two side strips (the long highlight along the flanks), a
 * front fill and two low rings for the wheels.
 */
function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 9.5, 5]} intensity={1.2} />
      <directionalLight position={[-6, 7, -5]} intensity={0.5} color="#cce0ff" />
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 7.5, 0]} rotation-x={Math.PI / 2} scale={[14, 6, 1]} />
        <Lightformer form="rect" intensity={2} position={[-8, 2.8, 1]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[8, 2.8, -1]} rotation-y={-Math.PI / 2} scale={[12, 3, 1]} color="#f0f6ff" />
        <Lightformer form="rect" intensity={1.3} position={[1, 3, 9]} scale={[16, 3.5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#dbe5f2" position={[0, 2.5, -9]} rotation-y={Math.PI} scale={[16, 4.5, 1]} />
        <Lightformer form="ring" intensity={1.6} position={[-5, 0.6, 3]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={1.6} position={[5, 0.6, -3]} scale={[3, 3, 1]} />
      </Environment>
    </>
  );
}

function Floor({ tier }: { tier: DeviceTier }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]} renderOrder={-1}>
      <planeGeometry args={[90, 90]} />
      {tier === 'high' ? (
        // Epoxy: a soft, short reflection that fades quickly away from contact.
        <MeshReflectorMaterial
          color={BRAND.cloudWhite}
          resolution={512}
          blur={[320, 120]}
          mixBlur={1.4}
          mixStrength={0.22}
          mirror={0.18}
          roughness={0.9}
          depthScale={1.4}
          minDepthThreshold={0.2}
          maxDepthThreshold={0.9}
          metalness={0}
        />
      ) : (
        <meshStandardMaterial color={BRAND.cloudWhite} roughness={0.6} metalness={0} />
      )}
    </mesh>
  );
}

/**
 * Signature red arc painted on the bay floor: "ring, circle, or curved line".
 * It wraps the front and near side of the car (world angles -120°…+100° from
 * the nose) and leaves out the rear, which would run behind the hero copy.
 * Local θ maps to world angle -θ after the flat rotation.
 */
function BayArc() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, ARC_Y, 0]}>
      <ringGeometry args={[3.18, 3.28, 160, 1, THREE.MathUtils.degToRad(-100), THREE.MathUtils.degToRad(220)]} />
      <meshBasicMaterial color={BRAND.red} toneMapped={false} transparent opacity={0.9} depthWrite={false} />
    </mesh>
  );
}

export function Studio({ tier }: { tier: DeviceTier }) {
  return (
    <>
      <fog attach="fog" args={[BRAND.cloudWhite, 16, 40]} />
      <StudioLighting />

      {/* Cyclorama: floor sweeping up into the back wall, no corners. It faces
          the hero camera (azimuth 35°) so the horizon reads level, sits 12.5 m
          behind the bay and 5 cm down so its first sloped segment stays under
          the bay floor. */}
      <group rotation-y={CYC_YAW} position={[-CYC_DISTANCE * Math.cos(CAMERA_AZIMUTH), -0.05, -CYC_DISTANCE * Math.sin(CAMERA_AZIMUTH)]}>
        <Backdrop floor={2} segments={40} scale={[80, 16, 22]} receiveShadow={false}>
          <meshStandardMaterial color={BRAND.cloudWhite} roughness={1} metalness={0} />
        </Backdrop>
      </group>
      <Floor tier={tier} />
      <BayArc />
      <ContactShadows position={[0, SHADOW_Y, 0]} scale={12} blur={2.4} far={1.6} opacity={0.6} resolution={512} color={BRAND.jetBlack} />

      <Lift position={[-1.55, 0, 0]} />
      <EngineCrane position={[2.45, 0, -2.55]} rotation-y={1.2} />
      <ScannerCart position={[-3.35, 0, -1.2]} rotation-y={0.9} />
    </>
  );
}
