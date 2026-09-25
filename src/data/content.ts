// Copy for the hero, process and FAQ. Process steps and FAQ come from the main
// site (frontend/src/components/LandingPage.tsx DEFAULT_STEPS / DEFAULT_FAQ_ITEMS);
// only "kamu" was changed to "Anda" so the page speaks in one voice.

export const HERO = {
  eyebrow: 'Bengkel di Jl. Rawa Kutuk No. 31, Tangerang Selatan',
  headlineLead: 'Spesialis',
  headlineEmphasis: 'mobil Eropa',
  subtitle: 'Kami foto setiap temuan dan jelaskan setiap biaya. Anda setujui dulu, baru kami kerjakan.',
  primaryCta: 'Booking via WhatsApp',
  secondaryCta: 'Lihat layanan',
} as const;

export const PROCESS_STEPS = [
  { title: 'Check-in', description: 'SA catat keluhan, data mobil, dan nomor HP Anda. 5 menit.' },
  { title: 'Diagnosis', description: 'Mekanik periksa, foto kerusakan, upload ke sistem.' },
  { title: 'Persetujuan', description: 'Anda lihat foto + estimasi biaya di HP. ACC kalau setuju.' },
  { title: 'Pengerjaan', description: 'Mekanik kerjakan. Status update real-time, Anda pantau dari rumah.' },
  { title: 'Serah terima', description: 'Selesai, invoice otomatis. Bayar & bawa pulang mobil.' },
] as const;

// TODO: konfirmasi — repo lama menandai jawaban ini sebagai titik awal yang
// perlu disesuaikan dengan kebijakan asli bengkel (garansi, jemput mobil).
export const FAQ_ITEMS = [
  {
    question: 'Apakah ada garansi untuk servis dan sparepart?',
    answer:
      'Setiap pengerjaan dan sparepart yang kami pasang punya garansi. Durasinya tergantung jenis pekerjaan dan dijelaskan SA sebelum Anda ACC estimasi.',
  },
  {
    question: 'Sparepart yang dipakai original atau aftermarket?',
    answer:
      'Kami informasikan pilihan sparepart (original/aftermarket berkualitas) beserta harganya di estimasi. Anda yang putuskan sebelum kami kerjakan.',
  },
  {
    question: 'Berapa lama estimasi waktu pengerjaan?',
    answer:
      'Servis rutin biasanya selesai di hari yang sama. Perbaikan yang lebih kompleks akan diinfokan estimasi waktunya saat diagnosis, sebelum Anda ACC.',
  },
  {
    question: 'Bisa reschedule kalau jadwal berubah?',
    answer: 'Bisa. Hubungi kami lewat WhatsApp minimal H-1 sebelum jadwal, kami bantu carikan slot baru.',
  },
  {
    question: 'Apakah ada layanan jemput mobil?',
    answer:
      'Untuk area Tangerang Selatan dan sekitarnya kami bisa bantu jemput mobil. Hubungi WhatsApp untuk cek jangkauan dan biayanya.',
  },
] as const;
