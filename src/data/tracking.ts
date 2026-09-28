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
}

export interface ServiceItemRow {
  id: string;
  name: string;
  type: 'part' | 'jasa';
  price: number;
  qty: number;
  status: 'pending' | 'approved' | 'rejected';
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
  checkInDate: string;
  serviceAdvisor: string;
  leadMechanic: string;
  complaints: string[];
  status: ServiceStatus;
  progressStep: number; // 1 to 5
  findings: ServiceFinding[];
  items: ServiceItemRow[];
  estimatedCompletion: string;
}

export const DEMO_ORDERS: ServiceOrder[] = [
  {
    id: 'wo-188-01',
    workOrderNumber: 'WO-2026-0811',
    customerName: 'Bapak Hartono',
    customerPhone: '081818818801',
    plateNumber: 'B 188 BR',
    carBrand: 'Mercedes-Benz',
    carModel: 'C200 Exclusive (W205)',
    carYear: '2017',
    carVin: 'WDD2050422R188902',
    checkInDate: '28 Sep 2026, 08:30 WIB',
    serviceAdvisor: 'Rian (Service Advisor)',
    leadMechanic: 'Dedi (Master Tech Mercedes)',
    complaints: [
      'Bau oli terbakar tercium dari lubang AC kabin saat macet.',
      'Bunyi gemuruh halus dari roda depan saat jalan bergelombang.',
    ],
    status: 'pengerjaan',
    progressStep: 4,
    estimatedCompletion: 'Hari ini, 17:00 WIB',
    findings: [
      {
        id: 'f-1',
        partName: 'Gasket Valve Cover / Packing Tutup Klep',
        description: 'Karet gasket telah mengeras dan getas, oli merembes ke heat-shield knalpot.',
        imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
        estimatedCost: 1450000,
        status: 'approved',
        urgency: 'kritis',
      },
      {
        id: 'f-2',
        partName: 'Bushing Lower Control Arm Depan Kanan',
        description: 'Karet bushing hydro retak 60%, menyebabkan getaran saat pengereman awal.',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        estimatedCost: 1850000,
        status: 'approved',
        urgency: 'disarankan',
      },
    ],
    items: [
      { id: 'i-1', name: 'Gasket Cover Klep Original Mercedes-Benz', type: 'part', price: 950000, qty: 1, status: 'approved' },
      { id: 'i-2', name: 'Jasa Penggantian Packing & Pembersihan Ruang Mesin', type: 'jasa', price: 500000, qty: 1, status: 'approved' },
      { id: 'i-3', name: 'Hydro Bushing Arm Depan Kanan Lemforder', type: 'part', price: 1350000, qty: 1, status: 'approved' },
      { id: 'i-4', name: 'Jasa Press Bushing & Spooring Laser Komputer', type: 'jasa', price: 500000, qty: 1, status: 'approved' },
    ],
  },
  {
    id: 'wo-188-02',
    workOrderNumber: 'WO-2026-0815',
    customerName: 'Ibu Stephanie',
    customerPhone: '081234567890',
    plateNumber: 'B 1234 BMW',
    carBrand: 'BMW',
    carModel: '320i Sport LCI (F30)',
    carYear: '2016',
    carVin: 'WBA8A1207GNT98124',
    checkInDate: '28 Sep 2026, 10:15 WIB',
    serviceAdvisor: 'Taufik (Service Advisor)',
    leadMechanic: 'Arif (BMW Certified Tech)',
    complaints: [
      'Peringatan Brake Pad Wear di layar iDrive.',
      'Suhu mesin terasa lebih panas dari biasanya saat AC on.',
    ],
    status: 'menunggu_acc',
    progressStep: 3,
    estimatedCompletion: 'Menunggu konfirmasi pemilik',
    findings: [
      {
        id: 'f-3',
        partName: 'Brake Pad & Sensor Kampas Rem Depan',
        description: 'Ketebalan kampas sisa 2.2 mm (batas aman minimum 3.0 mm).',
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
        estimatedCost: 1650000,
        status: 'pending',
        urgency: 'kritis',
      },
      {
        id: 'f-4',
        partName: 'Pipa Coolant Bypass Termostat',
        description: 'Ditemukan kerak putih residu radiator coolant di sambungan selang bypass.',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
        estimatedCost: 850000,
        status: 'pending',
        urgency: 'disarankan',
      },
    ],
    items: [
      { id: 'i-5', name: 'Brake Pad Set Depan Brembo Low-Metallic', type: 'part', price: 1250000, qty: 1, status: 'pending' },
      { id: 'i-6', name: 'Wear Sensor Kabel Rem Original BMW', type: 'part', price: 200000, qty: 1, status: 'pending' },
      { id: 'i-7', name: 'Jasa Pemasangan & Bleeding Minyak Rem Dot 4', type: 'jasa', price: 200000, qty: 1, status: 'pending' },
      { id: 'i-8', name: 'Pipa Flange Coolant OES BMW & O-Ring', type: 'part', price: 550000, qty: 1, status: 'pending' },
      { id: 'i-9', name: 'Jasa Penggantian Pipa & Pressure Test Sistem Radiator', type: 'jasa', price: 300000, qty: 1, status: 'pending' },
    ],
  },
  {
    id: 'wo-188-03',
    workOrderNumber: 'WO-2026-0798',
    customerName: 'Bapak Daniel',
    customerPhone: '081199887766',
    plateNumber: 'B 888 AUD',
    carBrand: 'Audi',
    carModel: 'Q7 3.0 TFSI Quattro (4M)',
    carYear: '2018',
    carVin: 'WAUZZZ4M1JD012891',
    checkInDate: '27 Sep 2026, 09:00 WIB',
    serviceAdvisor: 'Rian (Service Advisor)',
    leadMechanic: 'Dedi (Master Tech VAG)',
    complaints: [
      'Servis berkala 60.000 KM.',
      'Penggantian oli transmisi matik ZF 8HP & filter carter.',
    ],
    status: 'selesai',
    progressStep: 5,
    estimatedCompletion: 'Selesai & Lulus Uji Jalan',
    findings: [
      {
        id: 'f-5',
        partName: 'Filter Udara & Filter Kabin Karbon Aktif',
        description: 'Filter tersumbat debu jalanan, telah diganti unit baru.',
        imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
        estimatedCost: 950000,
        status: 'approved',
        urgency: 'disarankan',
      },
    ],
    items: [
      { id: 'i-10', name: 'Oli Mesin Fuchs Titan GT1 PRO C-3 5W-30 (8 Liter)', type: 'part', price: 1600000, qty: 8, status: 'approved' },
      { id: 'i-11', name: 'Filter Oli Original Audi V6', type: 'part', price: 350000, qty: 1, status: 'approved' },
      { id: 'i-12', name: 'Paket Kuras Oli Matik ZF Lifeguard 8 & Carter Filter', type: 'part', price: 3200000, qty: 1, status: 'approved' },
      { id: 'i-13', name: 'Jasa Servis Lengkap + Reset Interval Komputer ODIS', type: 'jasa', price: 650000, qty: 1, status: 'approved' },
    ],
  },
];
