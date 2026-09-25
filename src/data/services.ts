import type { CarSlot } from './cars';

export type CategoryId =
  | 'mesin-transmisi'
  | 'elektrikal-komputer'
  | 'kaki-kaki-ac'
  | 'bodi-eksterior'
  | 'pendukung-darurat';

export interface ServiceCategory {
  id: CategoryId;
  name: string;
  short: string;
}

export const CATEGORIES: ServiceCategory[] = [
  { id: 'mesin-transmisi', name: 'Layanan Mesin & Transmisi', short: 'Mesin & Transmisi' },
  { id: 'elektrikal-komputer', name: 'Layanan Elektrikal & Komputer', short: 'Elektrikal & Komputer' },
  { id: 'kaki-kaki-ac', name: 'Layanan Kaki-kaki & AC', short: 'Kaki-kaki & AC' },
  { id: 'bodi-eksterior', name: 'Layanan Bodi & Eksterior', short: 'Bodi & Eksterior' },
  { id: 'pendukung-darurat', name: 'Layanan Pendukung & Darurat', short: 'Pendukung & Darurat' },
];

export type SceneId =
  | 'engine-crane'
  | 'transmission-lift'
  | 'transmission-flush'
  | 'tune-up'
  | 'injector-tester'
  | 'scan-ring'
  | 'ecu-coding'
  | 'ecu-bench'
  | 'wheel-balancer'
  | 'ac-cold-air'
  | 'clearcoat-sweep'
  | 'parts-stack'
  | 'import-arc'
  | 'towing-flatbed';

export interface Service {
  /** Also the anchor id (#layanan-<id>) and the photo slug. */
  id: string;
  /** Exact wording from the brief — do not edit. */
  name: string;
  categoryId: CategoryId;
  /** TODO: tinjau — draf deskripsi baru, netral, tanpa klaim. */
  description: string;
  photoAlt: string;
  car: CarSlot;
  scene: SceneId;
}

