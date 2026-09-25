import { useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  Check,
  Cube,
  Eye,
  EyeSlash,
  FilmStrip,
  MapPin,
  Sparkle,
  WhatsappLogo,
  Wrench,
  X,
} from '@phosphor-icons/react';
import { DarkStudioScene, HOTSPOTS, type ViewMode } from './scene/DarkStudioScene';
import { GarageVideoScroll } from './GarageVideoScroll';
import { GaragePromptModal } from './GaragePromptModal';
import type { PaintId } from '../data/cars';
import { bookingLink, serviceInquiryLink } from '../lib/whatsapp';
import { SITE } from '../data/site';

export type GarageMode = '3d' | 'video';

const COLOR_SWATCHES: { id: PaintId; name: string; hex: string }[] = [
  { id: 'berlin-blue', name: 'Berlin Blue Metallic', hex: '#0065C0' },
  { id: 'black', name: 'Midnight Jet Black', hex: '#111215' },
  { id: 'graphite', name: 'Graphite Grey Metallic', hex: '#4d5157' },
  { id: 'white', name: 'Alpine Cloud White', hex: '#eceef2' },
  { id: 'red', name: 'Berlin Guards Red', hex: '#dc1420' },
];

const VIEW_PRESETS: { id: ViewMode; label: string; iconLabel: string }[] = [
  { id: 'overview', label: '3/4 Depan', iconLabel: '01' },
  { id: 'side', label: 'Profil Samping', iconLabel: '02' },
  { id: 'rear', label: 'Buritan 3/4', iconLabel: '03' },
  { id: 'lift', label: 'Lift & Kolong', iconLabel: '04' },
  { id: 'exploded', label: 'Exploded View', iconLabel: '05' },
];

