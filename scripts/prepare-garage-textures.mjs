#!/usr/bin/env node
// Garage textures: Poly Haven CC0 PBR sets (assets-src/garage/tex, 2k) →
// 1k web versions in public/garage/tex, graded dark to match the showroom.
// Used by scripts/blender/build-garage.py (preview + bake) and by the /garasi page.
//
//   node scripts/prepare-garage-textures.mjs
import fs from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'assets-src/garage/tex';
const OUT = 'public/garage/tex';
const SIZE = 1024;

// brightness/saturation grade the albedo; roughScale lowers roughness (0-1)
// for a sealed, slightly glossy finish.
const SETS = [
  { id: 'floor', source: 'brushed_concrete', brightness: 0.4, saturation: 0.25, roughScale: 0.55 },
  { id: 'wall', source: 'concrete_slab_wall', brightness: 0.3, saturation: 0.2, roughScale: 1 },
  { id: 'shutter', source: 'painted_metal_shutter', brightness: 0.5, saturation: 0.3, roughScale: 0.85 },
  { id: 'plate', source: 'metal_plate', brightness: 0.7, saturation: 0.4, roughScale: 0.8 },
];

await fs.mkdir(OUT, { recursive: true });
for (const set of SETS) {
  const src = (kind) => `${SRC}/${set.source}_${kind}.jpg`;
  await sharp(src('diff'))
    .resize(SIZE, SIZE)
    .modulate({ brightness: set.brightness, saturation: set.saturation })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`${OUT}/${set.id}_diff.jpg`);
  await sharp(src('rough'))
    .resize(SIZE, SIZE)
    .greyscale()
    .linear(set.roughScale, 0)
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`${OUT}/${set.id}_rough.jpg`);
  await sharp(src('nor')).resize(SIZE, SIZE).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/${set.id}_nor.jpg`);
  console.log(`${set.id.padEnd(8)} ← ${set.source}`);
}
