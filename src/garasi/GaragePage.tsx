import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  Drop,
  Engine,
  GearSix,
  type Icon,
  MapPin,
  Package,
  PaintBrush,
  Snowflake,
  Vibrate,
  WarningCircle,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react';
import { IDLE_FRAME, KELUHAN, type Keluhan } from '../data/keluhan';
import { SERVICES } from '../data/services';
import { SITE } from '../data/site';
import { bookingLink } from '../lib/whatsapp';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ButtonLink } from '../components/ui/ButtonLink';
import { DepthStage, type StageFocus } from './DepthStage';

const ICONS: Record<string, Icon> = {
  ac: Snowflake,
  getar: Vibrate,
  'check-engine': WarningCircle,
  brebet: Engine,
  transmisi: GearSix,
  oli: Drop,
  bodi: PaintBrush,
};

const NAV = [
  { href: '/', label: 'Beranda' },
  { href: '/#layanan', label: 'Layanan' },
  { href: '/#cek-servis', label: 'Cek Servis' },
  { href: '/marketplace/', label: 'Suku Cadang' },
];

/** Desktop layout, px: the complaint list on the left, the detail panel on the right. */
const LIST_W = 360;
const PANEL_W = 400;
const HEADER_H = 64;

const pad = (n: number) => String(n).padStart(2, '0');
const fromHash = () => KELUHAN.find((k) => `#${k.id}` === window.location.hash)?.id ?? null;

function useWindowSize() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('resize', onChange);
      return () => window.removeEventListener('resize', onChange);
    },
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => '1440x900',
  );
}

/**
 * /garasi: "Mobil Anda kenapa?" The visitor picks a complaint; the stage
 * (the M4 of the home page story, in depth) moves to the parts involved and
 * numbers them, and the panel says what usually causes it, what the workshop
 * does, and links the services, the parts and WhatsApp with the complaint
 * already written. The pick is kept in the URL hash, so it can be shared.
 */
