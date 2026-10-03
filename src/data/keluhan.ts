// /garasi: "Mobil Anda kenapa?" The visitor picks a complaint, the stage moves to
// the part of the car it concerns (the BMW M4 frames of the home page story, in
// depth), and the panel says what usually causes it, what the workshop does and
// which services and parts it involves.
// TODO: tinjau — penyebab dan langkah adalah draf umum (bukan klaim harga, durasi
// atau hasil); hanya menyebut layanan dan alat yang sudah ada di situs.
import type { ProductCategory } from './products';

/** The frames the stage can show: the stills of the home page story (public/images/anatomi/). */
export type GarageFrame = 'serah' | 'urai' | 'xray';

/** A numbered marker on a part. Positions are % of the 16:9 frame. */
export interface KeluhanPart {
  label: string;
  x: number;
  y: number;
  /** Preferred side of the name (it flips when it would run out of the free area). */
  side?: 'left';
}

export interface Keluhan {
  id: string;
  /** Button text in the list. */
  label: string;
  /** Panel heading. */
  title: string;
  frame: GarageFrame;
  /** Point of the frame the camera moves to (%), and how close (1 = whole frame). */
  focus: { x: number; y: number; zoom: number };
  parts: KeluhanPart[];
  causes: string[];
  steps: string[];
  /** Service ids (src/data/services.ts); linked to #layanan-<id> on the home page. */
  services: string[];
  partsCategory: ProductCategory;
}

/** What the stage shows before a complaint is picked: the car in the workshop. */
export const IDLE_FRAME: GarageFrame = 'serah';

