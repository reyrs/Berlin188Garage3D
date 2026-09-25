import { useEffect, useRef, useState } from 'react';
import { ArrowDown, WhatsappLogo } from '@phosphor-icons/react';
import { ANATOMY, type Hotspot } from '../../data/anatomy';
import { VIDEOS } from '../../data/media';
import { bookingLink } from '../../lib/whatsapp';
import { gsap, useGSAP } from '../../lib/gsap';
import { ScrubController } from '../../lib/scrub';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ButtonLink } from '../ui/ButtonLink';
import { CurveAccent } from '../ui/CurveAccent';
import { ScrubVideo } from '../media/ScrubVideo';

const COUNT = ANATOMY.length;
/** Timeline position (units) where each scene starts to come in. */
const AT = [0, 1.2, 2.5, 3.6, 4.7, 6];
/** Timeline length in units, including a short hold on the last scene. */
const UNITS = 7;
/** Scroll distance per timeline unit. */
const UNIT_SVH = 70;
/** Crossfade length between scenes. */
const FADE = 0.2;
const activeAt = (t: number) => AT.reduce((n, at, i) => (t >= at + FADE / 2 ? i : n), 0);
const pad = (n: number) => String(n).padStart(2, '0');
const WIDTHS = [960, 1600, 2400];
const SIZES = '(min-width: 64rem) 76vw, 112vw';

/**
 * "Anatomi servis": a pinned scroll story. A BMW goes dark, comes apart,
 * gets read down to its modules, and comes back together. Video scenes play
 * frame by frame with the scroll; stills push in and pin their hotspots.
 */
