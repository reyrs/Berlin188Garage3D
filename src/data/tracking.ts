export type ServiceStatus =
  | 'checkin'
  | 'diagnosis'
  | 'menunggu_acc'
  | 'pengerjaan'
  | 'selesai';

export interface ServiceFinding {
  id: string;
  partName: string;
  description: string;
  imageUrl: string;
  estimatedCost: number;
  status: 'pending' | 'approved' | 'rejected';
  urgency: 'kritis' | 'disarankan' | 'pemantauan';
  pinLabel?: string;
  pinPosition?: { left: string; top: string };
  partNumber?: string;
  zoneLabel?: string;
}

export interface ServiceItemRow {
  id: string;
  name: string;
  type: 'part' | 'jasa';
  price: number;
  qty: number;
  status: 'pending' | 'approved' | 'rejected';
  findingId?: string;
}

export interface ServiceTimelineItem {
  time: string;
  title: string;
  desc: string;
  status: 'completed' | 'current' | 'pending';
  operator?: string;
}

export interface ServiceOrder {
  id: string;
  workOrderNumber: string;
  customerName: string;
  customerPhone: string;
  plateNumber: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carVin: string;
  carOdometer: string;
  warrantyPeriod: string;
  checkInDate: string;
  serviceAdvisor: string;
  serviceAdvisorPhone: string;
  leadMechanic: string;
  leadMechanicRole: string;
  diagnosticScanner: string;
  status: ServiceStatus;
  progressStep: number; // 1 to 5
  findings: ServiceFinding[];
  items: ServiceItemRow[];
  timeline: ServiceTimelineItem[];
  estimatedCompletion: string;
  complaints: string[];
}

