import { useState } from 'react';
import {
  Tag,
  Check,
  WhatsappLogo,
  Eye,
  X,
  ShieldCheck,
  Wrench,
  Car,
  Sparkle,
} from '@phosphor-icons/react';
import {
  MAIN_PROMOS,
  TUNE_UP_PACKAGES,
  type MainPromoItem,
  type TuneUpPackage,
} from '../../data/promo';
import { SITE } from '../../data/site';

type PromoTab = 'all' | 'main' | 'tuneup';

export function PromoSection() {
  const [activeTab, setActiveTab] = useState<PromoTab>('all');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const getWhatsAppUrl = (messageText: string) => {
    return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(messageText)}`;
  };

  const getPackageWhatsAppUrl = (pkg: TuneUpPackage) => {
    const text = [
      'Halo Berlin 188 Garage,',
      '',
      `Saya ingin booking promo ${pkg.name} (${pkg.price}) untuk mobil saya.`,
      'Sekaligus klaim promo Beli 5 Liter Oli FUCHS Gratis 1 Liter.',
      'Mohon informasi slot jadwal bengkel yang tersedia. Terima kasih.',
    ].join('\n');

    return getWhatsAppUrl(text);
  };

  const showMainPromos = activeTab === 'all' || activeTab === 'main';
  const showTuneUpPromos = activeTab === 'all' || activeTab === 'tuneup';

  return (
    <section id="promo" className="relative bg-cloud-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-blue">
              <Tag className="h-4 w-4" weight="bold" />
              <span>Program Resmi & Materi Flyer Bengkel</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Promo Servis & Flyer Resmi
            </h2>
            <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed">
              Semua materi promo resmi Berlin 188 Garage ditampilkan langsung dari flyer bengkel kami:
              promo oli mesin FUCHS Jerman (Beli 5L Gratis 1L), jasa tune up mulai 750 ribu, serta 4 pilihan paket tune up bergaransi.
            </p>
          </div>

          <a
            href={getWhatsAppUrl(
              'Halo Berlin 188 Garage, saya ingin konsultasi promo servis dan booking jadwal tune up mobil Eropa saya.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-berlin-blue px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-berlin-blue-dark transition-colors shrink-0"
          >
            <WhatsappLogo className="h-5 w-5" weight="fill" />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-berlin-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            Semua Flyer Promo (7)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'main'
                ? 'bg-berlin-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            Promo Utama & Ketentuan (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tuneup')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tuneup'
                ? 'bg-berlin-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            4 Paket Tune Up (4)
          </button>
        </div>

        {/* SECTION 1: PROMO UTAMA & SYARAT KETENTUAN (3 FLYER) */}
        {showMainPromos && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-berlin-blue">
                  Flyer Promo Utama & Ketentuan Klaim
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Promo Oli Mesin FUCHS & S&K Klaim
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Klik gambar poster untuk melihat resolusi penuh
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {MAIN_PROMOS.map((promo: MainPromoItem) => (
                <div
                  key={promo.id}
                  className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Visual Flyer Image (Never Hidden) */}
                    <div
                      onClick={() => setLightboxImage({ src: promo.frameImage, title: promo.title })}
                      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 cursor-pointer mb-5 shadow-xs"
                    >
                      <img
                        src={promo.frameImage}
                        alt={promo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                          <Eye className="h-4 w-4" />
                          <span>Perbesar Flyer</span>
                        </span>
                      </div>
                    </div>

                    {/* Badge & Title */}
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-berlin-blue/10 px-2.5 py-1 text-[11px] font-bold text-berlin-blue">
                        {promo.badge}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                      {promo.title}
                    </h4>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {promo.description}
                    </p>

                    {/* Highlights List */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      {promo.highlights.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="h-4 w-4 text-berlin-blue shrink-0 mt-0.5" weight="bold" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA WhatsApp Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={getWhatsAppUrl(promo.ctaMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-berlin-blue py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-berlin-blue-dark transition-colors"
                    >
                      <WhatsappLogo className="h-4 w-4" weight="fill" />
                      <span>{promo.ctaLabel}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: 4 PAKET TUNE UP (4 FLYER) */}
        {showTuneUpPromos && (
          <div className="mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-berlin-blue">
                  Flyer Paket Tune Up Terstandarisasi
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Katalog 4 Paket Tune Up Berlin 188
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Semua paket termasuk gratis scan diagnosa & gratis cuci mobil
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
              {TUNE_UP_PACKAGES.map((pkg: TuneUpPackage) => (
                <div
                  key={pkg.id}
                  className={`flex flex-col justify-between rounded-3xl bg-white p-5 border-2 transition-all duration-200 ${
                    pkg.recommended
                      ? 'border-berlin-red/50 shadow-md ring-1 ring-berlin-red/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Visual Flyer Image (Never Hidden) */}
                    <div
                      onClick={() => setLightboxImage({ src: pkg.frameImage, title: pkg.name })}
                      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 cursor-pointer mb-4 shadow-xs"
                    >
                      <img
                        src={pkg.frameImage}
                        alt={pkg.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-xs">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Perbesar</span>
                        </span>
                      </div>

                      {pkg.recommended && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-berlin-red px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                            <Sparkle className="h-3 w-3" weight="fill" />
                            <span>Rekomendasi</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tier Badge & Price */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${pkg.badgeBg} ${pkg.badgeText}`}>
                        {pkg.badge}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {pkg.price}
                      </span>
                    </div>

                    <h4 className="mt-2 text-lg font-extrabold text-slate-900">
                      {pkg.name}
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[2.5rem]">
                      {pkg.tagline}
                    </p>

                    {/* Services Checklist */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Cakupan Pengerjaan:
                      </div>
                      {pkg.services.map((svc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="h-3.5 w-3.5 text-berlin-blue shrink-0" weight="bold" />
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <a
                      href={getPackageWhatsAppUrl(pkg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                        pkg.recommended
                          ? 'bg-berlin-red text-white shadow-xs hover:bg-berlin-red-dark'
                          : 'bg-berlin-blue text-white shadow-xs hover:bg-berlin-blue-dark'
                      }`}
                    >
                      <WhatsappLogo className="h-4 w-4" weight="fill" />
                      <span>Booking {pkg.name.split(' ')[0]}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Commitment Footer Banner */}
        <div className="mt-16 rounded-3xl bg-berlin-blue-dark text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-red-light">
              <ShieldCheck className="h-4 w-4" weight="bold" />
              <span>Standar Pengerjaan Berlin 188 Garage</span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight">
              Selalu Transparan, Dilengkapi Bukti Foto & Diagnosa Pabrikan
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-cloud-white/80 leading-relaxed">
              Setiap pengerjaan tune up dan servis mobil Eropa di Berlin 188 Garage didukung scanner pabrikan (ODIS untuk VW/Audi, Xentry untuk Mercedes-Benz, ISTA untuk BMW) tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-cloud-white/70">
              <Car className="h-4 w-4 text-berlin-blue-light" />
              <span>Gratis Cuci Mobil</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cloud-white/70">
              <Wrench className="h-4 w-4 text-berlin-blue-light" />
              <span>Diagnosa Komputer OBD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal: Inspect Full High-Resolution Flyer */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-2 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header in modal */}
            <div className="w-full flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
              <span className="text-xs font-bold truncate pr-4 text-cloud-white">
                {lightboxImage.title}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
                aria-label="Tutup flyer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Flyer Image */}
            <div className="p-2 overflow-auto flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[72vh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>

            {/* Booking action inside modal */}
            <div className="w-full p-2 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-white/60">
                Aset flyer resmi Berlin 188 Garage
              </span>
              <a
                href={getWhatsAppUrl(`Halo Berlin 188 Garage, saya melihat poster ${lightboxImage.title} dan ingin konsultasi servis.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-berlin-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-berlin-blue-dark transition-colors shadow-xs"
              >
                <WhatsappLogo className="h-4 w-4" weight="fill" />
                <span>Booking via WA</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
