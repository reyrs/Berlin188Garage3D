import { useState, useMemo, useRef } from 'react';
import {
  MagnifyingGlass,
  X,
  Wrench,
  Clock,
  ShieldCheck,
  WhatsappLogo,
  Camera,
  Check,
  WarningCircle,
  Car,
  Receipt,
  ListChecks,
  Cpu,
  Sparkle,
  DeviceMobile,
  ClipboardText,
} from '@phosphor-icons/react';
import { DEMO_ORDERS, type ServiceOrder, type ServiceFinding } from '../../data/tracking';
import { formatRupiah } from '../../lib/marketplace';
import { SITE } from '../../data/site';

const STEPS = [
  { step: 1, label: 'Check-in' },
  { step: 2, label: 'Diagnosis' },
  { step: 3, label: 'Persetujuan' },
  { step: 4, label: 'Pengerjaan' },
  { step: 5, label: 'Selesai & QC' },
];

export function ServiceTrackingSection() {
  const portalRef = useRef<HTMLDivElement>(null);

  // Phone Mockup interactive state (matching berlin188.com)
  const [mockupStatus, setMockupStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Search portal state
  const [query, setQuery] = useState('B 188 BR');
  const [searchedOrder, setSearchedOrder] = useState<ServiceOrder | null>(() => DEMO_ORDERS[0]);
  const [activeTab, setActiveTab] = useState<'findings' | 'biaya' | 'timeline' | 'keluhan'>('findings');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(() => DEMO_ORDERS[0].findings[0]?.id || null);

  // Local state for customer approval decisions in the portal
  const [findingsDecisions, setFindingsDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

  const scrollToPortal = () => {
    portalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (searchVal: string) => {
    const clean = searchVal.trim().toLowerCase().replace(/\s+/g, '');
    if (!clean) {
      setSearchedOrder(null);
      return;
    }

    const match = DEMO_ORDERS.find(
      (o) =>
        o.plateNumber.toLowerCase().replace(/\s+/g, '').includes(clean) ||
        o.customerPhone.includes(clean) ||
        o.workOrderNumber.toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean)
    );

    setSearchedOrder(match || null);
    if (match && match.findings[0]) {
      setSelectedFindingId(match.findings[0].id);
    }
  };

  const handleDecision = (findingId: string, decision: 'approved' | 'rejected') => {
    setFindingsDecisions((prev) => ({
      ...prev,
      [findingId]: decision,
    }));
  };

  // Calculate live total based on approved items
  const { totalApprovedCost, approvedCount, rejectedCount } = useMemo(() => {
    if (!searchedOrder) return { totalApprovedCost: 0, approvedCount: 0, rejectedCount: 0 };

    let total = 0;
    let approved = 0;
    let rejected = 0;

    searchedOrder.items.forEach((item) => {
      const findingDecision = item.findingId ? findingsDecisions[item.findingId] : undefined;
      const isApproved = findingDecision ? findingDecision === 'approved' : item.status === 'approved';

      if (isApproved) {
        total += item.price * item.qty;
        approved++;
      } else {
        rejected++;
      }
    });

    return { totalApprovedCost: total, approvedCount: approved, rejectedCount: rejected };
  }, [searchedOrder, findingsDecisions]);

  const getUrgencyBadge = (urgency: ServiceFinding['urgency']): { bg: string; border: string; label: string } => {
    if (urgency === 'kritis') {
      return { bg: 'bg-red-50 text-red-700', border: 'border-red-200', label: 'Perlu Segera Diganti' };
    }
    if (urgency === 'disarankan') {
      return { bg: 'bg-amber-50 text-amber-700', border: 'border-amber-200', label: 'Disarankan' };
    }
    return { bg: 'bg-slate-100 text-slate-700', border: 'border-slate-200', label: 'Pemantauan Berkala' };
  };

  const getStatusText = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'checkin':
        return 'Penerimaan & Antre Inspeksi';
      case 'diagnosis':
        return 'Pemeriksaan Scanner & Fisik';
      case 'menunggu_acc':
        return 'Menunggu Konfirmasi Biaya (ACC)';
      case 'pengerjaan':
        return 'Sedang Dikerjakan Mekanik';
      case 'selesai':
        return 'Selesai & Lolos Uji Jalan';
      default:
        return 'Dalam Proses';
    }
  };

  // WhatsApp message for Service Advisor
  const getConfirmationWaLink = () => {
    if (!searchedOrder) return '';

    const lines = [
      `*KONFIRMASI SURAT PERINTAH KERJA (SPK)*`,
      `*Berlin 188 Garage - Transparansi Servis*`,
      ``,
      `No. SPK: ${searchedOrder.workOrderNumber}`,
      `Kendaraan: ${searchedOrder.carBrand} ${searchedOrder.carModel} (${searchedOrder.plateNumber})`,
      `Pemilik: ${searchedOrder.customerName}`,
      `Service Advisor: ${searchedOrder.serviceAdvisor}`,
      ``,
      `*Daftar Pekerjaan & Part yang disetujui (ACC):*`,
    ];

    searchedOrder.items.forEach((item, idx) => {
      const decision = item.findingId ? findingsDecisions[item.findingId] : item.status;
      const isApproved = decision === 'approved';
      if (isApproved) {
        lines.push(`${idx + 1}. [ACC] ${item.name} - ${formatRupiah(item.price * item.qty)}`);
      } else {
        lines.push(`${idx + 1}. [TUNDA] ${item.name}`);
      }
    });

    lines.push(``);
    lines.push(`*Total Estimasi yang Disetujui: ${formatRupiah(totalApprovedCost)}*`);
    lines.push(`Mohon teknisi Berlin 188 melanjutkan pengerjaan sesuai daftar di atas. Terima kasih.`);

    return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <section id="cek-servis" className="relative bg-cloud-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* ========================================================= */}
        {/* 1. AUTHENTIC HERO SHOWCASE (Faithful to berlin188.com) */}
        {/* ========================================================= */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column: Descriptive Text & Value Proposition */}
          <div className="order-2 md:order-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Transparansi
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Pantau langsung dari HP
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              Setiap temuan kami foto, setiap biaya kami jelaskan. Kamu tinggal pantau progress servis dari HP, kapan saja.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  <Check className="h-3.5 w-3.5" weight="bold" />
                </div>
                <span>Foto makro & video temuan dikirim langsung dari ruang mesin</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  <Check className="h-3.5 w-3.5" weight="bold" />
                </div>
                <span>Estimasi biaya suku cadang OES & jasa disetujui di awal (tanpa kejutan)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  <Check className="h-3.5 w-3.5" weight="bold" />
                </div>
                <span>Seluruh suku cadang lama yang diganti wajib diserahkan kembali</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToPortal}
                className="inline-flex items-center gap-2.5 rounded-xl bg-berlin-blue hover:bg-berlin-blue-dark active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-berlin-blue/20"
              >
                <ClipboardText className="h-5 w-5 text-white shrink-0" weight="bold" />
                <span className="text-white font-bold tracking-wide">Cek Status Servis Saya</span>
              </button>

              <a
                href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                  `Halo Berlin 188 Garage, saya ingin menanyakan status pengerjaan kendaraan saya.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 transition-colors shadow-xs"
              >
                <WhatsappLogo className="h-4 w-4 text-emerald-600" weight="fill" />
                <span>Tanya SA via WA</span>
              </a>
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Mockup */}
          <div className="order-1 md:order-2 flex justify-center py-4">
            <div className="relative w-full max-w-[340px]">
              {/* Soft Ambient Background Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-berlin-blue/20 to-berlin-gold/15 rounded-[44px] blur-xl opacity-75 pointer-events-none" />

              {/* Floating WhatsApp Notification Pill (Top Right) */}
              <div className="absolute -top-3 -right-2 sm:-right-6 z-30 bg-white border border-slate-200 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-[220px]">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Berlin 188 Garage</p>
                  <p className="text-[11px] text-slate-600 leading-snug">3 foto temuan baru untuk mobil Anda</p>
                </div>
              </div>

              {/* Realistic Smartphone Chassis */}
              <div className="relative rounded-[42px] p-3 bg-[#0d1013] border-4 border-slate-700/60 shadow-2xl shadow-black/40">
                {/* Dynamic Island / Top Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-[#1a1f26] border border-slate-700" />
                </div>

                {/* Smartphone Screen Content */}
                <div className="bg-[#f8fafc] rounded-[32px] overflow-hidden pt-7 pb-4 px-4 space-y-3 border border-slate-200 text-left select-none">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-sans px-1">
                    <span className="font-semibold">09:41</span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE TRACKING
                    </span>
                  </div>

                  {/* Vehicle Header */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-berlin-blue">
                        Mercedes-Benz C200 • 2017
                      </span>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                        B 188 BR
                      </span>
                    </div>

                    {/* 5-Step Timeline Dots */}
                    <ol className="mt-2.5 grid grid-cols-5 gap-1" aria-label="Progres servis">
                      <li className="flex flex-col items-center gap-1">
                        <span className="h-1.5 w-full rounded-full transition-colors duration-500 bg-emerald-500" />
                        <span className="text-[9px] leading-none font-semibold text-slate-500">Check-in</span>
                      </li>
                      <li className="flex flex-col items-center gap-1">
                        <span className="h-1.5 w-full rounded-full transition-colors duration-500 bg-emerald-500" />
                        <span className="text-[9px] leading-none font-semibold text-slate-500">Diagnosis</span>
                      </li>
                      <li className="flex flex-col items-center gap-1">
                        <span
                          className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                            mockupStatus === 'approved'
                              ? 'bg-emerald-500'
                              : mockupStatus === 'rejected'
                              ? 'bg-slate-300'
                              : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <span className="text-[9px] leading-none font-semibold text-slate-900">Setuju</span>
                      </li>
                      <li className="flex flex-col items-center gap-1">
                        <span
                          className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                            mockupStatus === 'approved' ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'
                          }`}
                        />
                        <span className="text-[9px] leading-none font-semibold text-slate-500">Kerja</span>
                      </li>
                      <li className="flex flex-col items-center gap-1">
                        <span className="h-1.5 w-full rounded-full transition-colors duration-500 bg-slate-200" />
                        <span className="text-[9px] leading-none font-semibold text-slate-500">Selesai</span>
                      </li>
                    </ol>
                  </div>

                  {/* Finding Card (Authentic Inspection Photo) */}
                  <div
                    className={`bg-white rounded-2xl border p-3 space-y-2.5 shadow-xs transition-colors duration-300 ${
                      mockupStatus === 'approved'
                        ? 'border-emerald-300'
                        : mockupStatus === 'rejected'
                        ? 'border-slate-200'
                        : 'border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[9px]">
                        Temuan Diagnosis #1
                      </span>
                      <span
                        className={`font-sans font-black text-xs transition-colors ${
                          mockupStatus === 'rejected' ? 'text-slate-400 line-through' : 'text-berlin-blue'
                        }`}
                      >
                        Rp 850.000
                      </span>
                    </div>

                    {/* Actual Inspection Photo with Ping Radar Pin */}
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src="/images/temuan-mesin.webp"
                        alt="Mekanik Berlin 188 Garage memeriksa ruang mesin Mercedes-Benz"
                        className="w-full h-full object-cover"
                      />

                      {/* Hotspot radar pin pointing to the leaking hose */}
                      <span className="absolute left-[46%] top-[66%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 pointer-events-none" aria-hidden="true">
                        <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping" />
                        <span className="absolute inset-0 rounded-full border-2 border-red-500 bg-red-500/20" />
                      </span>

                      <span
                        className="absolute left-[46%] top-[66%] translate-x-5 -translate-y-8 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none"
                        aria-hidden="true"
                      >
                        Selang rembes
                      </span>

                      <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        Foto mekanik • 1/3
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-snug font-medium">
                      Selang radiator rembes &amp; coolant di bawah batas minimum. Disarankan ganti selang sebelum mesin overheat.
                    </p>

                    {/* Interactive Decision Actions */}
                    {mockupStatus === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setMockupStatus('approved')}
                          className="bg-berlin-blue hover:bg-berlin-blue-dark text-white text-[11px] font-bold min-h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-300" weight="bold" />
                          <span>ACC Biaya</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMockupStatus('rejected')}
                          className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-[11px] font-semibold min-h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <X className="w-3.5 h-3.5" weight="bold" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        role="status"
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                          mockupStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          {mockupStatus === 'approved' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" weight="bold" />
                              <span>Disetujui — mekanik mulai kerja</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-slate-500 shrink-0" weight="bold" />
                              <span>Ditolak — tanpa biaya</span>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMockupStatus('pending')}
                          className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100 cursor-pointer shrink-0"
                        >
                          Ulangi
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Open Full Portal Trigger Button inside Phone */}
                  <button
                    type="button"
                    onClick={scrollToPortal}
                    className="w-full bg-berlin-blue/10 hover:bg-berlin-blue/15 text-berlin-blue text-[11px] font-bold min-h-9 rounded-xl border border-berlin-blue/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <DeviceMobile className="w-3.5 h-3.5" weight="bold" />
                    <span>Buka Portal Tracking Asli</span>
                  </button>
                </div>
              </div>

              {/* Floating Shield Badge (Bottom Left) */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" weight="bold" />
                </div>
                <div className="text-left pr-2">
                  <p className="text-[11px] font-extrabold text-slate-900 leading-none">Rp0 Biaya Kejutan</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-none">Persetujuan 100% di tangan Anda</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. REAL WORKSHOP TRACKING PORTAL (Search & Live SPK View) */}
        {/* ========================================================= */}
        <div ref={portalRef} className="pt-8 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="rounded-full bg-berlin-blue/10 px-3 py-1 text-xs font-bold text-berlin-blue uppercase tracking-wider">
              Portal Pelanggan Berlin 188
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pencarian SPK &amp; Rekapitulasi Servis
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Masukkan nomor polisi atau nomor telepon terdaftar untuk melihat riwayat diagnosis dan menyetujui rincian biaya.
            </p>
          </div>

          {/* Search Form & Demo Vehicle Switcher */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Masukkan Nomor Polisi (cth: B 188 BR) atau No. Telepon..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-berlin-blue focus:outline-hidden transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchedOrder(null);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-berlin-blue px-6 py-3.5 text-sm font-bold text-white hover:bg-berlin-blue-dark transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <span>Cari Status</span>
              </button>
            </form>

            {/* Quick Demo Vehicles Switcher */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Pilih kendaraan contoh:</span>
              {DEMO_ORDERS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setQuery(o.plateNumber);
                    setSearchedOrder(o);
                    if (o.findings[0]) setSelectedFindingId(o.findings[0].id);
                  }}
                  className={`rounded-xl px-3 py-1.5 font-mono font-bold transition-all cursor-pointer ${
                    searchedOrder?.id === o.id
                      ? 'bg-berlin-blue text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {o.plateNumber} ({o.carBrand})
                </button>
              ))}
            </div>
          </div>

          {/* Searched Order Result View */}
          {searchedOrder ? (
            <div className="mt-8 flex flex-col gap-8">
              {/* SPK & Vehicle Header Card */}
              <div className="rounded-3xl bg-white p-5 sm:p-8 border border-slate-200 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
                  {/* Vehicle Details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
                        SPK #{searchedOrder.workOrderNumber}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {searchedOrder.warrantyPeriod}
                      </span>
                      <span className="text-xs text-slate-400">Masuk: {searchedOrder.checkInDate}</span>
                    </div>

                    <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {searchedOrder.carBrand} {searchedOrder.carModel} ({searchedOrder.carYear})
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                      <div>
                        No. Rangka (VIN): <strong className="text-slate-800">{searchedOrder.carVin}</strong>
                      </div>
                      <div>
                        Kilometer: <strong className="text-slate-800">{searchedOrder.carOdometer}</strong>
                      </div>
                    </div>
                  </div>

                  {/* License Plate Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start md:items-end">
                      <div className="inline-flex rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-lg sm:text-xl font-extrabold font-mono text-white tracking-wider shadow-sm">
                        {searchedOrder.plateNumber}
                      </div>
                      <span className="mt-1 text-xs font-medium text-slate-500">
                        Pemilik: <strong className="text-slate-700">{searchedOrder.customerName}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Step Visual Progress Bar */}
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">Tahapan Pengerjaan</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-berlin-blue/10 px-3 py-1 font-bold text-berlin-blue text-xs">
                      <span className="h-2 w-2 rounded-full bg-berlin-blue animate-pulse" />
                      {getStatusText(searchedOrder.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {STEPS.map((s) => {
                      const isCompleted = s.step < searchedOrder.progressStep;
                      const isCurrent = s.step === searchedOrder.progressStep;
                      return (
                        <div key={s.step} className="flex flex-col gap-1.5">
                          <div
                            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isCurrent
                                ? 'bg-berlin-blue animate-pulse'
                                : 'bg-slate-200'
                            }`}
                          />
                          <div className="flex items-center gap-1">
                            {isCompleted ? (
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" weight="bold" />
                            ) : isCurrent ? (
                              <div className="h-2 w-2 rounded-full bg-berlin-blue shrink-0" />
                            ) : null}
                            <span
                              className={`text-[10px] sm:text-xs font-bold truncate ${
                                isCurrent
                                  ? 'text-berlin-blue font-extrabold'
                                  : isCompleted
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Tabs Details & Summary Action */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                {/* Left Column: Interactive Tabs */}
                <div className="rounded-3xl bg-white p-5 sm:p-8 border border-slate-200 shadow-xs">
                  {/* Tabs bar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scroll-row">
                    <button
                      type="button"
                      onClick={() => setActiveTab('findings')}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === 'findings'
                          ? 'bg-berlin-blue text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Camera className="h-4 w-4" weight="bold" />
                      <span>Temuan Fisik ({searchedOrder.findings.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('biaya')}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === 'biaya'
                          ? 'bg-berlin-blue text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Receipt className="h-4 w-4" weight="bold" />
                      <span>Rincian Suku Cadang &amp; Jasa ({searchedOrder.items.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('timeline')}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === 'timeline'
                          ? 'bg-berlin-blue text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="h-4 w-4" weight="bold" />
                      <span>Log Bengkel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('keluhan')}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === 'keluhan'
                          ? 'bg-berlin-blue text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ListChecks className="h-4 w-4" weight="bold" />
                      <span>Keluhan Awal</span>
                    </button>
                  </div>

                  {/* TAB 1: Macro Physical Findings & Photos */}
                  {activeTab === 'findings' && (
                    <div className="mt-6 flex flex-col gap-5">
                      <div className="text-xs text-slate-500 font-medium">
                        Dokumentasi foto aktual dari ruang mesin dan kaki-kaki mobil Anda. Klik foto untuk memperbesar.
                      </div>

                      {searchedOrder.findings.map((f) => {
                        const badge = getUrgencyBadge(f.urgency);
                        const currentDecision = findingsDecisions[f.id] || f.status;
                        const isSelected = selectedFindingId === f.id;

                        return (
                          <div
                            key={f.id}
                            className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start ${
                              isSelected
                                ? 'border-berlin-blue bg-berlin-blue/5 ring-1 ring-berlin-blue/30 shadow-xs'
                                : 'border-slate-200 bg-slate-50/70'
                            }`}
                          >
                            {/* Image preview with lightbox trigger */}
                            <div
                              onClick={() => {
                                setSelectedFindingId(f.id);
                                setSelectedPhoto(f.imageUrl);
                              }}
                              className="relative h-44 w-full sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-900 cursor-pointer group border border-slate-300"
                            >
                              <img
                                src={f.imageUrl}
                                alt={f.partName}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Hotspot radar pin if available */}
                              {f.pinPosition && (
                                <span
                                  className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                  style={{ left: f.pinPosition.left, top: f.pinPosition.top }}
                                >
                                  <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping" />
                                  <span className="absolute inset-0 rounded-full border-2 border-red-500 bg-red-500/20" />
                                </span>
                              )}

                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold">
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Perbesar Foto</span>
                                </span>
                              </div>

                              <span className="absolute bottom-2 left-2 rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-mono text-white">
                                Foto Fisik
                              </span>
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.border}`}>
                                    {badge.label}
                                  </span>
                                  {f.zoneLabel && (
                                    <span className="text-[11px] text-slate-500">{f.zoneLabel}</span>
                                  )}
                                </div>

                                <span className="text-base font-extrabold font-mono text-berlin-blue">
                                  {formatRupiah(f.estimatedCost)}
                                </span>
                              </div>

                              <h4 className="mt-1.5 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                {f.partName}
                              </h4>

                              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                {f.description}
                              </p>

                              {f.partNumber && (
                                <div className="mt-2 text-[11px] font-mono text-slate-500">
                                  Nomor Part / Ref: <strong className="text-slate-800">{f.partNumber}</strong>
                                </div>
                              )}

                              {/* Interactive Decision Actions */}
                              <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-slate-600">
                                  Persetujuan Pemilik:
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDecision(f.id, 'approved')}
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                      currentDecision === 'approved'
                                        ? 'bg-emerald-600 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <Check className="h-4 w-4" weight="bold" />
                                    <span>Setujui (ACC)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDecision(f.id, 'rejected')}
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                      currentDecision === 'rejected'
                                        ? 'bg-red-600 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <X className="h-4 w-4" weight="bold" />
                                    <span>Tunda Dulu</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: Itemized Estimate Breakdown */}
                  {activeTab === 'biaya' && (
                    <div className="mt-6 flex flex-col">
                      <div className="text-xs text-slate-500 font-medium mb-3">
                        Rincian resmi estimasi suku cadang OES dan ongkos pengerjaan mekanik spesialis.
                      </div>

                      <div className="divide-y divide-slate-100">
                        {searchedOrder.items.map((item) => {
                          const decision = item.findingId ? findingsDecisions[item.findingId] : item.status;
                          const isApproved = decision === 'approved';

                          return (
                            <div key={item.id} className="py-3.5 flex items-center justify-between text-xs gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      item.type === 'part'
                                        ? 'bg-berlin-blue/10 text-berlin-blue'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {item.type === 'part' ? 'SUKU CADANG' : 'JASA MEKANIK'}
                                  </span>
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {isApproved ? 'DISETUJUI' : 'DITUNDA'}
                                  </span>
                                </div>
                                <div className="mt-1 font-semibold text-slate-800 text-xs sm:text-sm">
                                  {item.name}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-slate-900 text-sm shrink-0">
                                {formatRupiah(item.price * item.qty)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t-2 border-slate-200 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Status Persetujuan:</span>
                          <span className="font-bold">
                            {approvedCount} Disetujui / {rejectedCount} Ditunda
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-base font-extrabold text-berlin-blue-dark">
                          <span>Total Estimasi Berjalan (ACC):</span>
                          <span className="text-xl font-mono">{formatRupiah(totalApprovedCost)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Timestamped Workshop Telemetry Log */}
                  {activeTab === 'timeline' && (
                    <div className="mt-6 flex flex-col gap-4">
                      <div className="text-xs text-slate-500 font-medium">
                        Riwayat tahapan dan pengerjaan kendaraan secara aktual di bengkel hari ini:
                      </div>

                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {searchedOrder.timeline.map((item, idx) => (
                          <div key={idx} className="relative">
                            <div
                              className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-white ${
                                item.status === 'completed'
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : item.status === 'current'
                                  ? 'border-berlin-blue animate-pulse'
                                  : 'border-slate-300'
                              }`}
                            />
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900">{item.time}</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  item.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : item.status === 'current'
                                    ? 'bg-berlin-blue/10 text-berlin-blue font-extrabold'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {item.status === 'completed' ? 'Selesai' : item.status === 'current' ? 'Sedang Berjalan' : 'Antrean'}
                              </span>
                              {item.operator && (
                                <span className="text-[11px] text-slate-400">oleh {item.operator}</span>
                              )}
                            </div>
                            <h5 className="mt-1 text-xs sm:text-sm font-bold text-slate-900">{item.title}</h5>
                            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Initial Customer Complaints */}
                  {activeTab === 'keluhan' && (
                    <div className="mt-6 space-y-3">
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        Keluhan yang dicatat Service Advisor saat mobil pertama kali masuk:
                      </div>
                      {searchedOrder.complaints.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700"
                        >
                          <WarningCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" weight="bold" />
                          <span className="leading-relaxed">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Summary, WhatsApp Confirmation & Workshop Team */}
                <div className="flex flex-col gap-6">
                  {/* Live Quotation Approval Box */}
                  <div className="rounded-3xl bg-white p-6 border-2 border-berlin-blue/30 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-berlin-blue-dark">
                        <Sparkle className="h-4 w-4 text-berlin-gold" weight="fill" />
                        <span>Ringkasan ACC</span>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 text-[10px]">
                        Garansi 6 Bulan
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="text-xs text-slate-500">Total Suku Cadang &amp; Jasa Disetujui:</span>
                      <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                        {formatRupiah(totalApprovedCost)}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        *Estimasi biaya riil tanpa mark-up atau biaya tersembunyi
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <a
                        href={getConfirmationWaLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-4 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <WhatsappLogo className="h-5 w-5" weight="fill" />
                        <span>Kirim ACC ke SA via WhatsApp</span>
                      </a>

                      <div className="text-[11px] text-center text-slate-500">
                        Teknisi langsung memproses pengerjaan setelah konfirmasi Anda terima.
                      </div>
                    </div>
                  </div>

                  {/* Technical Team & Scanner Credentials Card */}
                  <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Tim Bengkel Berlin 188
                    </h4>
                    <div className="space-y-4 text-xs">
                      {/* Service Advisor */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue font-bold text-sm">
                          SA
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{searchedOrder.serviceAdvisor}</div>
                          <div className="text-slate-500">Service Advisor Resmi</div>
                        </div>
                      </div>

                      {/* Master Mechanic */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue font-bold">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{searchedOrder.leadMechanic}</div>
                          <div className="text-slate-500">{searchedOrder.leadMechanicRole}</div>
                        </div>
                      </div>

                      {/* Scanner Tool */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold">
                          <Cpu className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Alat Scan Diagnosa</div>
                          <div className="text-slate-500 font-mono text-[11px]">{searchedOrder.diagnosticScanner}</div>
                        </div>
                      </div>

                      {/* Estimated Ready */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{searchedOrder.estimatedCompletion}</div>
                          <div className="text-slate-500">Status Estimasi Siap</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 100% Transparency Promise */}
                  <div className="rounded-3xl bg-berlin-blue-dark text-white p-6 shadow-md">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" weight="bold" />
                      <span>Garansi &amp; Integritas Berlin 188</span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-white">Part Lama Selalu Diserahkan</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Kami tidak pernah membuang suku cadang lama tanpa sepengetahuan Anda. Seluruh part bekas yang diganti
                      akan dikemas rapi dan diserahkan kembali saat serah terima kendaraan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Search Result */
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-berlin-blue/10 text-berlin-blue mb-4">
                <Car className="h-8 w-8" weight="duotone" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kendaraan Belum Terdaftar di Antrean</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500 leading-relaxed">
                Nomor plat &quot;{query}&quot; belum terdaftar dalam antrean aktif hari ini. Jika kendaraan Anda baru saja tiba
                di bengkel, mohon tunggu beberapa saat atau hubungi Service Advisor kami.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 justify-center">
                <a
                  href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                    `Halo Berlin 188 Garage, saya ingin mengecek status pengerjaan mobil saya dengan plat nomor ${query}. Mohon bantuan konfirmasinya.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <WhatsappLogo className="h-4 w-4" weight="fill" />
                  <span>Konfirmasi via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Photo Preview Modal for Macro Inspection */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-2 sm:p-3 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-white">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Camera className="h-4 w-4 text-berlin-gold" />
                <span>Dokumentasi Foto Fisik Bengkel Berlin 188</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="p-2 overflow-auto flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhoto}
                alt="Foto Bukti Inspeksi Mekanik"
                className="max-h-[72vh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>

            {/* Modal Footer Note */}
            <div className="p-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
              <span>Foto diambil langsung saat mobil berada di lift hoist inspeksi.</span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-lg bg-white/10 px-3 py-1 text-white hover:bg-white/20 font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