export const SERVICES: Service[] = [
  {
    id: 'turun-mesin',
    name: 'Turun mesin / overhaul mesin',
    categoryId: 'mesin-transmisi',
    description: 'Pembongkaran dan perbaikan mesin secara menyeluruh, dari blok hingga kepala silinder.',
    photoAlt: 'Ilustrasi: mekanik mengangkat mesin sedan hitam dengan engine crane merah di studio putih.',
    car: { model: 'bmw-3-g20', paint: 'black' },
    scene: 'engine-crane',
  },
  {
    id: 'overhaul-transmisi',
    name: 'Overhaul transmisi',
    categoryId: 'mesin-transmisi',
    description: 'Transmisi diturunkan, dibongkar, dan komponen yang aus diperbaiki atau diganti.',
    photoAlt: 'Ilustrasi: sedan abu-abu terangkat di lift biru, transmisi diturunkan ke transmission jack.',
    car: { model: 'mercedes-e63-wagon-s213', paint: 'graphite' },
    scene: 'transmission-lift',
  },
  {
    id: 'flushing-transmisi',
    name: 'Flushing transmisi',
    categoryId: 'mesin-transmisi',
    description: 'Penggantian oli transmisi memakai mesin flushing, sehingga oli lama terbuang lebih tuntas.',
    photoAlt: 'Ilustrasi: mekanik menyambungkan selang mesin flushing ke sedan hitam dengan kap terbuka.',
    car: { model: 'audi-q7-2015', paint: 'black' },
    scene: 'transmission-flush',
  },
  {
    id: 'tune-up',
    name: 'Tune up (ringan hingga besar)',
    categoryId: 'mesin-transmisi',
    description: 'Pemeriksaan pengapian, filter, dan penyetelan mesin, dari tune up ringan hingga besar.',
    photoAlt: 'Ilustrasi: mekanik memegang filter udara di depan hatchback putih dengan kap terbuka.',
    car: { model: 'mini-countryman-2017', paint: 'white' },
    scene: 'tune-up',
  },
  {
    id: 'kalibrasi-injector',
    name: 'Kalibrasi injector',
    categoryId: 'mesin-transmisi',
    description: 'Injector diuji dan dikalibrasi di alat tester supaya semprotan bahan bakar kembali merata.',
    photoAlt: 'Ilustrasi: alat tester injector dengan enam tabung ukur di samping SUV hitam.',
    car: { model: 'range-rover-sport-2018', paint: 'black' },
    scene: 'injector-tester',
  },
  {
    id: 'scan-all-brand',
    name: 'Scan all brand / diagnosa sistem',
    categoryId: 'elektrikal-komputer',
    description: 'Pembacaan kode kesalahan dan data modul mobil dengan alat scan untuk berbagai merek.',
    photoAlt: 'Ilustrasi: mekanik membaca hasil scan di tablet di samping SUV biru.',
    car: { model: 'bmw-3-g20', paint: 'berlin-blue' },
    scene: 'scan-ring',
  },
  {
    id: 'coding-ecu',
    name: 'Coding module dan ECU',
    categoryId: 'elektrikal-komputer',
    description: 'Pengaturan (coding) modul dan ECU lewat laptop diagnosa, misalnya setelah komponen diganti.',
    photoAlt: 'Ilustrasi: mekanik melakukan coding lewat laptop yang tersambung ke sedan hitam.',
    car: { model: 'mercedes-e63-wagon-s213', paint: 'black' },
    scene: 'ecu-coding',
  },
  {
    id: 'service-hardware-ecu',
    name: 'Service hardware ECU',
    categoryId: 'elektrikal-komputer',
    description: 'Perbaikan fisik ECU di tingkat papan sirkuit (PCB), termasuk penyolderan komponen.',
    photoAlt: 'Ilustrasi: mekanik menyolder papan sirkuit ECU di troli biru, SUV silver di belakang.',
    car: { model: 'audi-q7-2015', paint: 'silver' },
    scene: 'ecu-bench',
  },
  {
    id: 'balancing-shaking',
    name: 'Balancing dan shaking machine',
    categoryId: 'kaki-kaki-ac',
    description:
      'Penyeimbangan roda dengan mesin balancing dan pemeriksaan dengan shaking machine.',
    photoAlt: 'Ilustrasi: roda terpasang di mesin balancing di depan SUV hitam.',
    car: { model: 'land-rover-defender-110', paint: 'black' },
    scene: 'wheel-balancer',
  },
  {
    id: 'service-ac',
    name: 'Service dan flushing AC',
    categoryId: 'kaki-kaki-ac',
    description: 'Pembersihan sistem AC, pengisian freon, dan flushing jalur AC dengan mesin khusus.',
    photoAlt: 'Ilustrasi: mesin servis AC dengan selang merah dan biru tersambung ke mobil putih.',
    car: { model: 'mini-countryman-2017', paint: 'white' },
    scene: 'ac-cold-air',
  },
  {
    id: 'salon-body',
    name: 'Salon body',
    categoryId: 'bodi-eksterior',
    description: 'Poles dan perawatan cat bodi supaya kilap cat kembali.',
    photoAlt: 'Ilustrasi: mekanik memoles pintu mobil hitam dengan mesin poles.',
    car: { model: 'range-rover-sport-2018', paint: 'black' },
    scene: 'clearcoat-sweep',
  },
  {
    id: 'pengadaan-sparepart',
    name: 'Pengadaan sparepart (baru dan copotan)',
    categoryId: 'pendukung-darurat',
    description: 'Kami bantu carikan sparepart baru maupun copotan sesuai kebutuhan Anda.',
    photoAlt: 'Ilustrasi: troli berisi kotak sparepart di depan sedan hitam.',
    car: { model: 'bmw-3-g20', paint: 'black' },
    scene: 'parts-stack',
  },
  {
    id: 'fast-import-sparepart',
    name: 'Fast import sparepart (estimasi ±5 hari)',
    categoryId: 'pendukung-darurat',
    description: 'Sparepart yang tidak tersedia di dalam negeri bisa diimpor, dengan estimasi ±5 hari.',
    photoAlt: 'Ilustrasi: mekanik membuka kardus kiriman sparepart di depan SUV abu-abu.',
    car: { model: 'mercedes-e63-wagon-s213', paint: 'graphite' },
    scene: 'import-arc',
  },
  {
    id: 'towing-24-jam',
    name: 'Towing 24 jam',
    categoryId: 'pendukung-darurat',
    description: 'Mobil mogok? Kami kirim towing 24 jam untuk membawa mobil Anda ke bengkel.',
    photoAlt: 'Ilustrasi: truk towing flatbed menurunkan SUV hitam di studio putih.',
    car: { model: 'land-rover-defender-110', paint: 'black' },
    scene: 'towing-flatbed',
  },
];