export const DEMO_ORDERS: ServiceOrder[] = [
  {
    id: 'wo-188-01',
    workOrderNumber: 'WO-2026-0811',
    customerName: 'Bapak Hartono',
    customerPhone: '081818818801',
    plateNumber: 'B 188 BR',
    carBrand: 'Mercedes-Benz',
    carModel: 'C200 Exclusive',
    carYear: '2017',
    carVin: 'WDD2050422R188902',
    carOdometer: '68.420 KM',
    warrantyPeriod: 'Garansi 6 Bulan / 10.000 KM',
    checkInDate: '28 Sep 2026, 08:30 WIB',
    serviceAdvisor: 'Rian Pratama',
    serviceAdvisorPhone: '6281818818801',
    leadMechanic: 'Dedi Sutomo',
    leadMechanicRole: 'Master Tech Mercedes-Benz Star Diagnosa',
    diagnosticScanner: 'Mercedes-Benz Xentry Diagnostics V2026.03',
    status: 'menunggu_acc',
    progressStep: 3,
    estimatedCompletion: 'Hari ini, 17:00 WIB (setelah ACC)',
    complaints: [
      'Peringatan "Check Coolant Level" muncul di instrumen cluster saat jalan macet.',
      'Bau oli terbakar tercium tipis dari lubang ventilasi AC.',
      'Bunyi gemuruh halus dari suspensi depan kanan saat melintasi jalan bergelombang.',
    ],
    timeline: [
      { time: '08:30', title: 'Penerimaan & Check-In', desc: 'Mobil diterima oleh Service Advisor, pengecekan bodi keliling dan kilometer.', status: 'completed', operator: 'Rian (SA)' },
      { time: '09:00', title: 'Komputer Scanning & Inspeksi Fisik', desc: 'Full diagnostic scan Star Diagnosis Xentry dan mobil dinaikkan ke lift hoist.', status: 'completed', operator: 'Dedi (Master Tech)' },
      { time: '09:41', title: 'Dokumentasi Temuan & Estimasi Biaya', desc: 'Ditemukan rembesan selang radiator bypass dan packing cover klep. Menunggu ACC pemilik.', status: 'current', operator: 'Sistem Portal Berlin 188' },
      { time: '11:00', title: 'Pengerjaan & Pemasangan Suku Cadang', desc: 'Penggantian part disetujui, pengetesan tekanan sistem radiator dan pengencangan torsi baut.', status: 'pending' },
      { time: '16:30', title: 'Quality Control & Uji Jalan', desc: 'Pemeriksaan 24 titik akhir dan uji jalan oleh Kepala Bengkel sebelum serah terima.', status: 'pending' },
    ],
    findings: [
      {
        id: 'f-1',
        partName: 'Selang Radiator Bypass & Termostat',
        description: 'Selang radiator rembes & coolant di bawah batas minimum. Disarankan ganti selang sebelum mesin overheat.',
        imageUrl: '/images/temuan-mesin.webp',
        estimatedCost: 850000,
        status: 'pending',
        urgency: 'kritis',
        pinLabel: 'Selang rembes',
        pinPosition: { left: '46%', top: '66%' },
        partNumber: 'A 205 501 00 25',
        zoneLabel: 'Kompartemen Mesin (Sistem Pendingin)',
      },
      {
        id: 'f-2',
        partName: 'Gasket Valve Cover / Packing Tutup Klep',
        description: 'Karet gasket telah mengeras dan getas, oli merembes menetes ke heat-shield knalpot.',
        imageUrl: '/images/bengkel/overhaul-960.webp',
        estimatedCost: 1450000,
        status: 'pending',
        urgency: 'kritis',
        pinLabel: 'Packing rembes',
        pinPosition: { left: '50%', top: '45%' },
        partNumber: 'A 274 016 00 21',
        zoneLabel: 'Cylinder Head Engine',
      },
      {
        id: 'f-3',
        partName: 'Bushing Lower Control Arm Depan Kanan',
        description: 'Karet bushing hydro robek 60%, cairan peredam bocor menyebabkan getaran saat jalan bergelombang.',
        imageUrl: '/images/services/balancing-shaking-card-960.webp',
        estimatedCost: 1850000,
        status: 'pending',
        urgency: 'disarankan',
        pinLabel: 'Bushing robek',
        pinPosition: { left: '40%', top: '60%' },
        partNumber: 'Lemförder 38441 01',
        zoneLabel: 'Kaki-kaki Depan Kanan',
      },
    ],
    items: [
      { id: 'i-1', findingId: 'f-1', name: 'Selang Radiator Bypass Original Mercedes-Benz', type: 'part', price: 650000, qty: 1, status: 'pending' },
      { id: 'i-2', findingId: 'f-1', name: 'Jasa Pasang Selang, Bleeding & Coolant MB Approval 325.0', type: 'jasa', price: 200000, qty: 1, status: 'pending' },
      { id: 'i-3', findingId: 'f-2', name: 'Gasket Cover Klep Original Mercedes-Benz M274', type: 'part', price: 950000, qty: 1, status: 'pending' },
      { id: 'i-4', findingId: 'f-2', name: 'Jasa Penggantian Packing & Pembersihan Mesin', type: 'jasa', price: 500000, qty: 1, status: 'pending' },
      { id: 'i-5', findingId: 'f-3', name: 'Hydro Bushing Arm Depan Kanan Lemförder Germany', type: 'part', price: 1350000, qty: 1, status: 'pending' },
      { id: 'i-6', findingId: 'f-3', name: 'Jasa Press Bushing Hidrolik & Spooring Laser Komputer', type: 'jasa', price: 500000, qty: 1, status: 'pending' },
    ],
  },
  {
    id: 'wo-188-02',
    workOrderNumber: 'WO-2026-0815',
    customerName: 'Ibu Stephanie',
    customerPhone: '081234567890',
    plateNumber: 'B 1234 BMW',
    carBrand: 'BMW',
    carModel: '320i Sport LCI',
    carYear: '2016',
    carVin: 'WBA8A1207GNT98124',
    carOdometer: '74.200 KM',
    warrantyPeriod: 'Garansi 6 Bulan / 10.000 KM',
    checkInDate: '28 Sep 2026, 10:15 WIB',
    serviceAdvisor: 'Taufik Hidayat',
    serviceAdvisorPhone: '6281818818801',
    leadMechanic: 'Arif Wibowo',
    leadMechanicRole: 'Senior Tech BMW & MINI',
    diagnosticScanner: 'BMW ISTA/D Rheingold Diagnostic',
    status: 'menunggu_acc',
    progressStep: 3,
    estimatedCompletion: 'Menunggu persetujuan suku cadang',
    complaints: [
      'Peringatan "Brake Pad Wear" menyala di layar iDrive.',
      'Suhu mesin terasa lebih cepat panas saat AC dinyalakan.',
    ],
    timeline: [
      { time: '10:15', title: 'Penerimaan & Check-In', desc: 'Penerimaan unit BMW F30 oleh Service Advisor.', status: 'completed', operator: 'Taufik (SA)' },
      { time: '10:45', title: 'Inspeksi Rem & Tekanan Radiator', desc: 'Pengukuran ketebalan brake pad dengan jangka sorong digital dan visual inspection.', status: 'completed', operator: 'Arif (BMW Tech)' },
      { time: '11:20', title: 'Temuan Kampas & Pipa Pendingin', desc: 'Foto dokumentasi dikirim ke portal tracking. Menunggu ACC.', status: 'current', operator: 'Sistem Portal Berlin 188' },
    ],
    findings: [
      {
        id: 'f-4',
        partName: 'Brake Pad & Sensor Kampas Rem Depan',
        description: 'Ketebalan kampas rem depan sisa 2.1 mm (batas aman minimum pabrikan 3.0 mm).',
        imageUrl: '/images/bengkel/ban-960.webp',
        estimatedCost: 1450000,
        status: 'pending',
        urgency: 'kritis',
        pinLabel: 'Kampas aus (2.1mm)',
        pinPosition: { left: '48%', top: '55%' },
        partNumber: 'Brembo Low-Metallic P 06 088',
        zoneLabel: 'Rem Roda Depan',
      },
      {
        id: 'f-5',
        partName: 'Pipa Flange Coolant Termostat',
        description: 'Ditemukan kerak putih residu radiator coolant di sambungan pipa bypass plastik.',
        imageUrl: '/images/temuan-mesin.webp',
        estimatedCost: 850000,
        status: 'pending',
        urgency: 'disarankan',
        pinLabel: 'Kerak coolant',
        pinPosition: { left: '52%', top: '62%' },
        partNumber: 'BMW 11537600584',
        zoneLabel: 'Sistem Pendingin Mesin B48',
      },
    ],
    items: [
      { id: 'i-7', findingId: 'f-4', name: 'Brake Pad Set Depan Brembo Low-Metallic F30', type: 'part', price: 1100000, qty: 1, status: 'pending' },
      { id: 'i-8', findingId: 'f-4', name: 'Wear Sensor Kabel Rem Original BMW', type: 'part', price: 150000, qty: 1, status: 'pending' },
      { id: 'i-9', findingId: 'f-4', name: 'Jasa Pemasangan & Bleeding Minyak Rem Dot 4', type: 'jasa', price: 200000, qty: 1, status: 'pending' },
      { id: 'i-10', findingId: 'f-5', name: 'Pipa Flange Coolant OES BMW & O-Ring Seal', type: 'part', price: 550000, qty: 1, status: 'pending' },
      { id: 'i-11', findingId: 'f-5', name: 'Jasa Penggantian Pipa & Pressure Test Sistem Radiator', type: 'jasa', price: 300000, qty: 1, status: 'pending' },
    ],
  },
  {
    id: 'wo-188-03',
    workOrderNumber: 'WO-2026-0798',
    customerName: 'Bapak Daniel',
    customerPhone: '081199887766',
    plateNumber: 'B 888 AUD',
    carBrand: 'Audi',
    carModel: 'Q7 3.0 TFSI Quattro',
    carYear: '2018',
    carVin: 'WAUZZZ4M1JD012891',
    carOdometer: '61.150 KM',
    warrantyPeriod: 'Garansi 6 Bulan / 10.000 KM',
    checkInDate: '27 Sep 2026, 09:00 WIB',
    serviceAdvisor: 'Rian Pratama',
    serviceAdvisorPhone: '6281818818801',
    leadMechanic: 'Dedi Sutomo',
    leadMechanicRole: 'Master Tech VAG Group (VW/Audi/Porsche)',
    diagnosticScanner: 'VAG ODIS Diagnostic System',
    status: 'selesai',
    progressStep: 5,
    estimatedCompletion: 'Selesai & Lolos Uji Jalan',
    complaints: [
      'Jadwal servis berkala besar 60.000 KM.',
      'Kuras total oli transmisi otomatis ZF 8-Speed & ganti filter carter.',
    ],
    timeline: [
      { time: '09:00', title: 'Check-in Kendaraan', desc: 'Mobil diterima untuk paket servis besar berkala.', status: 'completed', operator: 'Rian (SA)' },
      { time: '10:00', title: 'Penggantian Oli Mesin & Filter Udara', desc: 'Oli mesin Fuchs Titan GT1 dan seluruh filter diganti unit baru.', status: 'completed', operator: 'Dedi (Master Tech)' },
      { time: '13:00', title: 'Flushing Oli Matik ZF 8-Speed', desc: 'Kuras tuntas dengan mesin ATF flusher dan adaptasi nilai mekatronik.', status: 'completed', operator: 'Dedi (Master Tech)' },
      { time: '16:00', title: 'Uji Jalan & Selesai', desc: 'Kendaraan siap diserahkan dalam kondisi prima.', status: 'completed', operator: 'Kepala Bengkel' },
    ],
    findings: [
      {
        id: 'f-6',
        partName: 'Filter Udara & Filter Kabin Karbon Aktif',
        description: 'Filter kotor pekat, telah diganti unit baru saat servis berkala.',
        imageUrl: '/images/services/tune-up-card-960.webp',
        estimatedCost: 950000,
        status: 'approved',
        urgency: 'disarankan',
        pinLabel: 'Filter baru',
        pinPosition: { left: '50%', top: '50%' },
        partNumber: 'MANN C 38 011',
        zoneLabel: 'Filter Sistem Induksi & Kabin',
      },
    ],
    items: [
      { id: 'i-12', findingId: 'f-6', name: 'Oli Mesin Fuchs Titan GT1 PRO C-3 5W-30 (8 Liter)', type: 'part', price: 1600000, qty: 1, status: 'approved' },
      { id: 'i-13', findingId: 'f-6', name: 'Filter Oli Original Audi V6 TFSI', type: 'part', price: 350000, qty: 1, status: 'approved' },
      { id: 'i-14', findingId: 'f-6', name: 'Paket Kuras Oli Matik ZF Lifeguard 8 & Carter Filter Original', type: 'part', price: 3200000, qty: 1, status: 'approved' },
      { id: 'i-15', findingId: 'f-6', name: 'Jasa Servis Lengkap + Reset Interval Komputer ODIS', type: 'jasa', price: 650000, qty: 1, status: 'approved' },
    ],
  },
];