export function GaragePage() {
  const [garageMode, setGarageMode] = useState<GarageMode>('3d');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // 3D Configurator States
  const [activePaint, setActivePaint] = useState<PaintId>('berlin-blue');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);

  const activeHotspotInfo = HOTSPOTS.find((h) => h.id === selectedHotspot);

  return (
    <div
      className={`relative bg-[#08080a] text-cloud-white font-sans ${
        garageMode === '3d' ? 'h-screen w-screen overflow-hidden select-none' : 'min-h-screen w-full'
      }`}
      onPointerDown={() => setInteracted(true)}
    >
      {/* Top Header Bar (Fixed across both 3D & Video modes) */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-3 sm:px-8 bg-gradient-to-b from-[#08080a]/95 via-[#08080a]/70 to-transparent pointer-events-none backdrop-blur-xs">
        {/* Left: Brand Logo & Mode Switcher */}
        <div className="flex items-center gap-3 sm:gap-6 pointer-events-auto">
          <a href="/" className="flex items-center" aria-label="Kembali ke beranda">
            <img src="/brand/logo-dark.png" alt="Berlin 188 Garage" width={160} height={40} className="h-7 sm:h-9 w-auto" />
          </a>

          {/* Mode Switcher: 3D Studio vs Video Animasi */}
          <div className="flex items-center rounded-xl bg-jet-black/85 p-1 border border-cloud-white/15 backdrop-blur-xl shadow-product">
            <button
              type="button"
              onClick={() => setGarageMode('3d')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                garageMode === '3d'
                  ? 'bg-cloud-white text-jet-black shadow-product scale-[1.02]'
                  : 'text-cloud-white/70 hover:text-white hover:bg-cloud-white/10'
              }`}
              aria-pressed={garageMode === '3d'}
            >
              <Cube size={15} weight="duotone" />
              <span>3D Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setGarageMode('video')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                garageMode === 'video'
                  ? 'bg-berlin-red text-white shadow-product scale-[1.02]'
                  : 'text-cloud-white/70 hover:text-white hover:bg-cloud-white/10'
              }`}
              aria-pressed={garageMode === 'video'}
            >
              <FilmStrip size={15} weight="duotone" />
              <span>Animasi Scroll Video</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Links & Gemini Prompt Trigger */}
        <nav aria-label="Navigasi cepat" className="pointer-events-auto flex items-center gap-1 sm:gap-2">
          {/* Gemini Video Prompt Button */}
          <button
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-berlin-red/15 px-3 py-1.5 border border-berlin-red/40 text-xs font-semibold text-berlin-red hover:bg-berlin-red hover:text-white transition-all cursor-pointer shadow-float"
            title="Buka kumpulan prompt video Gemini / Veo"
          >
            <Sparkle size={15} weight="fill" />
            <span className="hidden sm:inline">Prompt Gemini</span>
            <span className="sm:hidden">Prompt</span>
          </button>

          <a
            href="/"
            className="hidden md:inline-block rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-cloud-white/80 transition-colors hover:text-cloud-white hover:bg-cloud-white/10"
          >
            Beranda
          </a>
          <a
            href="/#layanan"
            className="hidden md:inline-block rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-cloud-white/80 transition-colors hover:text-cloud-white hover:bg-cloud-white/10"
          >
            Daftar Layanan
          </a>
          <a
            href={SITE.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-cloud-white/80 transition-colors hover:text-cloud-white hover:bg-cloud-white/10"
          >
            <MapPin size={16} weight="duotone" />
            <span>Lokasi</span>
          </a>
        </nav>
      </header>

      {/* ===================== MODE 1: INTERACTIVE 3D STUDIO ===================== */}
      {garageMode === '3d' && (
        <>
          {/* 3D Real-time Dark Studio Canvas (Locked 60 FPS, No heavy textures) */}
          <div className="absolute inset-0 z-0">
            <DarkStudioScene
              activePaint={activePaint}
              viewMode={viewMode}
              autoRotate={autoRotate}
              showHotspots={showHotspots}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </div>

          {/* Top Right Quick Studio Controls */}
          <div className="fixed top-20 right-4 sm:right-8 z-30 flex flex-col gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                autoRotate
                  ? 'bg-berlin-red border-white text-white shadow-float'
                  : 'bg-jet-black/70 border-cloud-white/15 text-cloud-white/80 hover:text-white hover:border-cloud-white/30'
              }`}
              title={autoRotate ? 'Hentikan putaran otomatis' : 'Putar 360° otomatis'}
              aria-label="Toggle auto-rotate"
            >
              <ArrowsClockwise size={20} className={autoRotate ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                showHotspots
                  ? 'bg-jet-black/70 border-cloud-white/15 text-cloud-white/80 hover:text-white hover:border-cloud-white/30'
                  : 'bg-jet-black/40 border-cloud-white/10 text-cloud-white/40 hover:text-white/70'
              }`}
              title={showHotspots ? 'Sembunyikan titik inspeksi' : 'Tampilkan titik inspeksi'}
              aria-label="Toggle titik inspeksi"
            >
              {showHotspots ? <Eye size={20} /> : <EyeSlash size={20} />}
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('overview');
                setSelectedHotspot(null);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cloud-white/15 bg-jet-black/70 backdrop-blur-xl text-cloud-white/80 transition-all duration-200 hover:text-white hover:border-cloud-white/30 cursor-pointer"
              title="Reset posisi kamera"
              aria-label="Reset kamera"
            >
              <ArrowCounterClockwise size={20} />
            </button>
          </div>

          {/* Subtle First-Time User Drag Hint */}
          {!interacted && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700">
              <div className="flex items-center gap-2 rounded-full bg-jet-black/70 px-4 py-1.5 backdrop-blur-md border border-cloud-white/10 text-xs text-cloud-white/80 shadow-product">
                <span className="h-2 w-2 rounded-full bg-berlin-red" />
                <span>Drag mouse / sentuh layar untuk putar 360° bebas</span>
              </div>
            </div>
          )}

          {/* Floating Hotspot Detail Drawer (Appears only when a hotspot is tapped) */}
          {activeHotspotInfo && (
            <aside
              role="region"
              aria-label="Detail divisi teknis"
              className="fixed top-20 left-4 sm:left-8 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-jet-black/90 p-5 sm:p-6 backdrop-blur-2xl border border-cloud-white/20 shadow-2xl transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="spec-label text-[0.65rem] text-berlin-blue-light">{activeHotspotInfo.category}</p>
                  <h2 className="brand-headline mt-1 text-xl sm:text-2xl text-cloud-white">{activeHotspotInfo.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-cloud-white/10 text-cloud-white/70 hover:bg-cloud-white/20 hover:text-cloud-white cursor-pointer transition-colors"
                  aria-label="Tutup detail"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-cloud-white/80">{activeHotspotInfo.summary}</p>

              <div className="mt-4 pt-4 border-t border-cloud-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-cloud-white/70">
                  <Wrench size={16} className="text-berlin-red shrink-0" />
                  <span>Diagnosa komputer OEM & special tools</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-cloud-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-berlin-red shrink-0 ml-1 mr-0.5" />
                  <span>Transparansi estimasi biaya & garansi servis</span>
                </div>
              </div>

              <a
                href={serviceInquiryLink(activeHotspotInfo.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-berlin-blue px-4 text-xs sm:text-sm font-semibold text-white shadow-product transition-colors hover:bg-berlin-blue-dark cursor-pointer"
              >
                <WhatsappLogo size={20} weight="duotone" />
                <span>Konsultasi Divisi Ini via WhatsApp</span>
              </a>
            </aside>
          )}

          {/* Lamborghini-Style Bottom Floating Control Dock */}
          <footer className="fixed bottom-3 sm:bottom-6 inset-x-0 z-30 flex justify-center px-3 sm:px-6 pointer-events-none">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 rounded-2xl bg-jet-black/85 p-2 sm:p-2.5 backdrop-blur-2xl border border-cloud-white/15 shadow-2xl pointer-events-auto max-w-full overflow-hidden">
              {/* View Angle Presets (horizontally scrollable on mobile) */}
              <div className="flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar py-0.5 px-0.5">
                {VIEW_PRESETS.map((preset) => {
                  const isActive = viewMode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-view={preset.id}
                      onClick={() => {
                        setViewMode(preset.id);
                        setSelectedHotspot(null);
                      }}
                      className={`inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-cloud-white text-jet-black shadow-product scale-[1.02]'
                          : 'text-cloud-white/75 hover:text-cloud-white hover:bg-cloud-white/10'
                      }`}
                      aria-pressed={isActive}
                    >
                      <span className={`text-[0.65rem] tabular-nums font-mono ${isActive ? 'text-berlin-blue' : 'text-cloud-white/50'}`}>
                        {preset.iconLabel}
                      </span>
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-row on mobile: Swatches & CTA */}
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2.5 sm:gap-3 pt-1.5 sm:pt-0 border-t border-cloud-white/10 sm:border-t-0">
                {/* Vertical Divider (Desktop) */}
                <div className="hidden sm:block h-6 w-px bg-cloud-white/15" aria-hidden="true" />

                {/* Paint Finish Selector Swatches */}
                <div className="flex items-center gap-2 px-1">
                  <span className="hidden xl:inline text-[0.65rem] spec-label text-cloud-white/50 mr-1">Warna</span>
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = activePaint === swatch.id;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => setActivePaint(swatch.id)}
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 cursor-pointer ${
                          isSelected ? 'scale-125 ring-2 ring-cloud-white ring-offset-2 ring-offset-jet-black' : 'hover:scale-110 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                        aria-label={`Pilih warna ${swatch.name}`}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            weight="bold"
                            className={swatch.id === 'white' ? 'text-jet-black' : 'text-white'}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden sm:block h-6 w-px bg-cloud-white/15" aria-hidden="true" />

                {/* Booking CTA Button */}
                <a
                  href={bookingLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 sm:min-h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-berlin-red px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-float transition-all duration-200 hover:bg-berlin-red-light active:scale-95 cursor-pointer whitespace-nowrap flex-1 sm:flex-none"
                  aria-label="Booking via WhatsApp"
                >
                  <WhatsappLogo size={18} weight="duotone" />
                  <span>Booking Servis</span>
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ===================== MODE 2: CINEMATIC VIDEO SCROLL ===================== */}
      {garageMode === 'video' && (
        <GarageVideoScroll onOpenPromptModal={() => setIsPromptModalOpen(true)} />
      )}

      {/* Reusable Gemini Video Prompt Modal */}
      <GaragePromptModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} />
    </div>
  );
}
