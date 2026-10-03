import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowDown, Pause, Play, WhatsappLogo } from '@phosphor-icons/react';
import { ANATOMY, type Hotspot } from '../../data/anatomy';
import { HERO } from '../../data/content';
import { VIDEOS } from '../../data/media';
import { SHOWROOM } from '../../data/showroom';
import { bookingLink } from '../../lib/whatsapp';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { useIntroOpen } from '../../lib/intro';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { BrandMarkIcon } from '../ui/BrandMarkIcon';
import { ButtonLink } from '../ui/ButtonLink';

const COUNT = ANATOMY.length;
const index = (id: string) => ANATOMY.findIndex((scene) => scene.id === id);

/*
 * The story's schedule, in seconds. AT: where each scene starts to come in.
 * PLAY: where a scene's clip starts; it plays through and is held on its last
 * frame before the next scene comes in, so every handover is between two
 * matching frames.
 */
const AT = [0, 7.0, 12.8, 17.2, 21.6, 27.0];
const PLAY: Record<string, number> = { buka: 1.8, bongkar: 8.6, rakit: 17.4 };
/** The handover scene fades out here and the covered car fades back in: the loop point. */
const LOOP_OUT = 34.0;
const TOTAL = 35.6;
/** The lit workshop dissolving into the studio is the lights going out. */
const LIGHTS_OUT = 1.4;
/**
 * Scenes that are not the same frame as the one before (another camera angle,
 * or right after one) are not dissolved: two different cars would ghost
 * through each other. The previous scene dims to the stage colour and this
 * one is wiped in, left to right, behind a moving line of light: a blue
 * diagnostic scan, or the white sweep of fresh polish.
 */
const REVEAL: Record<string, 'scan' | 'polish'> = { xray: 'scan', serah: 'polish' };
const REVEAL_LENGTH = 1.6;
/** Start anyway if the clips have not loaded by then (the stills stand in). */
const LOAD_TIMEOUT = 5000;

const pad = (n: number) => String(n).padStart(2, '0');
const WIDTHS = [960, 1600, 2400];
const SIZES = '(min-width: 64rem) 76vw, 120vw';

/**
 * The home page hero ("Anatomi servis"). The hero copy, booking and the makes
 * stay beside the car while the story plays by itself: the cover comes off,
 * the car comes apart and is labelled, goes back together, is read down to
 * its modules and handed back, then the loop starts over. It pauses off
 * screen, in a background tab and on the rail's pause button; the rail also
 * jumps to a step. Reduced motion shows the first frame only.
 */