export function Anatomy() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [scrubbers] = useState(() => ANATOMY.map(() => new ScrubController()));

  // Start downloading clips once the section is about a screen away.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const scenes = q('[data-scene]');
      const captions = q('[data-anatomi-caption]');

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const t = self.progress * UNITS;
            setActive(activeAt(t));
            ANATOMY.forEach((scene, i) => {
              if (scene.kind !== 'video') return;
              const start = AT[i] + (i ? FADE / 2 : 0);
              const end = AT[i + 1] ?? UNITS;
              scrubbers[i].setProgress((t - start) / (end - start));
            });
          },
        },
      });

      gsap.set([...scenes.slice(1), ...captions.slice(1), q('.anatomi-cta')], { autoAlpha: 0 });

      if (reducedMotion) {
        // Same story as instant cuts; nothing moves by itself.
        for (let i = 1; i < COUNT; i++) {
          const at = AT[i] + FADE / 2;
          tl.set([scenes[i - 1], captions[i - 1]], { autoAlpha: 0 }, at).set([scenes[i], captions[i]], { autoAlpha: 1 }, at);
        }
        tl.set(q('.anatomi-cta'), { autoAlpha: 1 }, AT[COUNT - 1] + FADE / 2);
      } else {
        for (let i = 1; i < COUNT; i++) {
          const at = AT[i];
          tl.to(captions[i - 1], { autoAlpha: 0, y: -28, duration: FADE, ease: 'power1.in' }, at - FADE / 2)
            .to(scenes[i - 1], { autoAlpha: 0, duration: FADE }, at)
            .fromTo(scenes[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE }, at)
            .fromTo(captions[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, at + FADE);
        }
        // Stills drift in slowly, then pin their hotspots one by one.
        ANATOMY.forEach((scene, i) => {
          if (scene.kind !== 'still') return;
          const end = AT[i + 1] ?? UNITS;
          tl.fromTo(scenes[i].querySelector('[data-still]'), { scale: 1.08 }, { scale: 1, duration: end - AT[i], ease: 'power1.out' }, AT[i]);
          const dots = scenes[i].querySelectorAll('[data-hotspot]');
          if (dots.length) {
            tl.fromTo(dots, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.12, stagger: 0.1, ease: 'back.out(2)' }, AT[i] + 0.3);
          }
        });
        // The diagnostic scan sweeps across the x-ray.
        const xray = ANATOMY.findIndex((s) => s.id === 'xray');
        tl.fromTo(q('.anatomi-scan'), { xPercent: -100 }, { xPercent: 560, duration: 0.8, ease: 'power1.inOut' }, AT[xray] + 0.1);
        tl.fromTo(q('.anatomi-cta'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, AT[COUNT - 1] + 0.3);
      }
      // Pad to the full length so timeline units match the section height.
      tl.set({}, {}, UNITS);
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      id="anatomi"
      aria-labelledby="anatomi-title"
      className="relative bg-jet-black text-cloud-white"
      style={{ height: `calc(100svh + ${UNITS * UNIT_SVH}svh)` }}
    >
      {/* The whole story for screen readers; the visual captions below repeat it one step at a time. */}
      <div className="sr-only">
        <h2 id="anatomi-title">Anatomi servis: {ANATOMY[0].title} {ANATOMY[0].emphasis}</h2>
        <ol>
          {ANATOMY.slice(1).map((scene) => (
            <li key={scene.id}>
              {scene.eyebrow}. {scene.title} {scene.emphasis}. {scene.body}
            </li>
          ))}
        </ol>
      </div>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Stage: one 16:9 box whose edges fade into the page. Illustrations, decorative. */}
        <div aria-hidden="true" className="anatomi-stage">
          {ANATOMY.map((scene, i) => (
            <div key={scene.id} data-scene className="absolute inset-0">
              {scene.kind === 'video' ? (
                <VideoScene slot={scene.slot} scrubber={scrubbers[i]} load={near && !reducedMotion && Math.abs(i - active) <= 1} />
              ) : (
                <div data-still className="absolute inset-0 will-change-transform">
                  <StillPicture id={scene.image} />
                  {scene.id === 'xray' && (
                    <div className="anatomi-scan absolute inset-y-0 left-0 w-[18%] mix-blend-screen motion-reduce:hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-berlin-blue/0 via-berlin-blue-light/30 to-berlin-blue/0" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-cloud-white/70" />
                    </div>
                  )}
                  {scene.hotspots.map((spot) => (
                    <HotspotPin key={spot.label} spot={spot} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scrims keep the copy legible where it sits over the stage. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-jet-black to-jet-black/0" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-linear-to-t from-jet-black via-jet-black/80 to-jet-black/0 lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[42%] bg-linear-to-r from-jet-black via-jet-black/70 to-jet-black/0 lg:block" />
        </div>

        <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Captions share one grid cell; the timeline shows one at a time. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 bottom-40 grid items-end sm:inset-x-6 lg:inset-x-8 lg:top-1/2 lg:bottom-auto lg:max-w-md lg:-translate-y-1/2 lg:items-center"
          >
            {ANATOMY.map((scene) => (
              <div key={scene.id} data-anatomi-caption className="col-start-1 row-start-1">
                <p className="spec-label text-cloud-white/70">{scene.eyebrow}</p>
                <p
                  className={`brand-headline mt-4 leading-[0.95] ${
                    scene.emphasis ? 'text-[clamp(2.2rem,4.6vw,4.25rem)]' : 'text-[clamp(1.85rem,3.4vw,3rem)]'
                  }`}
                >
                  <span className="block">{scene.title}</span>
                  {scene.emphasis && <span className="brand-emphasis mt-[0.14em] whitespace-nowrap">{scene.emphasis}</span>}
                </p>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-cloud-white/80 sm:text-lg">{scene.body}</p>
                {scene.kind === 'still' && scene.hotspots.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2 lg:hidden">
                    {scene.hotspots.map((spot) => (
                      <li key={spot.label} className="spec-label rounded-lg px-2.5 py-1.5 text-[0.6875rem] text-cloud-white/85 ring-1 ring-cloud-white/20">
                        {spot.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Final call to action: outside the aria-hidden captions so it stays reachable. */}
          <div className="anatomi-cta absolute inset-x-4 bottom-20 flex flex-wrap items-center gap-3 sm:inset-x-6 lg:inset-x-8 lg:top-[calc(50%_+_9rem)] lg:bottom-auto">
            <ButtonLink href={bookingLink()} external>
              <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
              Booking via WhatsApp
            </ButtonLink>
            {/* Phones: the services follow right below, one button is enough there. */}
            <ButtonLink href="#layanan" variant="on-dark" className="max-sm:hidden">
              Lihat layanan
              <ArrowDown weight="duotone" size={20} aria-hidden="true" />
            </ButtonLink>
          </div>

          {/* Rail: counter, the illustration note, and the step names with the active one lit. */}
          <div aria-hidden="true" className="absolute inset-x-4 bottom-6 flex items-end justify-between gap-6 sm:inset-x-6 lg:inset-x-8 lg:bottom-8">
            <p className="spec-label whitespace-nowrap tabular-nums text-cloud-white/80">
              <span className="text-cloud-white">{pad(active + 1)}</span> / {pad(COUNT)}
              <span className="ml-3 text-cloud-white/45">Ilustrasi</span>
            </p>
            <ol className="flex items-end gap-2.5 sm:gap-5">
              {ANATOMY.map((scene, i) => (
                <li key={scene.id} className="flex flex-col items-center gap-2">
                  <span
                    className={`spec-label hidden text-[0.6875rem] transition-opacity duration-300 md:block ${
                      i === active ? 'text-cloud-white opacity-100' : 'text-cloud-white opacity-40'
                    }`}
                  >
                    {scene.rail}
                  </span>
                  <span
                    className={`block size-1.5 rounded-full bg-cloud-white transition-opacity duration-300 md:hidden ${i === active ? 'opacity-100' : 'opacity-35'}`}
                  />
                  <CurveAccent className={`h-1.5 w-4 transition-opacity sm:w-6 duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A clip's first frame, with the clip over it once it has decoded. */
function VideoScene({ slot, scrubber, load }: { slot: string; scrubber: ScrubController; load: boolean }) {
  const clip = VIDEOS[slot]?.wide;
  if (!clip) return null;
  return (
    <>
      <img src={clip.poster} width={clip.width} height={clip.height} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <ScrubVideo slot={VIDEOS[slot]} scrubber={scrubber} load={load} className="absolute inset-0 h-full w-full object-cover" />
    </>
  );
}

function StillPicture({ id }: { id: string }) {
  const set = (ext: string) => WIDTHS.map((w) => `/images/anatomi/${id}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={SIZES} />
      <img
        src={`/images/anatomi/${id}-1600.webp`}
        srcSet={set('webp')}
        sizes={SIZES}
        width={2400}
        height={1350}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

/** A red-ring pin on the still; the label shows from lg up (phones list them under the caption). */
function HotspotPin({ spot }: { spot: Hotspot }) {
  return (
    <div data-hotspot className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
      <span className="absolute -top-2 -left-2 block size-4 rounded-full border-2 border-berlin-red bg-jet-black/60">
        <span className="absolute inset-[3px] rounded-full bg-cloud-white" />
        <span className="absolute -inset-1 rounded-full border border-berlin-red/60 motion-safe:animate-ping" />
      </span>
      <span
        className={`spec-label absolute top-0 hidden -translate-y-1/2 rounded-lg bg-jet-black/85 px-2.5 py-1.5 text-[0.6875rem] whitespace-nowrap text-cloud-white ring-1 ring-cloud-white/15 lg:block ${
          spot.flip ? 'right-4' : 'left-4'
        }`}
      >
        {spot.label}
      </span>
    </div>
  );
}
