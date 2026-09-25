import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, Sparkle, WhatsappLogo, Wrench } from '@phosphor-icons/react';
import { ScrollTrigger } from '../lib/gsap';
import { ScrubController } from '../lib/scrub';
import { serviceInquiryLink } from '../lib/whatsapp';

interface StoryChapter {
  id: string;
  step: string;
  badge: string;
  title: string;
  description: string;
  specs: string[];
  serviceName: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'entrance',
    step: '01 / 05',
    badge: 'WORKSHOP ARRIVAL',
    title: 'Pintu Garasi & Service Bay Supercar',
    description:
      'Rolling door industri terbuka menyambut supercar Anda ke dalam service bay steril Berlin 188 dengan pencahayaan LED linear dan lantai epoxy presisi.',
    specs: ['Dedicated Supercar Bay', 'Clean Room Environment', 'Digital Job Order'],
    serviceName: 'Layanan Service Bay Berlin 188',
  },
  {
    id: 'diagnostics',
    step: '02 / 05',
    badge: 'OEM COMPUTER SCANNING',
    title: 'Diagnosa Scanner Komputer & Modul ECU',
    description:
      'Troli diagnosa multibrand terhubung langsung ke modul onboard, membaca ratusan sensor elektrikal, kalibrasi ECU, dan deteksi error dini.',
    specs: ['BMW ISTA & Mercedes Xentry', 'VAG ODIS & Porsche PIWIS', 'Online SCN Coding'],
    serviceName: 'Diagnosa Komputer OEM & ECU',
  },
  {
    id: 'lift',
    step: '03 / 05',
    badge: 'UNDER-CHASSIS INSPECTION',
    title: 'Two-Post Hydraulic Lift & Kaki-kaki',
    description:
      'Dua tiang hidrolik Berlin Blue mengangkat kendaraan ke posisi inspeksi optimal. Pengecekan menyeluruh pada arm suspensi, bushing, rem, dan sistem exhaust.',
    specs: ['Hydraulic 4-Ton Capacity', 'Underbody Laser Check', 'Shaking Machine Test'],
    serviceName: 'Inspeksi Kaki-kaki & Suspensi',
  },
  {
    id: 'overhaul',
    step: '04 / 05',
    badge: 'MECHANICAL PRECISION',
    title: 'Ruang Mesin, Turbo & Transmisi',
    description:
      'Penanganan mekanikal berat oleh teknisi bersertifikat. Pembongkaran presisi, kalibrasi injector piezo, flushing oli transmisi, dan penggantian sparepart OEM.',
    specs: ['Special Service Tools OEM', 'Torque Spec Calibration', 'Garansi Pengerjaan'],
    serviceName: 'Overhaul Mesin & Transmisi',
  },
  {
    id: 'finishing',
    step: '05 / 05',
    badge: 'SHOWROOM QUALITY CONTROL',
    title: 'Finishing Nano Ceramic & Final Test',
    description:
      'Poles multi-tahap dan pelapisan nano ceramic coating mengembalikan kilau bodi mobil seperti keluar dari showroom, siap diuji jalan dan diserahkan.',
    specs: ['Multi-Stage Machine Polish', '9H Nano Ceramic Coating', 'Road Test & Quality Approval'],
    serviceName: 'Salon Bodi & Coating',
  },
];

interface GarageVideoScrollProps {
  onOpenPromptModal: () => void;
}