export function Anatomy() {
  const rootRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const introOpen = useIntroOpen();
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(true);
  const [clipsReady, setClipsReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const readyClips = useRef(new Set<number>());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          loader.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    loader.observe(root);
    visibility.observe(root);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      loader.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Give the clips a few seconds to load before the story starts.
  useEffect(() => {
    if (!introOpen || clipsReady) return;
    const timer = window.setTimeout(() => setClipsReady(true), LOAD_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [introOpen, clipsReady]);

  const onClipReady = (i: number) => {
    readyClips.current.add(i);
    const needed = ANATOMY.filter((scene) => scene.kind === 'video').length;
    if (readyClips.current.size >= needed) setClipsReady(true);
  };

  // Entrance, once the garage door starts lifting (or on load when there is
  // no intro): the lights flicker on, the car settles, the headline rises.
  // SplitText measures glyphs, so it waits for Poppins.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !introOpen) return;
    const items = root.querySelectorAll<HTMLElement>('[data-hero-reveal]');
    if (reducedMotion) {
      gsap.set(items, { opacity: 1, animation: 'none' });
      gsap.set(root.querySelector('.hero-dim'), { opacity: 0, animation: 'none' });
      return;
    }
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Masks get "hs-word-mask" (padded in index.css so caps and italics are not clipped).
        const split = SplitText.create('.hero-split', { type: 'words,chars', mask: 'words', wordsClass: 'hs-word' });
        gsap.set(items, { opacity: 1, animation: 'none' });
        gsap.set('.hero-dim', { animation: 'none' });
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          // Fluorescent tubes catching: two quick flickers, then full light.
          .set('.hero-dim', { opacity: 0.7 }, 0)
          .to(
            '.hero-dim',
            {
              keyframes: [
                { opacity: 0.3, duration: 0.06, ease: 'none' },
                { opacity: 0.62, duration: 0.07, ease: 'none' },
                { opacity: 0.18, duration: 0.06, ease: 'none' },
                { opacity: 0.45, duration: 0.08, ease: 'none' },
                { opacity: 0, duration: 0.9, ease: 'power2.out' },
              ],
            },
            0,
          )
          .from('[data-hero-media]', { scale: 1.08, duration: 2.4, ease: 'power3.out' }, 0)
          .from('.hero-eyebrow', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.15)
          .from(split.chars, { yPercent: 118, duration: 1.05, stagger: 0.022 }, 0.2)
          .fromTo(
            '.hero-emphasis',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' },
            0.45,
          )
          .from('.hero-sub', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.7)
          .from('.hero-ctas > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.8)
          .from('.hero-marks', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.95)
          .from('.anatomi-rail', { autoAlpha: 0, duration: 0.8 }, 0.9);
      }, root);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [introOpen, reducedMotion]);

  // The story: one looping timeline in seconds. The clips are played by the
  // browser; each update only starts, stops or re-aligns them.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const scenes = q('[data-scene]');
      gsap.set(scenes.slice(1), { autoAlpha: 0 });
      if (reducedMotion) return;

      const syncClips = (t: number, playing: boolean) => {
        ANATOMY.forEach((scene, i) => {
          const video = videos.current[i];
          if (!video || scene.kind !== 'video') return;
          const length = VIDEOS[scene.slot]?.wide?.duration ?? 0;
          const local = t - PLAY[scene.id];
          if (local > 0 && local < length && t < LOOP_OUT) {
            // Re-align only on a real jump (a seek, a stalled download), not on the
            // few milliseconds a playing clip drifts from the timeline.
            if (video.readyState >= 2 && Math.abs(video.currentTime - local) > 0.3) video.currentTime = local;
            if (playing && video.paused) video.play().catch(() => {});
            if (!playing && !video.paused) video.pause();
          } else {
            if (!video.paused) video.pause();
            // Before its turn (and once the loop is heading back to the start): the
            // first frame; after: held on the last frame.
            const target = local <= 0 || t >= LOOP_OUT ? 0 : Math.max(length - 0.05, 0);
            if (video.readyState >= 1 && Math.abs(video.currentTime - target) > 0.04) video.currentTime = target;
          }
        });
      };

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        defaults: { ease: 'none' },
        onUpdate: () => {
          const t = tl.time();
          let current = 0;
          for (let i = COUNT - 1; i >= 0; i--) {
            if (t >= AT[i]) {
              current = i;
              break;
            }
          }
          if (t >= LOOP_OUT) current = 0;
          if (current !== activeRef.current) {
            activeRef.current = current;
            setActive(current);
          }
          // Rail: finished steps full, the current one filling, the rest empty.
          bars.current.forEach((bar, i) => {
            if (!bar) return;
            const end = AT[i + 1] ?? LOOP_OUT;
            const fill = t >= LOOP_OUT ? 0 : i < current ? 1 : i > current ? 0 : (t - AT[i]) / (end - AT[i]);
            bar.style.transform = `scaleX(${Math.min(Math.max(fill, 0), 1)})`;
          });
          syncClips(t, !tl.paused());
        },
      });
      tlRef.current = tl;

      // Cover off: the covered car holds, then the clip plays (PLAY.buka).
      // Lights out: the lit workshop dissolves into the studio, same car, same place.
      const bongkar = index('bongkar');
      tl.fromTo(scenes[bongkar], { autoAlpha: 0 }, { autoAlpha: 1, duration: LIGHTS_OUT, ease: 'power1.inOut' }, AT[bongkar]).set(
        scenes[bongkar - 1],
        { autoAlpha: 0 },
        AT[bongkar] + LIGHTS_OUT,
      );

      // Teardown held as a still, then the reassembly clip, both starting on
      // the frame the previous clip ended on.
      for (const id of ['urai', 'rakit']) {
        const i = index(id);
        tl.fromTo(scenes[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, AT[i]).set(scenes[i - 1], { autoAlpha: 0 }, AT[i] + 0.2);
      }

      for (const id of Object.keys(REVEAL)) {
        const i = index(id);
        const at = AT[i];
        const edge = scenes[i].querySelector('[data-reveal-edge]');
        tl.to(scenes[i - 1], { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, at - 0.1)
          .set(scenes[i], { autoAlpha: 1 }, at + 0.2)
          .fromTo(
            scenes[i].querySelector('[data-still]'),
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: REVEAL_LENGTH, ease: 'power2.inOut' },
            at + 0.2,
          )
          .fromTo(edge, { left: '0%', autoAlpha: 1 }, { left: '100%', duration: REVEAL_LENGTH, ease: 'power2.inOut' }, at + 0.2)
          .to(edge, { autoAlpha: 0, duration: 0.3 }, at + 0.2 + REVEAL_LENGTH - 0.2);
      }

      // Callouts, one after another: the marker lands on the part, the leader
      // line draws out to clear space, the underline runs out and the label
      // slides in along it. They clear away before the scene changes.
      ANATOMY.forEach((scene, i) => {
        if (scene.kind !== 'still' || !scene.hotspots.length) return;
        const el = scenes[i];
        const markers = el.querySelectorAll('[data-callout-marker]');
        const lines = el.querySelectorAll('[data-callout-line]');
        const rules = el.querySelectorAll('[data-callout-rule]');
        const texts = el.querySelectorAll('[data-callout-text]');
        const start = AT[i] + (REVEAL[scene.id] ? 0.2 + REVEAL_LENGTH * 0.75 : 0.4);
        scene.hotspots.forEach((spot, k) => {
          const t = start + k * 0.45;
          tl.fromTo(markers[k], { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)' }, t)
            .fromTo(lines[k], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut' }, t + 0.12)
            .fromTo(rules[k], { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, t + 0.5)
            .fromTo(
              texts[k],
              { autoAlpha: 0, x: spot.side === 'left' ? 12 : -12 },
              { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out' },
              t + 0.55,
            );
        });
        const next = AT[i + 1];
        if (next !== undefined) {
          tl.to(el.querySelector('[data-callouts]'), { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, next - 0.5);
        }
      });

      // Loop: the handover fades to the stage colour, the covered car comes back.
      tl.to(scenes[index('serah')], { autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, LOOP_OUT).fromTo(
        scenes[0],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: 'power1.out', immediateRender: false },
        LOOP_OUT + 0.8,
      );
      tl.set({}, {}, TOTAL);
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  // Play only once the door is open and the clips are in, while the hero is
  // on screen in a visible tab and nobody pressed pause.
  const playing = !reducedMotion && introOpen && clipsReady && inView && pageVisible && !userPaused;
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (playing) {
      tl.play();
    } else {
      tl.pause();
      videos.current.forEach((video) => video?.pause());
    }
  }, [playing, reducedMotion]);

  // Rail: jump to the start of a step (its transition plays from there).
  const goToScene = (i: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    tl.seek(i === 0 ? 0 : AT[i], false);
    if (!playing) videos.current.forEach((video) => video?.pause());
  };

  return (
    <section ref={rootRef} id="top" aria-labelledby="hero-title" className="anatomi relative bg-stage text-cloud-white">
      <div className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        {/* Stage: one 16:9 box whose edges fade into the page. Decorative; the
            callout links are pointer shortcuts (the services are linked below). */}
        <div aria-hidden="true" className="anatomi-stage">
          {ANATOMY.map((scene, i) => (
            <div key={scene.id} data-scene className="absolute inset-0">
              {scene.kind === 'video' ? (
                <div data-hero-media={i === 0 ? '' : undefined} className="absolute inset-0 will-change-transform">
                  <SceneVideo
                    slot={scene.slot}
                    load={near && !reducedMotion}
                    priority={i === 0}
                    videoRef={(video) => {
                      videos.current[i] = video;
                    }}
                    onReady={() => onClipReady(i)}
                  />
                </div>
              ) : (
                <>
                  <div data-still className="absolute inset-0">
                    <StillPicture id={scene.image} />
                    {scene.hotspots.length > 0 && (
                      <div data-callouts className="absolute inset-0">
                        <Callouts spots={scene.hotspots} />
                      </div>
                    )}
                  </div>
                  {REVEAL[scene.id] && <RevealEdge kind={REVEAL[scene.id]} />}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Lights off until the entrance switches them on. */}
        <div aria-hidden="true" className="hero-dim pointer-events-none absolute inset-0 bg-stage" />

        {/* Scrims keep the copy legible where it sits over the stage. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-stage/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-t from-stage via-stage/90 to-transparent lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[42%] bg-linear-to-r from-stage via-stage/70 to-transparent lg:block" />
        </div>

        <div className="pointer-events-none relative mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="anatomi-captions pointer-events-auto absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 lg:max-w-md lg:-translate-y-1/2">
            <p data-hero-reveal className="hero-eyebrow spec-label text-cloud-white/80">
              {HERO.eyebrow}
            </p>
            <h1 id="hero-title" data-hero-reveal className="brand-headline mt-4 text-[clamp(2.3rem,5vw,4.75rem)] leading-[0.95] lg:mt-5">
              <span className="hero-split block">{HERO.headlineLead}</span>
              <span className="hero-emphasis brand-emphasis mt-[0.14em] whitespace-nowrap">
                <span className="hero-split">{HERO.headlineEmphasis}</span>
              </span>
            </h1>
            <p data-hero-reveal className="hero-sub mt-4 max-w-md text-base leading-relaxed text-cloud-white/85 sm:text-lg lg:mt-6">
              {HERO.subtitle}
            </p>
            <div data-hero-reveal className="hero-ctas mt-5 flex flex-wrap items-center gap-3 lg:mt-8">
              <ButtonLink href={bookingLink()} external>
                <WhatsappLogo weight="duotone" size={22} aria-hidden="true" />
                {HERO.primaryCta}
              </ButtonLink>
              <ButtonLink href="#layanan" variant="on-dark">
                {HERO.secondaryCta}
                <ArrowDown weight="duotone" size={20} aria-hidden="true" />
              </ButtonLink>
            </div>
            <a
              data-hero-reveal
              href="#merek"
              aria-label={`Merek yang kami servis: ${SHOWROOM.map((car) => car.brand).join(', ')}`}
              className="hero-marks group mt-6 block w-fit lg:mt-10"
            >
              <span className="hero-marks-label spec-label block text-cloud-white/60 transition-colors group-hover:text-cloud-white">
                Merek yang kami servis
              </span>
              <span className="mt-3 flex items-center gap-5 text-cloud-white/80 [--mark:1.25rem] sm:gap-6 sm:[--mark:1.5rem]">
                {SHOWROOM.map((car) => (
                  <BrandMarkIcon key={car.id} id={car.id} />
                ))}
              </span>
            </a>
          </div>

          {/* Rail: pause, the step counter and the steps, each filling while it plays. */}
          {!reducedMotion && (
            <div className="anatomi-rail pointer-events-auto absolute inset-x-4 bottom-6 flex items-center justify-between gap-4 sm:inset-x-6 lg:inset-x-8 lg:bottom-8">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserPaused((paused) => !paused)}
                  aria-label={userPaused ? 'Putar animasi' : 'Jeda animasi'}
                  className="-ml-3 grid size-11 cursor-pointer place-items-center rounded-full text-cloud-white/80 transition-colors hover:text-cloud-white"
                >
                  {userPaused ? <Play weight="fill" size={14} aria-hidden="true" /> : <Pause weight="fill" size={14} aria-hidden="true" />}
                </button>
                <p aria-hidden="true" className="spec-label whitespace-nowrap tabular-nums text-cloud-white/80">
                  <span className="text-cloud-white">{pad(active + 1)}</span> / {pad(COUNT)}
                  <span className="ml-3 text-cloud-white md:hidden">{ANATOMY[active].rail}</span>
                </p>
              </div>
              <ol aria-hidden="true" className="flex items-end gap-1.5 sm:gap-4">
                {ANATOMY.map((scene, i) => (
                  <li key={scene.id}>
                    <button type="button" tabIndex={-1} onClick={() => goToScene(i)} className="group flex cursor-pointer flex-col gap-2 py-2">
                      <span
                        className={`spec-label hidden text-[0.6875rem] transition-opacity duration-300 md:block ${
                          i === active ? 'text-cloud-white opacity-100' : 'text-cloud-white opacity-45 group-hover:opacity-80'
                        }`}
                      >
                        {scene.rail}
                      </span>
                      <span className="relative block h-0.5 w-5 overflow-hidden rounded-full bg-cloud-white/20 md:w-full md:min-w-12">
                        <span
                          ref={(bar) => {
                            bars.current[i] = bar;
                          }}
                          className="absolute inset-0 origin-left scale-x-0 bg-cloud-white"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* The whole story for screen readers; the stage shows it as pictures. */}
        <div className="sr-only">
          <h2>Anatomi servis</h2>
          <ol>
            {ANATOMY.slice(1).map((scene) => (
              <li key={scene.id}>
                {scene.eyebrow}. {scene.title} {scene.emphasis}. {scene.body}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** A clip over its first frame, shown once it has decoded. Played by the story timeline. */
function SceneVideo({
  slot,
  load,
  priority,
  videoRef,
  onReady,
}: {
  slot: string;
  load: boolean;
  priority: boolean;
  videoRef: (video: HTMLVideoElement | null) => void;
  onReady: () => void;
}) {
  const [ready, setReady] = useState(false);
  const clip = VIDEOS[slot]?.wide;
  if (!clip) return null;
  return (
    <>
      <img
        src={clip.poster}
        width={clip.width}
        height={clip.height}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'low'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <video
        ref={videoRef}
        src={load ? clip.src : undefined}
        width={clip.width}
        height={clip.height}
        muted
        playsInline
        preload={load ? 'auto' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        onLoadedData={() => setReady(true)}
        onCanPlayThrough={onReady}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
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

/**
 * Numbered callouts on a still. From lg a leader line runs from each marker to
 * clear space, where the label sits on an underline and links to its service.
 * Phones have no room for the lines: the name sits beside the marker.
 */
function Callouts({ spots }: { spots: Hotspot[] }) {
  return (
    <>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="none" className="absolute inset-0 hidden h-full w-full lg:block">
        {spots.map((spot) => (
          <line
            key={spot.label}
            data-callout-line
            x1={spot.x * 16}
            y1={spot.y * 9}
            x2={spot.lx * 16}
            y2={spot.ly * 9}
            pathLength={1}
            strokeDasharray="1"
            stroke="var(--color-cloud-white)"
            strokeOpacity={0.7}
            strokeWidth={1.5}
          />
        ))}
      </svg>
      {spots.map((spot, k) => (
        <Fragment key={spot.label}>
          <span data-callout-marker className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
            <span className="absolute grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cloud-white bg-stage/85 text-[0.625rem] font-semibold tabular-nums text-cloud-white lg:size-[18px]">
              {k + 1}
            </span>
            <span
              className={`spec-label absolute top-0 -translate-y-1/2 whitespace-nowrap rounded-md bg-stage/85 px-1.5 py-0.5 text-[0.625rem] text-cloud-white lg:hidden ${
                spot.mobileSide === 'left' ? 'right-3.5' : 'left-3.5'
              }`}
            >
              {spot.short ?? spot.label}
            </span>
          </span>
          <a
            href={`#layanan-${spot.service}`}
            tabIndex={-1}
            className="group absolute hidden -translate-y-full pb-1.5 lg:block"
            style={spot.side === 'right' ? { left: `${spot.lx}%`, top: `${spot.ly}%` } : { right: `${100 - spot.lx}%`, top: `${spot.ly}%` }}
          >
            <span
              data-callout-text
              className="spec-label block whitespace-nowrap text-[0.6875rem] text-cloud-white/85 transition-colors group-hover:text-cloud-white"
            >
              <span className="mr-2 tabular-nums text-cloud-white/55">{pad(k + 1)}</span>
              {spot.label}
            </span>
            <span
              data-callout-rule
              className={`absolute inset-x-0 bottom-0 h-px bg-cloud-white/70 transition-colors group-hover:bg-cloud-white ${
                spot.side === 'right' ? 'origin-left' : 'origin-right'
              }`}
            />
          </a>
        </Fragment>
      ))}
    </>
  );
}

/** The line of light that leads a wipe-in: a blue diagnostic scan or a white polish sweep. */
function RevealEdge({ kind }: { kind: 'scan' | 'polish' }) {
  return (
    <div data-reveal-edge className="pointer-events-none invisible absolute inset-y-0 left-0 w-[16%] -translate-x-1/2 mix-blend-screen">
      <div
        className={`absolute inset-0 bg-linear-to-r ${
          kind === 'scan' ? 'from-berlin-blue/0 via-berlin-blue-light/35 to-berlin-blue/0' : 'from-cloud-white/0 via-cloud-white/25 to-cloud-white/0'
        }`}
      />
      <div className="absolute inset-y-0 left-1/2 w-px bg-cloud-white/80" />
    </div>
  );
}
