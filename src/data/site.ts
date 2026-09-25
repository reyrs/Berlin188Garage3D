const ADDRESS = 'Jl. Rawa Kutuk No. 31, Pondok Jagung Timur, Tangerang Selatan 15324';

export const SITE = {
  name: 'Berlin 188 Garage',
  address: ADDRESS,
  whatsappNumber: '6281818818801',
  whatsappDisplay: '0818-1881-8801',
  // TODO: konfirmasi — situs lama menampilkan nomor ini sebagai "Telepon / WhatsApp".
  phoneDisplay: '0821-1277-3501',
  // TODO: konfirmasi — JSON-LD situs lama menulis 08:30–17:00.
  hours: [
    { label: 'Senin - Sabtu', value: '08.00 - 18.00' },
    { label: 'Minggu', value: 'Tutup' },
  ],
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`,
  googleReviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Berlin+188+Garage+Tangerang+Selatan',
  disclaimer:
    'Berlin188 Garage adalah bengkel independen, bukan dealer atau bengkel resmi merek yang ditampilkan. Semua merek dagang milik pemiliknya masing-masing.',
} as const;