export const KELUHAN: Keluhan[] = [
  {
    id: 'ac',
    label: 'AC kurang dingin',
    title: 'AC kurang dingin',
    frame: 'xray',
    focus: { x: 51, y: 56, zoom: 1.3 },
    parts: [
      { label: 'Kondensor', x: 42, y: 64, side: 'left' },
      { label: 'Kompresor', x: 49, y: 57, side: 'left' },
      { label: 'Evaporator & blower', x: 60, y: 47 },
    ],
    causes: [
      'Freon berkurang karena ada kebocoran kecil di jalur AC.',
      'Kondensor di depan radiator kotor atau tertutup debu.',
      'Kompresor atau kipas kondensor tidak bekerja maksimal.',
      'Filter kabin kotor, sehingga hembusan angin lemah.',
    ],
    steps: [
      'Cek tekanan freon dan cari titik bocornya.',
      'Bersihkan kondensor dan flushing jalur AC.',
      'Cek kerja kompresor, kipas, dan filter kabin.',
    ],
    services: ['service-ac'],
    partsCategory: 'Filter & AC',
  },
  {
    id: 'getar',
    label: 'Setir atau bodi bergetar',
    title: 'Setir atau bodi bergetar',
    frame: 'urai',
    focus: { x: 61, y: 66, zoom: 1.3 },
    parts: [
      { label: 'Roda & ban', x: 61, y: 71 },
      { label: 'Kaki-kaki depan', x: 66, y: 60 },
      { label: 'Piringan & kaliper rem', x: 55.5, y: 69.5, side: 'left' },
    ],
    causes: [
      'Roda tidak seimbang setelah ganti ban atau terkena lubang.',
      'Ban aus tidak rata atau benjol.',
      'Komponen kaki-kaki aus: tie rod, ball joint, atau bushing.',
      'Piringan rem tidak rata, terasa saat mengerem.',
    ],
    steps: [
      'Balancing roda dengan mesin balancing.',
      'Cek kaki-kaki dengan shaking machine.',
      'Cek kondisi ban dan piringan rem.',
    ],
    services: ['balancing-shaking'],
    partsCategory: 'Kaki-Kaki',
  },
  {
    id: 'check-engine',
    label: 'Lampu check engine menyala',
    title: 'Lampu check engine menyala',
    frame: 'xray',
    focus: { x: 55, y: 53, zoom: 1.3 },
    parts: [
      { label: 'Port diagnosa (OBD)', x: 61, y: 50 },
      { label: 'ECU mesin', x: 55, y: 56 },
      { label: 'Sensor di mesin', x: 48, y: 54, side: 'left' },
    ],
    causes: [
      'Sensor bermasalah, misalnya sensor oksigen atau sensor aliran udara.',
      'Busi atau koil lemah sehingga mesin misfire.',
      'Kebocoran vakum di jalur udara mesin.',
      'Error pada modul atau ECU.',
    ],
    steps: [
      'Scan seluruh modul dengan alat diagnosa pabrikan (ISTA, Xentry, ODIS).',
      'Baca kode error dan data sensor secara langsung.',
      'Perbaiki sumber masalahnya, lalu coding ulang modul bila perlu.',
    ],
    services: ['scan-all-brand', 'coding-ecu', 'service-hardware-ecu'],
    partsCategory: 'Kelistrikan',
  },
  {
    id: 'brebet',
    label: 'Mesin brebet atau boros',
    title: 'Mesin brebet, boros, atau tarikan berat',
    frame: 'urai',
    focus: { x: 73, y: 58, zoom: 1.45 },
    parts: [
      { label: 'Busi & koil', x: 71, y: 56, side: 'left' },
      { label: 'Injektor', x: 75, y: 59.5 },
    ],
    causes: [
      'Busi dan koil sudah lemah.',
      'Injektor kotor, semprotan bahan bakar tidak rata.',
      'Filter udara atau throttle body kotor.',
      'Sensor pengatur campuran bahan bakar bermasalah.',
    ],
    steps: [
      'Tune up: ganti busi, bersihkan throttle body, cek koil.',
      'Kalibrasi dan bersihkan injektor.',
      'Scan mesin untuk memastikan tidak ada sensor yang error.',
    ],
    services: ['tune-up', 'kalibrasi-injector'],
    partsCategory: 'Mesin',
  },
  {
    id: 'transmisi',
    label: 'Transmisi menghentak',
    title: 'Transmisi menghentak atau telat pindah gigi',
    frame: 'urai',
    focus: { x: 55, y: 61, zoom: 1.3 },
    parts: [
      { label: 'Transmisi', x: 60, y: 61 },
      { label: 'Poros & gardan', x: 48, y: 61, side: 'left' },
    ],
    causes: [
      'Oli transmisi sudah kotor atau berkurang.',
      'Valve body atau solenoid transmisi bermasalah.',
      'Mounting mesin dan transmisi aus.',
      'Transmisi perlu adaptasi ulang lewat komputer.',
    ],
    steps: [
      'Cek kondisi dan level oli transmisi.',
      'Flushing oli transmisi dengan mesin khusus.',
      'Scan dan adaptasi transmisi; overhaul bila kerusakannya di dalam.',
    ],
    services: ['flushing-transmisi', 'overhaul-transmisi'],
    partsCategory: 'Oli & Cairan',
  },
  {
    id: 'oli',
    label: 'Oli rembes atau berasap',
    title: 'Oli rembes atau knalpot berasap',
    frame: 'urai',
    focus: { x: 71, y: 59, zoom: 1.45 },
    parts: [
      { label: 'Tutup klep & gasket', x: 72, y: 56 },
      { label: 'Seal & bak oli', x: 70, y: 63, side: 'left' },
    ],
    causes: [
      'Gasket tutup klep mengeras dan getas.',
      'Seal mesin atau bak oli bocor.',
      'Ring piston atau seal klep aus, ditandai asap kebiruan.',
    ],
    steps: [
      'Cari titik rembesnya dan kirim foto temuannya ke Anda.',
      'Ganti gasket atau seal yang bocor.',
      'Turun mesin bila keausannya ada di dalam mesin.',
    ],
    services: ['turun-mesin'],
    partsCategory: 'Mesin',
  },
  {
    id: 'bodi',
    label: 'Cat kusam atau baret',
    title: 'Cat kusam atau baret',
    frame: 'serah',
    focus: { x: 60, y: 53, zoom: 1.2 },
    parts: [
      { label: 'Cat bodi', x: 50, y: 49, side: 'left' },
      { label: 'Kap mesin', x: 66, y: 52 },
      { label: 'Lampu depan', x: 67, y: 57.5, side: 'left' },
    ],
    causes: [
      'Cat teroksidasi karena panas matahari.',
      'Baret halus dari cuci mobil atau gesekan.',
      'Lapisan pelindung cat sudah habis.',
    ],
    steps: [
      'Cek kondisi cat dan seberapa dalam baretnya.',
      'Poles dan perawatan cat (salon body).',
      'Saran perawatan supaya kilapnya bertahan.',
    ],
    services: ['salon-body'],
    partsCategory: 'Body & Eksterior',
  },
];
