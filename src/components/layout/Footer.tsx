import { MapPin, WhatsappLogo } from '@phosphor-icons/react';
import { SITE } from '../../data/site';
import { bookingLink } from '../../lib/whatsapp';
import { ButtonLink } from '../ui/ButtonLink';

export function Footer() {
  return (
    <footer id="lokasi" className="bg-jet-black text-cloud-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <img
              src="/brand/logo-dark.png"
              alt="Berlin 188 Garage"
              width={354}
              height={168}
              loading="lazy"
              decoding="async"
              className="h-auto w-48"
            />
            <p className="mt-6 flex max-w-xs gap-2 text-cloud-white/80">
              <MapPin weight="duotone" size={22} className="mt-0.5 shrink-0 text-cloud-white" aria-hidden="true" />
              <span>{SITE.address}</span>
            </p>
          </div>

          <div>
            <h2 className="spec-label text-cloud-white/70">Jam buka</h2>
            <dl className="mt-4 space-y-2">
              {SITE.hours.map((row) => (
                <div key={row.label} className="flex justify-between gap-6 border-b border-cloud-white/10 pb-2">
                  <dt className="text-cloud-white/80">{row.label}</dt>
                  <dd className="font-semibold tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-cloud-white/80">Towing 24 jam via WhatsApp.</p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h2 className="spec-label text-cloud-white/70">Hubungi</h2>
            <ButtonLink href={bookingLink()} external className="mt-1">
              <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
              Booking via WhatsApp
            </ButtonLink>
            <ButtonLink href={SITE.mapsDirectionsUrl} external variant="on-dark">
              <MapPin weight="duotone" size={20} aria-hidden="true" />
              Buka Google Maps
            </ButtonLink>
          </div>
        </div>

        <p className="mt-14 max-w-3xl border-t border-cloud-white/10 pt-6 text-sm leading-relaxed text-cloud-white/70">{SITE.disclaimer}</p>
        <p className="mt-4 text-sm text-cloud-white/70">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
