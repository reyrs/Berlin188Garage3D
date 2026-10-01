import { useEffect, useState } from 'react';
import {
  Wrench,
  Tag,
  ShieldCheck,
  Package,
  Cube,
  MapPin,
  WhatsappLogo,
  PhoneCall,
  MagnifyingGlass,
  List,
  X,
  CaretRight,
} from '@phosphor-icons/react';
import { ScrollTrigger } from '../../lib/gsap';
import { SITE } from '../../data/site';
import { bookingLink } from '../../lib/whatsapp';

export interface NavLink {
  href: string;
  label: string;
}

interface HeaderProps {
  links: NavLink[];
  logoHref?: string;
  current?: string;
}

const LINK_ICONS: Record<string, React.ReactNode> = {
  '#layanan': <Wrench className="h-5 w-5" weight="duotone" />,
  '#promo': <Tag className="h-5 w-5" weight="duotone" />,
  '#cek-servis': <ShieldCheck className="h-5 w-5 text-emerald-400" weight="duotone" />,
  '#marketplace': <Package className="h-5 w-5" weight="duotone" />,
  '/garasi/': <Cube className="h-5 w-5 text-berlin-gold" weight="duotone" />,
  '#lokasi': <MapPin className="h-5 w-5" weight="duotone" />,
};

export function Header({ links, logoHref = '#top', current }: HeaderProps) {
  const [overTop, setOverTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const update = (self: ScrollTrigger) => setOverTop(self.progress < 1);
    const trigger = ScrollTrigger.create({
      trigger: '#top',
      start: 'top top',
      end: 'bottom top+=64',
      onUpdate: update,
      onRefresh: update,
    });
    update(trigger);
    return () => trigger.kill();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-cloud-white transition-[background-color,box-shadow] duration-300 ease-out-quint ${
          overTop && !mobileMenuOpen
            ? 'bg-berlin-blue-dark/0'
            : 'bg-berlin-blue-dark/95 backdrop-blur-md shadow-[0_1px_0_rgb(244_246_255/0.12)]'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <a
            href={logoHref}
            onClick={() => setMobileMenuOpen(false)}
            className="-m-2 flex min-h-11 shrink-0 items-center rounded-lg p-2 focus-visible:outline-white"
            aria-label="Berlin 188 Garage, kembali ke atas"
          >
            <img
              src="/brand/logo-dark.png"
              alt="Berlin 188 Garage"
              width={354}
              height={168}
              className="h-8 w-auto sm:h-9 md:h-10"
              decoding="async"
            />
          </a>

          {/* Desktop Navigation (>= md / 768px) */}
          <nav aria-label="Navigasi utama" className="hidden md:flex md:items-center md:gap-1">
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const isCurrent = link.href === current;
                const isCekServis = link.href === '#cek-servis';

                if (isCekServis) {
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-[0.875rem] font-bold text-white ring-1 ring-white/20 transition-all duration-200 hover:bg-berlin-blue hover:ring-berlin-blue shadow-xs"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        <span>{link.label}</span>
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`inline-flex min-h-10 items-center rounded-lg px-2.5 text-[0.9375rem] font-medium transition-colors duration-200 hover:text-cloud-white sm:px-3 ${
                        isCurrent ? 'text-cloud-white font-semibold' : 'text-cloud-white/80'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Right Controls (< md) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick Cek Servis Shortcut Pill */}
            <a
              href="#cek-servis"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 active:bg-berlin-blue transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>Cek Servis</span>
            </a>

            {/* Tactile Hamburger Morph Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 active:scale-95 transition-transform"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" weight="bold" />
              ) : (
                <List className="h-6 w-6 text-white" weight="bold" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer (< md) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex flex-col bg-berlin-blue-dark/98 backdrop-blur-2xl text-cloud-white pt-20 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden overflow-y-auto"
        >
          {/* Vehicle Telemetry Quick Banner in Drawer */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-gold">
                <ShieldCheck className="h-4 w-4" weight="bold" />
                <span>Status & Antrean Hari Ini</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                Live Workshop
              </span>
            </div>
            <p className="mt-1.5 text-xs text-cloud-white/80 leading-relaxed">
              Pantau progres pengerjaan mobil Anda, foto temuan inspeksi teknisi, dan konfirmasi biaya secara online.
            </p>
            <a
              href="#cek-servis"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 flex items-center justify-between rounded-xl bg-berlin-blue px-3.5 py-2.5 text-xs font-bold text-white shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MagnifyingGlass className="h-4 w-4" />
                <span>Buka Cek Servis Mobil</span>
              </div>
              <CaretRight className="h-4 w-4" />
            </a>
          </div>

          {/* Nav Links Stack */}
          <nav aria-label="Menu navigasi mobile" className="flex-1">
            <ul className="divide-y divide-white/10">
              {links.map((link) => {
                const isCurrent = link.href === current;
                const icon = LINK_ICONS[link.href] || <Wrench className="h-5 w-5" />;

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-3.5 px-2 text-base font-semibold transition-colors active:bg-white/5 rounded-xl ${
                        isCurrent ? 'text-berlin-gold font-bold' : 'text-cloud-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-cloud-white">
                          {icon}
                        </span>
                        <span>{link.label}</span>
                      </div>
                      <CaretRight className="h-4 w-4 text-white/40" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Quick Contact & Action Buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 px-4 text-sm font-bold text-white shadow-md active:bg-emerald-700"
            >
              <WhatsappLogo className="h-5 w-5" weight="fill" />
              <span>Booking Servis via WhatsApp</span>
            </a>

            <div className="flex items-center justify-between text-xs text-cloud-white/60 px-1 pt-1">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-berlin-gold" />
                <span>Towing & Darurat:</span>
              </div>
              <a
                href={`tel:${SITE.phoneDisplay.replace(/[^0-9]/g, '')}`}
                className="font-mono font-bold text-white underline underline-offset-2"
              >
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
