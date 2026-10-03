// The home page hero and its autoplayed story ("Anatomi servis"). Scene 0 is
// the hero; the rest take one BMW M4 apart and back together. The hero copy
// stays on screen throughout; the scene copy below names the steps on the
// rail and for screen readers.
// Media are AI renders (video-kit/HERO-STORY.md): video scenes are slots in
// VIDEOS (src/data/media.ts), stills live in public/images/anatomi/. The car
// sits in the same place in every frame except the x-ray, so most scene
// changes read as one continuous shot.
// Copy only restates services and process steps the site already names.
import { HERO } from './content';

/**
 * A numbered callout on a still: a marker on the part, a leader line out to
 * clear space and the label sitting on an underline there (desktop; phones
 * show the numbered markers and the same numbers on the chips under the
 * caption). All positions are % of the 16:9 frame.
 */
export interface Hotspot {
  label: string;
  /** The part. */
  x: number;
  y: number;
  /** Where the leader line ends and the label's underline starts. */
  lx: number;
  ly: number;
  /** Which way the label runs from that point. */
  side: 'left' | 'right';
  /** Phones: a shorter name beside the marker, on its right unless 'left'. */
  short?: string;
  mobileSide?: 'left';
  /** Service id: the label links to #layanan-<service>. */
  service: string;
}

interface SceneBase {
  id: string;
  /** Short name on the progress rail. */
  rail: string;
  eyebrow: string;
  title: string;
  /** Second line in the red emphasis box. */
  emphasis?: string;
  body: string;
}

export type AnatomyScene =
  | (SceneBase & { kind: 'video'; slot: string })
  | (SceneBase & { kind: 'still'; image: string; hotspots: Hotspot[] });

export const ANATOMY: AnatomyScene[] = [
  {
    // The covered car in the workshop; the scroll pulls the cover off.
    id: 'buka',
    kind: 'video',
    slot: 'hero-buka',
    rail: 'Mulai',
    eyebrow: HERO.eyebrow,
    title: HERO.headlineLead,
    emphasis: HERO.headlineEmphasis,
    body: HERO.subtitle,
  },
  {
    // Crossfades in from the lit workshop (same car, same place), then comes apart.
    id: 'bongkar',
    kind: 'video',
    slot: 'anatomi-2-urai',
    rail: 'Bongkar',
    eyebrow: '01 · Bongkar',
    title: 'Dilepas satu per satu',
    body: 'Setiap temuan kami foto dan jelaskan. Anda lihat sendiri kondisinya sebelum ada part yang diganti.',
  },
  {
    // The teardown clip's last frame, held with its labels.
    id: 'urai',
    kind: 'still',
    image: 'urai',
    rail: 'Periksa',
    eyebrow: '02 · Mesin, kaki-kaki, bodi',
    title: 'Semua bagian, satu bengkel',
    body: 'Turun mesin, overhaul transmisi, balancing dan shaking machine, sampai salon body.',
    hotspots: [
      { label: 'Bodi & eksterior', short: 'Bodi', x: 50, y: 36, lx: 47, ly: 14, side: 'right', service: 'salon-body' },
      { label: 'Kaki-kaki', x: 45.5, y: 56, lx: 40, ly: 80, side: 'left', service: 'balancing-shaking' },
      { label: 'Mesin & transmisi', short: 'Mesin', x: 72, y: 58, lx: 90, ly: 83, side: 'left', service: 'turun-mesin' },
      { label: 'Balancing', x: 61, y: 71, lx: 54, ly: 84, side: 'left', service: 'balancing-shaking' },
    ],
  },
  {
    // The teardown clip reversed (video-kit/clips/anatomi-3-rakit-16x9.mp4).
    id: 'rakit',
    kind: 'video',
    slot: 'anatomi-3-rakit',
    rail: 'Rakit',
    eyebrow: '03 · Rakit & cek ulang',
    title: 'Dirakit, lalu dicek ulang',
    body: 'Status pengerjaan diperbarui real-time, jadi Anda bisa memantaunya dari rumah.',
  },
  {
    id: 'xray',
    kind: 'still',
    image: 'xray',
    rail: 'Diagnosa',
    eyebrow: '04 · Elektrikal & komputer',
    title: 'Dibaca sampai ke modulnya',
    body: 'Scan all brand, coding module dan ECU, sampai service hardware ECU.',
    hotspots: [
      { label: 'Scan all brand', x: 64.2, y: 47, lx: 70, ly: 18, side: 'right', service: 'scan-all-brand' },
      { label: 'Coding ECU', x: 50.5, y: 54, lx: 40, ly: 20, side: 'left', mobileSide: 'left', service: 'coding-ecu' },
      { label: 'Hardware ECU', x: 57.9, y: 58.4, lx: 46, ly: 84, side: 'left', service: 'service-hardware-ecu' },
    ],
  },
  {
    // Back in the lit Berlin 188 workshop (the hero's reveal frame), ready to be picked up.
    id: 'serah',
    kind: 'still',
    image: 'serah',
    rail: 'Serah',
    eyebrow: '05 · Serah terima',
    title: 'Siap',
    emphasis: 'jalan lagi',
    body: 'Selesai, invoice otomatis. Bayar dan bawa pulang mobil Anda.',
    hotspots: [],
  },
];
