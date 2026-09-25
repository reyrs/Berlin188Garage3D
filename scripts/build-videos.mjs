#!/usr/bin/env node
// Scroll-scrub videos: clips generated from video-kit/start-frames (see
// video-kit/README.md) → web MP4s in public/videos/ + src/data/media.ts.
//
// Drop a clip in video-kit/clips/ with the same name as its start frame
// (showroom-bmw-16x9.mp4, service-tune-up-9x16.mov, ...) and run:
//   npm run videos            # new or changed clips only
//   npm run videos -- --force # re-encode everything
//
// A slot gets a "wide" (16:9) and/or "tall" (9:16) file. A showroom make with
// only a 16:9 clip gets its tall file cropped around the same focusX as its
// photo (scripts/images.config.mjs), so one generation covers both.
//
// Scrubbing means seeking on every scroll frame, so clips are encoded with a
// keyframe every 6 frames and no B-frames: larger than a normal web video,
// but each seek decodes at most a few frames.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { SHOWROOM } from './images.config.mjs';

const run = promisify(execFile);
const CLIPS_DIR = 'video-kit/clips';
const OUTPUT_DIR = 'public/videos';
const MEDIA_FILE = 'src/data/media.ts';
const EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm'];
const WIDE = { width: 1600, height: 900 };
const TALL = { width: 720, height: 1280 };
const ENCODE = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-profile:v', 'high'];
const SCRUB = ['-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0'];
const force = process.argv.includes('--force');

async function findFfmpeg() {
  try {
    const { default: bundled } = await import('ffmpeg-static');
    if (bundled) return bundled;
  } catch {
    // Not installed (or its download was blocked): fall back to PATH.
  }
  return 'ffmpeg';
}
const FFMPEG = await findFfmpeg();

/** Duration (s) and frame size, from ffmpeg's own input summary. */
async function probe(file) {
  const result = await run(FFMPEG, ['-hide_banner', '-i', file]).catch((error) => error);
  const text = String(result.stderr ?? '');
  const time = /Duration: (\d+):(\d+):([\d.]+)/.exec(text);
  const size = /Video:.*?(\d{2,5})x(\d{2,5})/.exec(text);
  if (!time || !size) throw new Error(`Cannot read ${file} (is it a video?)\n${text.slice(-400)}`);
  return {
    duration: Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]),
    width: Number(size[1]),
    height: Number(size[2]),
  };
}

async function newer(output, input) {
  try {
    const [o, i] = await Promise.all([fs.stat(output), fs.stat(input)]);
    return o.mtimeMs > i.mtimeMs;
  } catch {
    return false;
  }
}

/** Crop (source pixels) to the target aspect around focusX, then scale. */
function filter(source, target, focusX) {
  const aspect = target.width / target.height;
  let w = source.width;
  let h = Math.round(w / aspect);
  if (h > source.height) {
    h = source.height;
    w = Math.round(h * aspect);
  }
  const x = Math.round(Math.min(Math.max(focusX * source.width - w / 2, 0), source.width - w));
  const y = Math.round((source.height - h) / 2);
  return `crop=${w - (w % 2)}:${h - (h % 2)}:${x}:${y},scale=${target.width}:${target.height}:flags=lanczos,setsar=1`;
}

async function encode(input, output, target, focusX) {
  if (!force && (await newer(output, input))) return 'cached';
  const source = await probe(input);
  await run(
    FFMPEG,
    ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-an', '-vf', filter(source, target, focusX), '-fpsmax', '30',
      ...ENCODE, ...SCRUB, '-movflags', '+faststart', output],
    { maxBuffer: 1 << 24 },
  );
  return 'encoded';
}

await fs.mkdir(CLIPS_DIR, { recursive: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

// slot → { '16x9'?: file, '9x16'?: file }
const clips = new Map();
for (const name of (await fs.readdir(CLIPS_DIR)).sort()) {
  const ext = path.extname(name).toLowerCase();
  const match = /^(.+)-(16x9|9x16)$/.exec(path.basename(name, path.extname(name)));
  if (!EXTENSIONS.includes(ext) || !match) continue;
  const [, slot, ratio] = match;
  clips.set(slot, { ...clips.get(slot), [ratio]: path.join(CLIPS_DIR, name) });
}

const focus = new Map(SHOWROOM.map((car) => [`showroom-${car.id}`, car.focusX]));
const videos = {};
for (const [slot, files] of clips) {
  const entry = {};
  const jobs = [];
  if (files['16x9']) jobs.push(['wide', files['16x9'], WIDE, 0.5]);
  const tallSource = files['9x16'] ?? (focus.has(slot) ? files['16x9'] : undefined);
  if (tallSource) jobs.push(['tall', tallSource, TALL, files['9x16'] ? 0.5 : focus.get(slot)]);
  for (const [kind, input, target, focusX] of jobs) {
    const output = path.join(OUTPUT_DIR, `${slot}-${kind}.mp4`);
    const status = await encode(input, output, target, focusX);
    const { duration } = await probe(output);
    const { size } = await fs.stat(output);
    entry[kind] = { src: `/videos/${slot}-${kind}.mp4`, width: target.width, height: target.height, duration: Number(duration.toFixed(2)) };
    console.log(`${`${slot} ${kind}`.padEnd(40)} ${status.padEnd(8)} ${duration.toFixed(1)} s  ${(size / 1024 / 1024).toFixed(1)} MB`);
  }
  if (Object.keys(entry).length) videos[slot] = entry;
}

const body = JSON.stringify(videos, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, "'");
await fs.writeFile(
  MEDIA_FILE,
  `// Generated by scripts/build-videos.mjs. Do not edit by hand.
// Scroll-scrubbed videos per slot; a slot without an entry shows its photo.

export interface ScrubVideo {
  src: string;
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
}

export interface VideoSlot {
  /** 16:9, desktop and landscape. */
  wide?: ScrubVideo;
  /** 9:16, phones and portrait tablets. */
  tall?: ScrubVideo;
}

export const VIDEOS: Record<string, VideoSlot> = ${body};
`,
);
console.log(`${Object.keys(videos).length} slot(s) → ${MEDIA_FILE}${clips.size ? '' : ` (no clips in ${CLIPS_DIR} yet)`}`);
