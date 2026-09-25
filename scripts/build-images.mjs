#!/usr/bin/env node
// Build responsive images:
//   services: reference photos (brief §8) → blur configured regions → crop
//             (4:3 card, 4:5 portrait) → WIDTHS → AVIF + WebP in public/images/services/
//   showroom: one photo per make → 16:9 wide + 9:16 tall crops → AVIF + WebP
//             in public/images/showroom/
//   kit:      start frames for image-to-video in video-kit/start-frames/
//
//   npm run images                  # services + showroom
//   npm run images -- --showroom    # one group only (--services, --showroom, --kit)
//   npm run images -- tune-up       # one service photo
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  CARD,
  KIT_DIR,
  OUTPUT_DIR,
  PHOTOS,
  PORTRAIT,
  SHOWROOM,
  SHOWROOM_OUTPUT_DIR,
  SHOWROOM_SOURCE_DIR,
  SHOWROOM_TALL_WIDTHS,
  SHOWROOM_WIDE_WIDTHS,
  SOURCE_DIR,
  WIDTHS,
} from './images.config.mjs';

const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
const wanted = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const only = ['--services', '--showroom', '--kit'].filter((f) => flags.has(f));
const run = (group) => (only.length ? only.includes(`--${group}`) : group !== 'kit');

async function findSource(stamp) {
  for (const folder of await fs.readdir(SOURCE_DIR)) {
    const dir = path.join(SOURCE_DIR, folder);
    if (!(await fs.stat(dir)).isDirectory()) continue;
    const match = (await fs.readdir(dir)).find((name) => name.endsWith(`_${stamp}.jpeg`));
    if (match) return path.join(dir, match);
  }
  throw new Error(`No source photo ends with _${stamp}.jpeg`);
}

/** Blur rectangles in place on the full-resolution source. */
async function blurRegions(input, regions) {
  if (!regions.length) return input;
  const composites = [];
  for (const [left, top, width, height] of regions) {
    // Enough to make lettering unreadable while the patch still reads as an
    // out-of-focus badge or label rather than a smudge.
    const sigma = Math.min(12, Math.max(4, Math.min(width, height) / 3));
    const patch = await sharp(input).extract({ left, top, width, height }).blur(sigma).toBuffer();
    composites.push({ input: patch, left, top });
  }
  return sharp(input).composite(composites).toBuffer();
}

/** crop: { left, top, width, height } in source pixels. */
async function writeVariants(buffer, dir, stem, crop, widths, quality = { avif: 50, webp: 76 }) {
  const outputs = [];
  for (const width of widths) {
    const height = Math.round((width * crop.height) / crop.width);
    const base = sharp(buffer).extract(crop).resize(width, height, { fit: 'cover', kernel: 'lanczos3' });
    const file = path.join(dir, `${stem}-${width}`);
    await base.clone().avif({ quality: quality.avif, effort: 5 }).toFile(`${file}.avif`);
    await base.clone().webp({ quality: quality.webp }).toFile(`${file}.webp`);
    const [a, w] = await Promise.all([fs.stat(`${file}.avif`), fs.stat(`${file}.webp`)]);
    outputs.push(`${width}w ${(a.size / 1024).toFixed(0)}/${(w.size / 1024).toFixed(0)} KB`);
  }
  return outputs;
}

/** 16:9 centre crop and 9:16 crop around focusX, in source pixels. */
function showroomCrops(meta, focusX) {
  const wideWidth = Math.min(meta.width, Math.round((meta.height * 16) / 9));
  const wide = { left: Math.round((meta.width - wideWidth) / 2), top: 0, width: wideWidth, height: meta.height };
  const tallWidth = Math.round((meta.height * 9) / 16);
  const tallLeft = Math.round(Math.min(Math.max(focusX * meta.width - tallWidth / 2, 0), meta.width - tallWidth));
  const tall = { left: tallLeft, top: 0, width: tallWidth, height: meta.height };
  return { wide, tall };
}

async function writeKitFrame(buffer, crop, file, width, height) {
  await sharp(buffer)
    .extract(crop)
    .resize(width, height, { fit: 'cover', kernel: 'lanczos3' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(file);
}

if (run('services')) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const photos = wanted.length ? PHOTOS.filter((p) => wanted.includes(p.id)) : PHOTOS;
  for (const photo of photos) {
    const source = await findSource(photo.stamp);
    const blurred = await blurRegions(await fs.readFile(source), photo.blur);
    const card = await writeVariants(blurred, OUTPUT_DIR, `${photo.id}-card`, { left: 0, ...CARD, top: photo.cardTop }, WIDTHS);
    const portrait = await writeVariants(
      blurred,
      OUTPUT_DIR,
      `${photo.id}-portrait`,
      { left: 0, ...PORTRAIT, top: photo.portraitTop },
      WIDTHS,
    );
    console.log(`${photo.id.padEnd(24)} card ${card.join(' · ')} | portrait ${portrait.join(' · ')} (avif/webp)`);
  }
}

if (run('showroom')) {
  await fs.mkdir(SHOWROOM_OUTPUT_DIR, { recursive: true });
  for (const car of SHOWROOM) {
    const buffer = await fs.readFile(path.join(SHOWROOM_SOURCE_DIR, `${car.id}.jpg`));
    const { wide, tall } = showroomCrops(await sharp(buffer).metadata(), car.focusX);
    // Dark, smooth gradients: a touch more quality than the service photos avoids banding.
    const quality = { avif: 56, webp: 80 };
    const w = await writeVariants(buffer, SHOWROOM_OUTPUT_DIR, `${car.id}-wide`, wide, SHOWROOM_WIDE_WIDTHS, quality);
    const t = await writeVariants(buffer, SHOWROOM_OUTPUT_DIR, `${car.id}-tall`, tall, SHOWROOM_TALL_WIDTHS, quality);
    console.log(`${car.id.padEnd(16)} wide ${w.join(' · ')} | tall ${t.join(' · ')} (avif/webp)`);
  }
}

if (run('kit')) {
  await fs.mkdir(KIT_DIR, { recursive: true });
  for (const car of SHOWROOM) {
    const buffer = await fs.readFile(path.join(SHOWROOM_SOURCE_DIR, `${car.id}.jpg`));
    const { wide, tall } = showroomCrops(await sharp(buffer).metadata(), car.focusX);
    await writeKitFrame(buffer, wide, path.join(KIT_DIR, `showroom-${car.id}-16x9.jpg`), 1920, 1080);
    await writeKitFrame(buffer, tall, path.join(KIT_DIR, `showroom-${car.id}-9x16.jpg`), 1080, 1920);
    console.log(`kit showroom-${car.id} 16x9 + 9x16`);
  }
  for (const photo of PHOTOS) {
    const blurred = await blurRegions(await fs.readFile(await findSource(photo.stamp)), photo.blur);
    const meta = await sharp(blurred).metadata();
    // The photos are ~9:16 already; trim the few extra rows evenly.
    const height = Math.min(meta.height, Math.round((meta.width * 16) / 9));
    const crop = { left: 0, top: Math.round((meta.height - height) / 2), width: meta.width, height };
    await writeKitFrame(blurred, crop, path.join(KIT_DIR, `service-${photo.id}-9x16.jpg`), 1080, 1920);
    console.log(`kit service-${photo.id} 9x16`);
  }
}
