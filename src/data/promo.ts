export interface MainPromoItem {
  id: string;
  title: string;
  badge: string;
  frameImage: string;
  tagline: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaMessage: string;
}

export const MAIN_PROMOS: MainPromoItem[] = [
  {
    id: 'fuchs-oil',
    title: 'Beli 5 Liter Oli FUCHS Gratis 1 Liter',
    badge: 'Promo Spesial Oli Jerman',
    frameImage: '/promo/Frame 58.png',
    tagline: 'Oli mesin FUCHS TITAN standar pabrikan Jerman untuk performa maksimal mobil Eropa.',
    description: 'Program promo oli mesin resmi untuk pemilik mobil BMW, Mercedes-Benz, Audi, VW, dan Porsche. Beli 5 liter dapat gratis 1 liter.',
    highlights: [
      'Gratis 1 liter oli mesin FUCHS TITAN',
      'Standar persetujuan pabrikan mobil Eropa',
      'Mekanik tersertifikasi khusus mobil Eropa',
      'Berlaku untuk paket tune up atau servis berkala',
    ],
    ctaLabel: 'Klaim Promo Oli FUCHS',
    ctaMessage: 'Halo Berlin 188 Garage, saya ingin klaim Promo Beli 5L Gratis 1L Oli FUCHS TITAN untuk mobil saya. Mohon informasi ketersediaan jadwal slot servis.',
  },
  {
    id: 'tune-up-750k',
    title: 'Jasa Tune Up Mobil Eropa Mulai 750RB',
    badge: 'Servis Berkala Transparan',
    frameImage: '/promo/Frame 52.png',
    tagline: 'Solusi perawatan mesin presisi tanpa tebakan dengan alat scanner pabrikan resmi.',
    description: 'Pengerjaan tune up menyeluruh menggunakan chemical khusus Eropa, sudah termasuk diagnosa scanner komputer OBD dan bonus cuci mobil gratis.',
    highlights: [
      'Biaya jasa mulai dari Rp 750.000',
      'Sudah termasuk scan diagnosa komputer OBD',
      'Gratis pencucian mobil bersih menyeluruh',
      'Dokumentasi kondisi riil sebelum & sesudah',
    ],
    ctaLabel: 'Booking Jasa Tune Up',
    ctaMessage: 'Halo Berlin 188 Garage, saya ingin booking Jasa Tune Up Mobil Eropa (mulai 750RB) untuk mobil saya. Mohon jadwal servis yang tersedia.',
  },
  {
    id: 'terms-conditions',
    title: 'Syarat & Ketentuan Klaim Promo',
    badge: 'Panduan Transparan',
    frameImage: '/promo/Frame 161.png',
    tagline: 'Langkah mudah klaim promo saat melakukan servis di Berlin 188 Garage.',
    description: 'Ketentuan resmi untuk menikmati promo oli gratis 1 liter dan gratis scan diagnosa di bengkel kami.',
    highlights: [
      'Promo oli gratis 1 liter berlaku saat ambil Paket Tune Up',
      'Pembelian oli saja tanpa tune up tetap dapat diskon khusus',
      'Berlaku untuk seluruh varian oli FUCHS TITAN (kecuali 0W-20)',
      'Beri ulasan bintang 5 di Google Maps & share story tag @berlin188_garage',
    ],
    ctaLabel: 'Tanya Ketentuan via WA',
    ctaMessage: 'Halo Berlin 188 Garage, saya ingin bertanya tentang syarat dan ketentuan promo Tune Up & Oli FUCHS untuk mobil saya.',
  },
];

export interface TuneUpPackage {
  id: 'blue' | 'red' | 'gold' | 'plat';
  name: string;
  badge: string;
  price: string;
  tagline: string;
  recommended?: boolean;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  frameImage: string;
  services: string[];
}

export const TUNE_UP_PACKAGES: TuneUpPackage[] = [
  {
    id: 'blue',
    name: 'Blue Package',
    badge: 'Daily Maintenance',
    price: 'Rp 750.000',
    tagline: 'Perawatan dasar berkala, cocok untuk pemakaian harian rutin mobil Eropa Anda.',
    themeColor: '#0065C0',
    badgeBg: 'bg-berlin-blue/10',
    badgeText: 'text-berlin-blue',
    borderColor: 'border-berlin-blue/30',
    frameImage: '/promo/Frame 48.png',
    services: [
      'Ganti Oli Mesin',
      'Ganti Filter Oli',
      'Membersihkan Ruang Mesin',
      'Diagnosa Scanner Komputer',
      'Gratis Pencucian Mobil',
    ],
  },
  {
    id: 'red',
    name: 'Red Package',
    badge: 'Most Recommended',
    price: 'Rp 1.000.000',
    tagline: 'Perawatan lebih menyeluruh untuk memastikan performa mesin dan kaki-kaki tetap prima.',
    recommended: true,
    themeColor: '#F9000D',
    badgeBg: 'bg-berlin-red/10',
    badgeText: 'text-berlin-red',
    borderColor: 'border-berlin-red/40',
    frameImage: '/promo/Frame 53.png',
    services: [
      'Ganti Oli Mesin',
      'Ganti Filter Oli',
      'Membersihkan Ruang Mesin',
      'Pengecekan Filter AC Kabin',
      'Pengecekan Kaki-kaki & Suspensi',
      'Diagnosa Scanner Komputer',
      'Gratis Pencucian Mobil',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Package',
    badge: 'Optimal Performance',
    price: 'Rp 1.500.000',
    tagline: 'Membantu menjaga respons tarikan gas kendaraan tetap ringan, presisi, dan nyaman.',
    themeColor: '#D4A017',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-400/40',
    frameImage: '/promo/Frame 54.png',
    services: [
      'Ganti Oli Mesin',
      'Ganti Filter Oli',
      'Membersihkan Ruang Mesin',
      'Pengecekan Filter AC Kabin',
      'Pengecekan Kaki-kaki & Suspensi',
      'Pembersihan Throttle Valve Intake',
      'Diagnosa Scanner Komputer',
      'Gratis Pencucian Mobil',
    ],
  },
  {
    id: 'plat',
    name: 'Platinum Package',
    badge: 'Complete Maintenance',
    price: 'Rp 2.000.000',
    tagline: 'Perawatan menyeluruh tingkat lanjut untuk kendaraan yang membutuhkan perhatian detail.',
    themeColor: '#004D99',
    badgeBg: 'bg-berlin-blue-dark/10',
    badgeText: 'text-berlin-blue-dark',
    borderColor: 'border-berlin-blue-dark/40',
    frameImage: '/promo/Frame 55.png',
    services: [
      'Ganti Oli Mesin',
      'Ganti Filter Oli',
      'Membersihkan Ruang Mesin',
      'Pengecekan Filter AC Kabin',
      'Pengecekan Kaki-kaki & Suspensi',
      'Pembersihan Throttle Valve Intake',
      'Maintenance Transmisi Matik',
      'Diagnosa Scanner Komputer',
      'Gratis Pencucian Mobil',
    ],
  },
];
