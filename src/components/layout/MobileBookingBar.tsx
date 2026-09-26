import { useEffect, useState } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react';
import { bookingLink } from '../../lib/whatsapp';
import { ScrollTrigger } from '../../lib/gsap';
import { ButtonLink } from '../ui/ButtonLink';

/**
 * Phones only: a booking button pinned to the bottom of the screen between
 * the end of the hero story (#top) and the footer (#lokasi), which have
 * booking buttons of their own.
 */
export function MobileBookingBar() {
  const [pastHero, setPastHero] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    // Progress, not onToggle, so a jump (anchor link, restored scroll) still counts.
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
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[translate,opacity,visibility] duration-300 ease-out-quint lg:hidden ${
        show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-full opacity-0'
      }`}
    >
      <ButtonLink href={bookingLink()} external className="w-full shadow-float">
        <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
        Booking via WhatsApp
      </ButtonLink>
    </div>
  );
}
