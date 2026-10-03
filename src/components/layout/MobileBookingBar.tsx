import { useEffect, useState } from 'react';
import { MagnifyingGlass, WhatsappLogo } from '@phosphor-icons/react';
import { bookingLink } from '../../lib/whatsapp';
import { ScrollTrigger } from '../../lib/gsap';

/**
 * Phones only: a luxury floating bottom dock pinned to the bottom of the screen between
 * the end of the hero story (#top) and the footer (#lokasi).
 * Provides dual quick action: Instant WhatsApp Booking + Live Car Service Tracker (Cek Servis).
 */
export function MobileBookingBar() {
  const [pastHero, setPastHero] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const hero = ScrollTrigger.create({
      trigger: '#top',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setPastHero(self.progress >= 1),
      onRefresh: (self) => setPastHero(self.progress >= 1),
    });
    const footer = ScrollTrigger.create({
      trigger: '#lokasi',
      start: 'top bottom',
      onUpdate: (self) => setAtFooter(self.progress > 0),
      onRefresh: (self) => setAtFooter(self.progress > 0),
    });
    return () => {
      hero.kill();
      footer.kill();
    };
  }, []);

  const show = pastHero && !atFooter;

  return (
    <aside
      aria-label="Aksi Cepat Mobile"
      className={`fixed inset-x-0 bottom-0 z-40 transition-[translate,opacity,visibility] duration-300 ease-out-quint lg:hidden ${
        show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="mx-auto max-w-md px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-2xl bg-berlin-blue-dark/90 p-1.5 backdrop-blur-xl border border-white/15 shadow-[0_12px_32px_rgba(0,45,90,0.45)]">
          {/* Quick Cek Servis jump */}
          <a
            href="#cek-servis"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3.5 text-xs font-bold text-white transition-colors active:bg-white/20 shrink-0"
          >
            <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden="true" />
            <span>Cek Servis</span>
          </a>

          {/* Primary WhatsApp Booking Action */}
          <a
            href={bookingLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-berlin-blue px-3 text-xs sm:text-sm font-bold text-white shadow-product active:bg-berlin-blue-dark transition-all"
          >
            <WhatsappLogo weight="duotone" size={20} aria-hidden="true" />
            <span className="truncate">Booking Servis via WA</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
