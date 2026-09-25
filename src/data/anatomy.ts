// "Anatomi servis": the scroll story between the showroom and the services.
// Media are AI illustrations (video-kit/SCROLL-STORY.md): video scenes are
// slots in VIDEOS (src/data/media.ts), stills live in public/images/anatomi/.
// Copy only restates services and process steps the site already names.

export interface Hotspot {
  label: string;
  /** Position on the 16:9 still, in % of its width and height. */
  x: number;
  y: number;
  /** Label to the left of the dot (dots near the right edge). */
  flip?: boolean;
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
    id: 'padam',
    kind: 'video',
    slot: 'anatomi-padam',
    rail: 'Mulai',
    eyebrow: 'Anatomi servis',
    title: 'Kami bongkar',
    emphasis: 'sampai tuntas',
    body: 'Gulir pelan-pelan dan lihat apa yang kami periksa, dari mesin sampai modul elektrik.',
  },
  {
    id: 'bongkar',
    kind: 'video',
    slot: 'anatomi-bongkar',
    rail: 'Bongkar',
    eyebrow: '01 · Bongkar',
    title: 'Dilepas satu per satu',
    body: 'Setiap temuan kami foto dan jelaskan. Anda lihat sendiri kondisinya sebelum ada part yang diganti.',
  },
  {
    id: 'urai',
    kind: 'still',
    image: 'urai',
    rail: 'Periksa',
    eyebrow: '02 · Mesin, kaki-kaki, bodi',
    title: 'Semua bagian, satu bengkel',
    body: 'Turun mesin, overhaul transmisi, balancing dan shaking machine, sampai salon body.',
    hotspots: [
      { label: 'Mesin & transmisi', x: 45, y: 57 },
      { label: 'Kaki-kaki', x: 30.5, y: 57 },
      { label: 'Bodi & eksterior', x: 69, y: 36 },
      { label: 'Balancing', x: 88, y: 67, flip: true },
    ],
  },
  {
    id: 'xray',
    kind: 'still',
    image: 'xray',
    rail: 'Diagnosa',
    eyebrow: '03 · Elektrikal & komputer',
    title: 'Dibaca sampai ke modulnya',
    body: 'Scan all brand, coding module dan ECU, sampai service hardware ECU.',
    hotspots: [
      { label: 'Scan all brand', x: 29, y: 43 },
      { label: 'Coding ECU', x: 54, y: 54.5 },
      { label: 'Hardware ECU', x: 87, y: 34, flip: true },
    ],
  },
  {
    id: 'rakit',
    kind: 'video',
    slot: 'anatomi-rakit',
    rail: 'Rakit',
    eyebrow: '04 · Rakit & cek ulang',
    title: 'Dirakit, lalu dicek ulang',
    body: 'Status pengerjaan diperbarui real-time, jadi Anda bisa memantaunya dari rumah.',
  },
  {
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