export function GaragePage() {
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 64rem)');
  const finePointer = useMediaQuery('(pointer: fine)');
  const windowSize = useWindowSize();
  const [selectedId, setSelectedId] = useState<string | null>(() => (typeof window === 'undefined' ? null : fromHash()));
  const [ready, setReady] = useState(false);
  const selected = KELUHAN.find((k) => k.id === selectedId) ?? null;

  const choose = (id: string | null) => {
    setSelectedId(id);
    window.history.replaceState(null, '', id ? `#${id}` : window.location.pathname + window.location.search);
  };

  useEffect(() => {
    const onHash = () => setSelectedId(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedId(null);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  // Where the focus lands: between the list and the panel on desktop, the
  // middle of the stage on phones (the stage is its own box there).
  const { target, bounds } = useMemo(() => {
    const [w, h] = windowSize.split('x').map(Number);
    if (!desktop) return { target: { x: 0.5, y: 0.52 }, bounds: { left: 8, right: w - 8 } };
    const right = selected ? PANEL_W + 48 : 32;
    return {
      target: { x: (LIST_W + (w - LIST_W - right) / 2) / w, y: (HEADER_H + (h - HEADER_H) / 2) / h },
      bounds: { left: LIST_W + 8, right: w - right },
    };
  }, [desktop, windowSize, selected]);

  // Before a pick: the car in the workshop, framed in the free area.
  const focus: StageFocus = selected ? selected.focus : { x: 62, y: 58, zoom: 1 };

  return (
    <div className="relative min-h-[100svh] bg-stage text-cloud-white">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-linear-to-b from-stage/95 via-stage/60 to-transparent px-4 sm:px-8">
        <a href="/" className="flex items-center" aria-label="Berlin 188 Garage, ke beranda">
          <img src="/brand/logo-dark.png" alt="" width={160} height={40} className="h-8 w-auto sm:h-9" />
        </a>
        <nav aria-label="Navigasi" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-cloud-white/80 transition-colors hover:bg-cloud-white/10 hover:text-cloud-white sm:inline-flex"
            >
              {link.label}
            </a>
          ))}
          <a
            href={SITE.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-cloud-white/80 transition-colors hover:bg-cloud-white/10 hover:text-cloud-white"
          >
            <MapPin size={16} weight="duotone" aria-hidden="true" />
            Lokasi
          </a>
        </nav>
      </header>

      {/* Stage: full screen behind the copy on desktop, a sticky box under the header on phones. */}
      <div className="sticky top-16 z-20 h-[42svh] min-h-[260px] overflow-hidden lg:fixed lg:inset-0 lg:z-0 lg:h-auto">
        <DepthStage
          frame={selected?.frame ?? IDLE_FRAME}
          focus={focus}
          target={target}
          parts={selected?.parts ?? NO_PARTS}
          bounds={bounds}
          reducedMotion={reducedMotion}
          sway={finePointer && desktop}
          onReady={() => setReady(true)}
        />
        {/* Scrims keep the copy legible over the photo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-stage to-transparent lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[46%] bg-linear-to-r from-stage via-stage/75 to-transparent lg:block" />
          <div
            className={`absolute inset-y-0 right-0 hidden w-[38%] bg-linear-to-l from-stage via-stage/70 to-transparent transition-opacity duration-500 lg:block ${
              selected ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      <main className="relative z-10 lg:pointer-events-none lg:fixed lg:inset-0">
        {/* Intro and the complaints. */}
        <section
          aria-labelledby="garasi-title"
          className="px-4 pt-6 pb-4 sm:px-8 lg:pointer-events-auto lg:absolute lg:top-0 lg:bottom-0 lg:left-0 lg:flex lg:w-[360px] lg:flex-col lg:justify-center lg:pt-16 lg:pb-8"
        >
          <p className="spec-label text-cloud-white/70">Garasi 3D</p>
          <h1 id="garasi-title" className="brand-headline mt-3 text-[clamp(1.9rem,2.9vw,2.75rem)] leading-[0.95]">
            <span className="block">Mobil Anda</span>
            <span className="brand-emphasis mt-[0.14em] whitespace-nowrap">kenapa?</span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-cloud-white/80">
            Pilih keluhannya. Kami tunjukkan bagian yang biasanya bermasalah dan apa yang kami cek.
          </p>

          <ul
            aria-label="Keluhan"
            className="-mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-7 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
          >
            {KELUHAN.map((k, i) => {
              const IconFor = ICONS[k.id] ?? Engine;
              const active = k.id === selectedId;
              return (
                <li key={k.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-controls="garasi-detail"
                    onClick={(event) => {
                      choose(active ? null : k.id);
                      event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
                    }}
                    className={`group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2 text-left text-[0.9375rem] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berlin-blue-light ${
                      active
                        ? 'bg-berlin-blue text-white'
                        : 'bg-cloud-white/5 text-cloud-white/85 ring-1 ring-cloud-white/10 hover:bg-cloud-white/10 hover:text-cloud-white lg:bg-transparent lg:ring-0'
                    }`}
                  >
                    <span className={`hidden w-5 shrink-0 text-xs tabular-nums lg:inline ${active ? 'text-white/70' : 'text-cloud-white/45'}`}>{pad(i + 1)}</span>
                    <IconFor size={18} weight="duotone" aria-hidden="true" className="shrink-0" />
                    <span className="whitespace-nowrap lg:flex-1 lg:text-[0.875rem]">{k.label}</span>
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className={`hidden shrink-0 transition-[translate,opacity] duration-200 lg:block ${
                        active ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Detail of the picked complaint. */}
        <section
          id="garasi-detail"
          aria-live="polite"
          className={`px-4 pb-28 sm:px-8 lg:absolute lg:top-20 lg:right-8 lg:bottom-8 lg:flex lg:w-[400px] lg:flex-col lg:justify-center lg:px-0 lg:pb-0 lg:transition-[opacity,translate] lg:duration-500 lg:ease-out-quint ${
            selected ? 'lg:pointer-events-auto lg:translate-x-0 lg:opacity-100' : 'lg:pointer-events-none lg:translate-x-6 lg:opacity-0'
          }`}
        >
          {selected ? (
            <Detail keluhan={selected} index={KELUHAN.indexOf(selected)} onClose={() => choose(null)} />
          ) : (
            <p className="text-sm text-cloud-white/60 lg:hidden">Ketuk salah satu keluhan di atas.</p>
          )}
        </section>
      </main>

      {!ready && <span className="sr-only">Memuat garasi</span>}
    </div>
  );
}

const NO_PARTS: Keluhan['parts'] = [];

function Detail({ keluhan, index, onClose }: { keluhan: Keluhan; index: number; onClose: () => void }) {
  const services = keluhan.services
    .map((id) => SERVICES.find((service) => service.id === id))
    .filter((service): service is (typeof SERVICES)[number] => Boolean(service));
  const message = `Halo Berlin 188 Garage, saya mau cek mobil saya. Keluhannya: ${keluhan.title}.`;

  return (
    <article
      aria-labelledby="garasi-detail-title"
      className="flex max-h-full flex-col overflow-hidden rounded-2xl bg-stage/90 ring-1 ring-cloud-white/12 lg:shadow-float"
    >
      <div className="flex items-start justify-between gap-4 border-b border-cloud-white/10 p-5 sm:p-6">
        <div>
          <p className="spec-label text-cloud-white/60">
            Keluhan {pad(index + 1)} / {pad(KELUHAN.length)}
          </p>
          <h2 id="garasi-detail-title" className="mt-2 text-xl font-bold leading-snug text-cloud-white sm:text-2xl">
            {keluhan.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup keluhan"
          className="-mt-1 -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-cloud-white/70 transition-colors hover:bg-cloud-white/10 hover:text-cloud-white"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
        {/* Same numbers as the markers on the car. */}
        <ol className="flex flex-wrap gap-2" aria-label="Bagian yang dicek">
          {keluhan.parts.map((part, i) => (
            <li key={part.label} className="inline-flex items-center gap-2 rounded-lg bg-cloud-white/5 px-2.5 py-1.5 text-sm text-cloud-white/90">
              <span className="grid size-5 place-items-center rounded-full border border-cloud-white/70 text-[0.625rem] font-semibold tabular-nums">
                {i + 1}
              </span>
              {part.label}
            </li>
          ))}
        </ol>

        <div>
          <h3 className="spec-label text-cloud-white/60">Penyebab yang umum</h3>
          <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-cloud-white/85">
            {keluhan.causes.map((cause) => (
              <li key={cause} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[0.75em] h-px w-3 shrink-0 bg-cloud-white/40" />
                {cause}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="spec-label text-cloud-white/60">Yang kami lakukan</h3>
          <ol className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-cloud-white/85">
            {keluhan.steps.map((step, i) => (
              <li key={step} className="flex gap-2.5">
                <span className="w-4 shrink-0 tabular-nums text-cloud-white/50">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-cloud-white/55">Penyebab pastinya baru bisa dipastikan setelah mobil dicek di bengkel.</p>
        </div>

        <div>
          <h3 className="spec-label text-cloud-white/60">Layanan terkait</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {services.map((service) => (
              <li key={service.id}>
                <a
                  href={`/#layanan-${service.id}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-cloud-white ring-1 ring-cloud-white/20 transition-colors hover:bg-cloud-white/10 hover:ring-cloud-white/40"
                >
                  {service.name}
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-cloud-white/10 p-5 sm:p-6">
        <ButtonLink href={bookingLink(message)} external size="sm" className="flex-1">
          <WhatsappLogo weight="duotone" size={20} aria-hidden="true" />
          Tanya via WhatsApp
        </ButtonLink>
        <ButtonLink href={`/marketplace/?kategori=${encodeURIComponent(keluhan.partsCategory)}`} variant="on-dark" size="sm" className="flex-1">
          <Package weight="duotone" size={20} aria-hidden="true" />
          Suku cadang
        </ButtonLink>
      </div>
    </article>
  );
}
