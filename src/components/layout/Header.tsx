import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../../lib/gsap';

export interface NavLink {
  href: string;
  label: string;
}

interface HeaderProps {
  links: NavLink[];
  /** Where the logo goes: the top of this page, or the home page from /garasi. */
  logoHref?: string;
  /** href of the link for the page being viewed (marked aria-current). */
  current?: string;
}

/**
 * Dark header. Transparent over the page's first section (#top, which carries
 * its own top scrim so the logo stays legible); a solid Jet Black bar after it.
 * Booking lives in the page itself (hero, services, footer), not up here.
 */
export function Header({ links, logoHref = '#top', current }: HeaderProps) {
  const [overTop, setOverTop] = useState(true);

  useEffect(() => {
    // Progress, not onToggle: a jump from the very top straight past the
    // first section (anchor link, restored scroll) never counts as "active".
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-cloud-white transition-[background-color,box-shadow] duration-300 ease-out-quint ${
        overTop ? 'bg-jet-black/0' : 'bg-jet-black shadow-[0_1px_0_rgb(244_246_255/0.08)]'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href={logoHref} className="-m-2 flex min-h-11 shrink-0 items-center rounded-lg p-2" aria-label="Berlin 188 Garage, kembali ke atas">
          {/* Transparent cut of the dark logo (gold B, white wordmark). */}
          <img src="/brand/logo-dark.png" alt="" width={354} height={168} className="h-9 w-auto sm:h-10" decoding="async" />
        </a>

        <nav aria-label="Navigasi utama">
          <ul className="flex items-center sm:gap-1">
            {links.map((link) => {
              const isCurrent = link.href === current;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-lg px-2.5 text-[0.9375rem] font-medium transition-colors duration-200 hover:text-cloud-white sm:px-3 ${
                      isCurrent ? 'text-cloud-white' : 'text-cloud-white/80'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
