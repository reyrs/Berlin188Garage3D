import { useState, useMemo } from 'react';
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
  const [query, setQuery] = useState('B 188 BR');
  const [searchedOrder, setSearchedOrder] = useState<ServiceOrder | null>(() => DEMO_ORDERS[0]);
  const [activeTab, setActiveTab] = useState<'temuan' | 'biaya' | 'keluhan'>('temuan');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Local state for interactive approval in findings
  const [findingsDecisions, setFindingsDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

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
  };

  const handleDecision = (findingId: string, decision: 'approved' | 'rejected') => {
    setFindingsDecisions((prev) => ({
      ...prev,
      [findingId]: decision,
    }));
  };

  // Calculate live total based on approved items
  const totalCost = useMemo(() => {
    if (!searchedOrder) return 0;
    return searchedOrder.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [searchedOrder]);

  const getUrgencyBadge = (urgency: ServiceFinding['urgency']): { bg: string; border: string; label: string } => {
    if (urgency === 'kritis') {
      return { bg: 'bg-berlin-red/10 text-berlin-red', border: 'border-berlin-red/20', label: 'Perlu Segera Diganti' };
    }
    if (urgency === 'disarankan') {
      return { bg: 'bg-amber-500/10 text-amber-700', border: 'border-amber-500/20', label: 'Disarankan' };
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

  return (
    <section id="cek-servis" className="relative bg-cloud-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-blue">
              <ShieldCheck className="h-4 w-4" weight="bold" />
              <span>Transparansi Bengkel</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pantau Servis Mobil Anda
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Setiap temuan difoto dan dicatat beserta estimasi biaya suku cadang dan jasa.
              Pekerjaan baru dieksekusi setelah mendapatkan persetujuan (ACC) dari Anda.
            </p>
          </div>

          <a
            href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
              `Halo Berlin 188 Garage, saya ingin mengecek status servis kendaraan saya dengan plat nomor ${query}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <WhatsappLogo className="h-5 w-5" weight="fill" />
            <span>Tanya Service Advisor</span>
          </a>
        </div>

        {/* Search Bar & Quick Plate Chips */}
        <div className="mt-8 rounded-3xl bg-white p-5 border border-slate-200 shadow-xs sm:p-6">
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
                placeholder="Masukkan Nomor Plat (misal: B 188 BR) atau No. SPK / Telepon..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-berlin-blue focus:outline-hidden transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchedOrder(null);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-berlin-blue px-6 py-3.5 text-sm font-bold text-white hover:bg-berlin-blue-dark transition-colors shadow-product shrink-0"
            >
              <span>Cek Status</span>
            </button>
          </form>

          {/* Quick Demo Plate Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Contoh kendaraan uji coba:</span>
            {DEMO_ORDERS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setQuery(o.plateNumber);
                  setSearchedOrder(o);
                }}
                className={`rounded-lg px-2.5 py-1 font-mono font-bold transition-all ${
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

        {/* Live Service Result Display */}
        {searchedOrder ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Main Details Panel */}
            <div className="flex flex-col gap-6">
              {/* Vehicle & Progress Card */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs">
                {/* Vehicle header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {searchedOrder.workOrderNumber}
                      </span>
                      <span className="text-xs text-slate-400">Masuk: {searchedOrder.checkInDate}</span>
                    </div>
                    <h3 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900">
                      {searchedOrder.carBrand} {searchedOrder.carModel} ({searchedOrder.carYear})
                    </h3>
                    <div className="mt-1 text-xs text-slate-500 font-mono">
                      No. Rangka (VIN): <span className="text-slate-700 font-bold">{searchedOrder.carVin}</span>
                    </div>
                  </div>

                  {/* License plate style badge */}
                  <div className="flex flex-col items-start sm:items-end">
                    <div className="inline-flex rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-base font-extrabold font-mono text-white tracking-wider shadow-xs">
                      {searchedOrder.plateNumber}
                    </div>
                    <span className="mt-1 text-[11px] font-medium text-slate-500">
                      Pemilik: {searchedOrder.customerName}
                    </span>
                  </div>
                </div>

                {/* 5-Step Visual Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">Tahapan Pengerjaan</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-berlin-blue/10 px-3 py-1 font-bold text-berlin-blue text-xs">
                      <span className="h-2 w-2 rounded-full bg-berlin-blue animate-pulse" />
                      {getStatusText(searchedOrder.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {STEPS.map((s) => {
                      const isCompleted = s.step < searchedOrder.progressStep;
                      const isCurrent = s.step === searchedOrder.progressStep;
                      return (
                        <div key={s.step} className="flex flex-col gap-1.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
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
                              className={`text-[11px] font-bold truncate ${
                                isCurrent
                                  ? 'text-berlin-blue-dark'
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

              {/* Tabs for Findings, Estimate, and Complaints */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs">
                {/* Tab buttons */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scroll-row">
                  <button
                    type="button"
                    onClick={() => setActiveTab('temuan')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'temuan'
                        ? 'bg-berlin-blue text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Camera className="h-4 w-4" weight="bold" />
                    <span>Temuan Inspeksi ({searchedOrder.findings.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('biaya')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'biaya'
                        ? 'bg-berlin-blue text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Receipt className="h-4 w-4" weight="bold" />
                    <span>Rincian Jasa & Part ({searchedOrder.items.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('keluhan')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'keluhan'
                        ? 'bg-berlin-blue text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ListChecks className="h-4 w-4" weight="bold" />
                    <span>Keluhan Awal</span>
                  </button>
                </div>

                {/* Tab 1: Findings Cards */}
                {activeTab === 'temuan' && (
                  <div className="mt-6 flex flex-col gap-4">
                    {searchedOrder.findings.map((f) => {
                      const badge = getUrgencyBadge(f.urgency);
                      const currentDecision = findingsDecisions[f.id] || f.status;

                      return (
                        <div
                          key={f.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start"
                        >
                          {/* Image preview */}
                          <div
                            onClick={() => setSelectedPhoto(f.imageUrl)}
                            className="relative h-32 w-full sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200 cursor-pointer group border border-slate-300"
                          >
                            <img
                              src={f.imageUrl}
                              alt={f.partName}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="h-6 w-6" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                              <span className="text-sm font-extrabold text-berlin-blue-dark">
                                Estimasi: {formatRupiah(f.estimatedCost)}
                              </span>
                            </div>

                            <h4 className="mt-1 text-sm font-bold text-slate-900">{f.partName}</h4>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{f.description}</p>

                            {/* Approval action */}
                            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-slate-500">Status Persetujuan:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDecision(f.id, 'approved')}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                    currentDecision === 'approved'
                                      ? 'bg-emerald-600 text-white'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" weight="bold" />
                                  <span>Setujui (ACC)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDecision(f.id, 'rejected')}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                    currentDecision === 'rejected'
                                      ? 'bg-berlin-red text-white'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <X className="h-3.5 w-3.5" weight="bold" />
                                  <span>Tunda</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Itemized Estimate */}
                {activeTab === 'biaya' && (
                  <div className="mt-6 flex flex-col divide-y divide-slate-100">
                    {searchedOrder.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <span
                            className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              item.type === 'part'
                                ? 'bg-berlin-blue/10 text-berlin-blue'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.type === 'part' ? 'PART' : 'JASA'}
                          </span>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          {formatRupiah(item.price * item.qty)}
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 flex items-center justify-between text-sm font-extrabold text-berlin-blue-dark">
                      <span>Total Estimasi</span>
                      <span className="text-base">{formatRupiah(totalCost)}</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Complaints */}
                {activeTab === 'keluhan' && (
                  <div className="mt-6 space-y-3">
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Keluhan yang dicatat Service Advisor saat mobil masuk:
                    </div>
                    {searchedOrder.complaints.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-700"
                      >
                        <WarningCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="flex flex-col gap-6">
              {/* Technical Team Card */}
              <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Penanggung Jawab Servis
                </h4>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue font-bold">
                      SA
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{searchedOrder.serviceAdvisor}</div>
                      <div className="text-slate-500">Service Advisor</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue font-bold">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{searchedOrder.leadMechanic}</div>
                      <div className="text-slate-500">Mekanik Spesialis</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{searchedOrder.estimatedCompletion}</div>
                      <div className="text-slate-500">Estimasi Siap</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <a
                    href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                      `Halo Berlin 188 Garage, saya ingin menanyakan progres servis mobil ${searchedOrder.carBrand} ${searchedOrder.carModel} (${searchedOrder.plateNumber}) dengan Service Advisor ${searchedOrder.serviceAdvisor}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <WhatsappLogo className="h-4 w-4" weight="fill" />
                    <span>Hubungi SA ({searchedOrder.serviceAdvisor.split(' ')[0]})</span>
                  </a>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-3xl bg-berlin-blue-dark text-white p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cloud-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" weight="bold" />
                  <span>Jaminan Berlin 188</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">Transparansi 100%</h4>
                <p className="mt-1 text-xs text-cloud-white/80 leading-relaxed">
                  Tidak ada pengerjaan atau penggantian suku cadang tanpa persetujuan awal dari Anda. Semua bekas part lama
                  disimpan dan diserahkan kembali kepada Anda.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Search Result */
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-berlin-blue/10 text-berlin-blue mb-4">
              <Car className="h-8 w-8" weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Kendaraan Belum Ditemukan di Sistem</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Nomor plat &quot;{query}&quot; belum terdaftar dalam antrean aktif hari ini. Jika mobil Anda baru saja check-in
              di bengkel, hubungi Service Advisor untuk konfirmasi nomor work order (WO).
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

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={selectedPhoto} alt="Foto Inspeksi" className="max-h-[80vh] w-auto rounded-xl object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}
