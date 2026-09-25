import type { CSSProperties } from 'react';
import { BRAND_MARKS } from '../../data/brandMarks';

/**
 * The makes the workshop services (same list as the site's JSON-LD
 * knowsAbout). Logos only, one quiet monochrome; the footer carries the
 * independent-workshop disclaimer.
 *
 * Marks are sized by area, not by height: every logo gets the same visual
 * weight whether it is a roundel or the wide Audi rings.
 */
function markSize(viewBox: string): CSSProperties {
  const [, , width, height] = viewBox.split(' ').map(Number);
  const root = Math.sqrt(width / height);
  return {
    width: `calc(var(--mark) * ${root.toFixed(3)})`,
    height: `calc(var(--mark) / ${root.toFixed(3)})`,
  };
}

export function BrandStrip() {
  return (
    <section aria-labelledby="merek-title" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* A solid card like the service cards: the strip scrolls across the
            car on phones and has to stay legible wherever it stops. */}
        <div data-reveal className="w-full rounded-card bg-white p-5 shadow-float sm:p-7 lg:max-w-[26rem]">
          <h2 id="merek-title" className="text-sm font-semibold text-jet-black/70">
            Merek yang kami servis
          </h2>
          <ul
            role="list"
            className="mt-5 flex items-center justify-between gap-3 text-jet-black/65 [--mark:1.75rem] sm:[--mark:2.125rem]"
          >
            {BRAND_MARKS.map((mark) => (
              <li key={mark.id} className="flex">
                <svg
                  viewBox={mark.viewBox}
                  role="img"
                  aria-label={mark.title}
                  fill="currentColor"
                  className="shrink-0"
                  style={markSize(mark.viewBox)}
                >
                  <path d={mark.path} />
                </svg>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
