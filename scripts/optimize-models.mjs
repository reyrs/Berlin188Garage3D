#!/usr/bin/env node
// Optimise the hand-downloaded car GLBs for the web (brief §6):
// drop interior/extra nodes → dedup/weld/prune → simplify (meshoptimizer) to
// ≤ targetFaces → normalise (length, nose to +X, centred on the bay, wheels on
// the floor) → wheel/hood pivots → paint materials renamed "paint" → WebP
// textures ≤ 1024 px → Draco. Equivalent to the brief's
// `gltf-transform optimize … --compress draco --texture-compress webp --texture-size 1024`
// plus the normalisation the runtime relies on.
//
// Usage:
//   npm run models                       # every model whose source file exists
//   npm run models -- bmw-3-g20          # one model
//   npm run models -- --inspect bmw-3-g20  # print node tree/materials, write nothing

import fs from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, getBounds, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { MODELS, OUTPUT_DIR, SOURCE_DIR } from './models.config.mjs';

const args = process.argv.slice(2);
const inspectOnly = args.includes('--inspect');
const wanted = args.filter((a) => !a.startsWith('--'));

async function createIO() {
  await MeshoptSimplifier.ready;
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });
}

/** Triangles actually drawn (a mesh instanced by N nodes counts N times). */
function countFaces(document) {
  let faces = 0;
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue; // TRIANGLES
      const indices = prim.getIndices();
      const position = prim.getAttribute('POSITION');
      faces += (indices ? indices.getCount() : position.getCount()) / 3;
    }
  }
  return Math.round(faces);
}

const matchesAny = (value, patterns) => patterns?.some((p) => new RegExp(p, 'i').test(value ?? ''));

function worldMatrix(node) {
  return new Matrix4().fromArray(node.getWorldMatrix());
}

function printTree(document) {
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const walk = (node, depth) => {
    const mesh = node.getMesh();
    let info = '';
    if (mesh) {
      const faces = mesh
        .listPrimitives()
        .reduce((sum, p) => sum + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0);
      const mats = [...new Set(mesh.listPrimitives().map((p) => p.getMaterial()?.getName() || '∅'))].join(', ');
      info = `  [mesh ${Math.round(faces)} tris | ${mats}]`;
    }
    console.log(`${'  '.repeat(depth)}- ${node.getName() || '(unnamed)'}${info}`);
    node.listChildren().forEach((child) => walk(child, depth + 1));
  };
  scene.listChildren().forEach((node) => walk(node, 0));
  console.log('\nMaterials:');
  for (const material of document.getRoot().listMaterials()) {
    const tex = material.getBaseColorTexture();
    console.log(
      `- ${material.getName() || '(unnamed)'}  color=${material.getBaseColorFactor().map((v) => v.toFixed(2)).join(',')}` +
        `  metal=${material.getMetallicFactor()} rough=${material.getRoughnessFactor()}${tex ? '  +baseColorTex' : ''}`,
    );
  }
  const { min, max } = getBounds(scene);
  console.log(`\nBounds size: x=${(max[0] - min[0]).toFixed(2)} y=${(max[1] - min[1]).toFixed(2)} z=${(max[2] - min[2]).toFixed(2)}`);
  console.log(`Faces: ${countFaces(document)}`);
}

function removeNodes(document, patterns) {
  if (!patterns?.length) return 0;
  let removed = 0;
  const disposeTree = (node) => {
    node.listChildren().forEach(disposeTree);
    node.dispose();
  };
  for (const node of document.getRoot().listNodes()) {
    if (node.isDisposed?.()) continue;
    if (matchesAny(node.getName(), patterns) || matchesAny(node.getMesh()?.getName(), patterns)) {
      disposeTree(node);
      removed++;
    }
  }
  return removed;
}

async function simplifyTo(document, targetFaces) {
  let faces = countFaces(document);
  let pass = 0;
  while (faces > targetFaces && pass < 5) {
    const ratio = Math.max(0.02, (targetFaces / faces) * 0.95);
    // Loosen the error bound each pass: first pass protects silhouettes.
    const error = [0.002, 0.005, 0.01, 0.02, 0.04][pass];
    await document.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error }));
    const next = countFaces(document);
    console.log(`  simplify pass ${pass + 1}: ${faces} → ${next} tris (ratio ${ratio.toFixed(3)}, error ${error})`);
    if (next >= faces) break;
    faces = next;
    pass++;
  }
  return faces;
}

/** Wrap everything in one root so the whole car can be yawed/scaled/placed. */
function normalise(document, { lengthM, yaw }) {
  const root = document.getRoot();
  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  const car = document.createNode('car');
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    car.addChild(child);
  }
  scene.addChild(car);

  const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), yaw);
  car.setRotation([q.x, q.y, q.z, q.w]);
  let { min, max } = getBounds(scene);
  const scale = lengthM / (max[0] - min[0]);
  car.setScale([scale, scale, scale]);
  ({ min, max } = getBounds(scene));
  car.setTranslation([-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2]);
  return { scale, size: getBounds(scene) };
}

