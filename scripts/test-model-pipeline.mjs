#!/usr/bin/env node
// Dry run of optimize-models.mjs on a synthetic "car" (dense body + 4 wheels,
// nose along -Z, 2× scale) so the pipeline is proven before real GLBs arrive.
// Writes only to the OS temp folder.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { CylinderGeometry, SphereGeometry } from 'three';

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'b188-models-'));
const srcDir = path.join(dir, 'src');
const outDir = path.join(dir, 'out');
await fs.mkdir(srcDir, { recursive: true });

function meshFrom(doc, buffer, geometry, name, material) {
  geometry = geometry.toNonIndexed ? geometry : geometry;
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  const idx = geometry.getIndex();
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos.array)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor.array)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx.array)).setBuffer(buffer))
    .setMaterial(material);
  return doc.createMesh(name).addPrimitive(prim);
}

const doc = new Document();
const buffer = doc.createBuffer();
const paint = doc.createMaterial('CarPaint_Body').setBaseColorFactor([0.1, 0.3, 0.8, 1]);
const rubber = doc.createMaterial('Tire').setBaseColorFactor([0.05, 0.05, 0.05, 1]);
const scene = doc.createScene('Scene');
// Sketchfab-style root with a scale, nose toward -Z.
const root = doc.createNode('Sketchfab_model').setScale([2, 2, 2]);
scene.addChild(root);
const body = new SphereGeometry(1, 256, 256); // ≈ 131k triangles
body.scale(0.9, 0.55, 2.3);
body.translate(0, 0.9, 0);
root.addChild(doc.createNode('Body').setMesh(meshFrom(doc, buffer, body, 'Body', paint)));
for (const [name, x, z] of [
  ['Wheel_FL', -0.8, -1.45],
  ['Wheel_FR', 0.8, -1.45],
  ['Wheel_RL', -0.8, 1.45],
  ['Wheel_RR', 0.8, 1.45],
]) {
  const wheel = new CylinderGeometry(0.34, 0.34, 0.24, 48);
  wheel.rotateZ(Math.PI / 2);
  wheel.translate(x, 0.34, z);
  root.addChild(doc.createNode(name).setMesh(meshFrom(doc, buffer, wheel, name, rubber)));
}
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
await io.write(path.join(srcDir, 'bmw-3-g20.glb'), doc);

// Temporarily point the G20 entry at the synthetic structure via env + config patch.
const configPath = path.resolve('scripts/models.config.mjs');
const original = await fs.readFile(configPath, 'utf-8');
const patched = original.replace(
  /(id: 'bmw-3-g20',[\s\S]*?)yaw: 0,[\s\S]*?paint: \[\],\s*wheels: null,/,
  `$1yaw: -Math.PI / 2,\n    removeNodes: [],\n    paint: ['CarPaint'],\n    wheels: { fl: 'Wheel_FL', fr: 'Wheel_FR', rl: 'Wheel_RL', rr: 'Wheel_RR' },`,
).replace(/targetFaces: 150_000,/, 'targetFaces: Number(process.env.TEST_TARGET ?? 150_000),'
);
const testConfig = path.join(dir, 'models.config.mjs');
await fs.writeFile(testConfig, patched);
const script = (await fs.readFile('scripts/optimize-models.mjs', 'utf-8')).replace(
  "'./models.config.mjs'",
  JSON.stringify('file:///' + testConfig.replace(/\\/g, '/')),
);
const testScript = path.join(process.cwd(), 'scripts', '.test-optimize.mjs');
await fs.writeFile(testScript, script);
try {
  execFileSync(process.execPath, [testScript, 'bmw-3-g20'], {
    stdio: 'inherit',
    env: { ...process.env, MODELS_SOURCE_DIR: srcDir, MODELS_OUTPUT_DIR: outDir },
  });
  // Inspect the result.
  const outDoc = await io.read(path.join(outDir, 'bmw-3-g20.glb'));
  const names = outDoc.getRoot().listNodes().map((n) => n.getName());
  const mats = outDoc.getRoot().listMaterials().map((m) => m.getName());
  const { getBounds } = await import('@gltf-transform/functions');
  const b = getBounds(outDoc.getRoot().listScenes()[0]);
  console.log('nodes:', names.join(', '));
  console.log('materials:', mats.join(', '));
  console.log('bounds min', b.min.map((v) => v.toFixed(3)).join(','), 'max', b.max.map((v) => v.toFixed(3)).join(','));
  const fl = outDoc.getRoot().listNodes().find((n) => n.getName() === 'wheel_fl');
  console.log('wheel_fl pivot world', fl?.getWorldTranslation().map((v) => v.toFixed(3)).join(','));
} finally {
  await fs.rm(testScript, { force: true });
  await fs.rm(dir, { recursive: true, force: true });
}