export function GarageVideoScroll({ onOpenPromptModal }: GarageVideoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubber = useMemo(() => new ScrubController(), []);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Setup GSAP ScrollTrigger to scrub the video across chapters
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);
        scrubber.setProgress(p);

        // Determine active chapter (0 to 4)
        const chapterIdx = Math.min(Math.floor(p * CHAPTERS.length), CHAPTERS.length - 1);
        setActiveChapterIndex(chapterIdx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [scrubber]);

  // Attach video element to scrub controller
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    scrubber.attach(video);

    const handleLoadedData = () => {
      setVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = () => {
      setVideoLoaded(false);
      setVideoError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      scrubber.detach();
    };
  }, [scrubber]);

  const activeChapter = CHAPTERS[activeChapterIndex];

  // Jump to specific chapter by scrolling
  const scrollToChapter = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const totalScroll = container.scrollHeight - window.innerHeight;
    const targetY = (idx / (CHAPTERS.length - 1)) * totalScroll;
    window.scrollTo({ top: container.offsetTop + targetY, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative bg-[#08080a] text-cloud-white font-sans">
      {/* 5 Screen-Heights Scroll Track */}
      <div className="h-[500vh] relative">
        {/* Sticky Viewport Stage */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Fullscreen Video Background */}
          <div className="absolute inset-0 z-0 bg-[#08080a] overflow-hidden">
            {/* Real video if available */}
            <video
              ref={videoRef}
              src="/videos/garage/garage-cinematic.mp4"
              playsInline
              muted
              preload="auto"
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Fallback Animated Workshop Canvas when video is pending AI generation */}
            {(!videoLoaded || videoError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0b0e] via-[#08080a] to-[#040405] p-6 select-none">
                {/* Visual Garage Lighting Atmosphere */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none transition-transform duration-1000 ease-out"
                  style={{
                    transform: `translateY(${scrollProgress * 40 - 20}px) scale(${1 + scrollProgress * 0.15})`,
                  }}
                >
                  {/* Overhead LED Strip Simulation */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cloud-white/80 to-transparent blur-sm" />
                  <div className="absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-berlin-blue-light/60 to-transparent blur-xs" />

                  {/* Red circular turntable floor reflection */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full border border-berlin-red/40 blur-xs bg-berlin-red/5" />
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[420px] h-[160px] rounded-full border border-cloud-white/20 blur-xs" />
                </div>

                {/* Center Callout: Prompt Generator Action */}
                <div
                  className={`relative z-10 max-w-lg text-center space-y-4 rounded-3xl bg-jet-black/85 p-6 sm:p-8 backdrop-blur-2xl border border-cloud-white/15 shadow-2xl transition-all duration-500 ${
                    activeChapterIndex > 0 ? 'opacity-30 hover:opacity-100 scale-95 pointer-events-auto' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-berlin-red/20 border border-berlin-red/40 text-berlin-red animate-pulse">
                    <Sparkle size={26} weight="fill" />
                  </div>

                  <div>
                    <span className="text-[10px] spec-label tracking-widest text-berlin-blue-light uppercase">
                      Animasi Scroll Garasi
                    </span>
                    <h3 className="brand-headline mt-1 text-xl sm:text-2xl text-white">
                      Siapkan Video dengan Gemini
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-cloud-white/75 leading-relaxed">
                    Animasi scrolling ini dirancang memutar video garasi secara presisi frame-by-frame sesuai putaran mouse / jari Anda. Dapatkan prompt siap pakai untuk dimasukkan ke Google Gemini / Veo sekarang.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenPromptModal}
                      className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-berlin-red px-5 text-xs sm:text-sm font-semibold text-white shadow-float transition-all duration-200 hover:bg-berlin-red-light active:scale-95 cursor-pointer"
                    >
                      <Sparkle size={18} weight="fill" />
                      <span>Buka Prompt Gemini / Veo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToChapter(1)}
                      className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cloud-white/10 px-4 text-xs font-semibold text-cloud-white hover:bg-cloud-white/20 transition-colors cursor-pointer"
                    >
                      <span>Coba Scroll Story</span>
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-[#08080a]/80 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#08080a]/30 to-[#08080a]/90 pointer-events-none" />
          </div>

          {/* Left Floating Story Card (Changes per chapter) */}
          <div className="absolute left-4 sm:left-10 bottom-20 sm:bottom-16 z-20 max-w-sm sm:max-w-md pointer-events-auto">
            <div className="rounded-3xl bg-[#0c0d12]/90 p-5 sm:p-6 backdrop-blur-2xl border border-cloud-white/15 shadow-2xl transition-all duration-500 transform">
              {/* Step & Badge */}
              <div className="flex items-center justify-between gap-3 border-b border-cloud-white/10 pb-3 mb-3">
                <span className="text-[11px] font-mono tabular-nums text-berlin-blue-light font-bold">
                  {activeChapter.step}
                </span>
                <span className="rounded-full bg-berlin-red/15 px-2.5 py-0.5 text-[10px] font-semibold text-berlin-red border border-berlin-red/30">
                  {activeChapter.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="brand-headline text-lg sm:text-2xl text-white tracking-tight">
                {activeChapter.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-cloud-white/75 leading-relaxed">
                {activeChapter.description}
              </p>

              {/* Key Specs Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {activeChapter.specs.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 rounded-lg bg-cloud-white/5 px-2.5 py-1 text-[11px] text-cloud-white/80 border border-cloud-white/10"
                  >
                    <Wrench size={12} className="text-berlin-red" />
                    <span>{spec}</span>
                  </span>
                ))}
              </div>

              {/* Booking CTA Button for this chapter */}
              <a
                href={serviceInquiryLink(activeChapter.serviceName)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-berlin-red px-4 text-xs sm:text-sm font-semibold text-white shadow-float transition-all hover:bg-berlin-red-light cursor-pointer"
              >
                <WhatsappLogo size={18} weight="duotone" />
                <span>Konsultasikan Bagian Ini</span>
              </a>
            </div>
          </div>

          {/* Right Floating Chapter Timeline Indicator */}
          <div className="hidden sm:flex fixed right-8 top-1/2 -translate-y-1/2 z-20 flex-col items-end gap-3 pointer-events-auto">
            {CHAPTERS.map((chap, idx) => {
              const isCurrent = activeChapterIndex === idx;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => scrollToChapter(idx)}
                  className="group flex items-center gap-3 cursor-pointer py-1"
                  aria-label={`Lompat ke bab ${chap.title}`}
                >
                  <span
                    className={`text-[11px] font-medium transition-all ${
                      isCurrent
                        ? 'text-white opacity-100 translate-x-0'
                        : 'text-cloud-white/50 opacity-0 group-hover:opacity-100 group-hover:text-white translate-x-2'
                    }`}
                  >
                    {chap.title}
                  </span>
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'h-3.5 w-3.5 bg-berlin-red ring-4 ring-berlin-red/30'
                        : 'h-2 w-2 bg-cloud-white/30 group-hover:bg-cloud-white/70'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Global Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-cloud-white/10 z-30">
            <div
              className="h-full bg-berlin-red transition-all duration-100 ease-out"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          {/* Prompt Floating Trigger Pill (Top Right) */}
          <div className="fixed top-20 right-4 sm:right-8 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenPromptModal}
              className="flex items-center gap-2 rounded-xl bg-jet-black/85 px-3.5 py-2 backdrop-blur-xl border border-berlin-red/50 text-white shadow-float transition-all hover:bg-berlin-red cursor-pointer text-xs font-semibold"
            >
              <Sparkle size={16} weight="fill" className="text-berlin-red group-hover:text-white" />
              <span>Prompt Gemini / Veo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