/**
 * Group the nodes matching `pattern` under a new pivot node placed at `anchor`
 * (a function of their combined world bounds), keeping their world transforms.
 */
function makePivot(document, name, pattern, anchor) {
  const nodes = document
    .getRoot()
    .listNodes()
    .filter((n) => n.getMesh() && (matchesAny(n.getName(), [pattern]) || matchesAny(n.getMesh().getName(), [pattern])));
  if (!nodes.length) {
    console.warn(`  ! pivot ${name}: nothing matches /${pattern}/`);
    return false;
  }
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const node of nodes) {
    const b = getBounds(node);
    for (let i = 0; i < 3; i++) {
      bounds.min[i] = Math.min(bounds.min[i], b.min[i]);
      bounds.max[i] = Math.max(bounds.max[i], b.max[i]);
    }
  }
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const carNode = scene.listChildren()[0];
  const carWorld = worldMatrix(carNode);
  const pivotWorldPos = new Vector3(...anchor(bounds));
  // Pivot lives directly under "car", so express its position in car space.
  const pivotLocalPos = pivotWorldPos.clone().applyMatrix4(carWorld.clone().invert());
  const pivot = document.createNode(name).setTranslation(pivotLocalPos.toArray());
  carNode.addChild(pivot);
  const pivotWorldInverse = new Matrix4().multiplyMatrices(carWorld, new Matrix4().makeTranslation(pivotLocalPos)).invert();
  for (const node of nodes) {
    const local = new Matrix4().multiplyMatrices(pivotWorldInverse, worldMatrix(node));
    for (const parent of node.listParents()) {
      if (parent.propertyType === 'Node' || parent.propertyType === 'Scene') parent.removeChild(node);
    }
    const t = new Vector3();
    const r = new Quaternion();
    const s = new Vector3();
    local.decompose(t, r, s);
    node.setTranslation(t.toArray()).setRotation([r.x, r.y, r.z, r.w]).setScale(s.toArray());
    pivot.addChild(node);
  }
  return true;
}

function renamePaint(document, patterns) {
  if (!patterns?.length) return 0;
  let renamed = 0;
  for (const material of document.getRoot().listMaterials()) {
    if (matchesAny(material.getName(), patterns)) {
      material.setName('paint');
      renamed++;
    }
  }
  return renamed;
}

async function optimiseModel(io, config) {
  const source = path.join(SOURCE_DIR, `${config.id}.glb`);
  try {
    await fs.access(source);
  } catch {
    console.log(`- ${config.id}: source not found (${source}), skipped`);
    return null;
  }

  console.log(`\n▶ ${config.id}`);
  const document = await io.read(source);
  if (inspectOnly) {
    printTree(document);
    return null;
  }

  const before = countFaces(document);
  document.getRoot().listAnimations().forEach((animation) => animation.dispose());
  const removed = removeNodes(document, config.removeNodes);
  if (removed) console.log(`  removed ${removed} node(s)`);

  await document.transform(dedup(), prune({ keepAttributes: false, keepLeaves: false }), weld());
  const faces = await simplifyTo(document, config.targetFaces);

  const { scale } = normalise(document, config);
  console.log(`  normalised: scale ${scale.toFixed(4)}, length ${config.lengthM} m`);

  if (config.wheels) {
    for (const [key, pattern] of Object.entries(config.wheels)) {
      makePivot(document, `wheel_${key}`, pattern, ({ min, max }) => [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2,
      ]);
    }
  }
  if (config.hood) {
    // Hinge at the hood's rear edge (nose points to +X, so the rear is min X).
    makePivot(document, 'hood', config.hood, ({ min, max }) => [min[0], max[1], (min[2] + max[2]) / 2]);
  }
  const painted = renamePaint(document, config.paint);
  console.log(`  paint materials: ${painted}`);

  await document.transform(
    prune({ keepAttributes: false }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
    draco({ method: 'edgebreaker', quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
  );

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const output = path.join(OUTPUT_DIR, `${config.id}.glb`);
  await io.write(output, document);
  const { size } = await fs.stat(output);
  const result = { id: config.id, before, after: faces, mb: size / 1024 / 1024 };
  const flag = faces > config.targetFaces || result.mb > 2.5 ? '  ⚠ over budget' : '';
  console.log(`  ✔ ${output}: ${before} → ${faces} tris, ${result.mb.toFixed(2)} MB${flag}`);
  return result;
}

const io = await createIO();
const selected = wanted.length ? MODELS.filter((m) => wanted.includes(m.id)) : MODELS;
if (!selected.length) {
  console.error(`No model matches: ${wanted.join(', ')}`);
  process.exit(1);
}
const results = [];
for (const config of selected) {
  const result = await optimiseModel(io, config);
  if (result) results.push(result);
}
if (results.length) {
  console.log('\nSummary');
  console.table(results.map((r) => ({ model: r.id, 'tris before': r.before, 'tris after': r.after, MB: r.mb.toFixed(2) })));
}
