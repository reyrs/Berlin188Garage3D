# Berlin 188 Garage — showroom microsite

Static microsite: a dark showroom hero where scrolling lifts each make's photo like a garage door
(BMW → Mercedes-Benz → Audi → Volkswagen → MINI → Land Rover), then the fourteen services as a scroll story.
Every photo has a video slot: once an image-to-video clip is added, it replaces the photo and plays frame by
frame with the scroll.
Vite + React 19 + TypeScript + Tailwind v4, GSAP ScrollTrigger, Lenis. No backend — all copy lives in `src/data/*.ts`.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc --noEmit + vite build
npm run preview
```

The garage-door intro plays once per browser session (never under reduced motion). URL flags: `?intro` replays it, `?nointro` skips it.

## Assets

| Step | Command | Input | Output |
|---|---|---|---|
| Service photos | `npm run images -- --services` | `C:\Project\contoh foto\gambar web\` (read-only) | `public/images/services/` |
| Showroom photos | `npm run images -- --showroom` | `assets-src/showroom/<make>.jpg` | `public/images/showroom/` (16:9 + 9:16) |
| Video start frames | `npm run images -- --kit` | both of the above | `video-kit/start-frames/` |
| Scroll videos | `npm run videos` (`-- --force` to redo all) | `video-kit/clips/<start-frame-name>.mp4` | `public/videos/`, `src/data/media.ts` |

How to generate the clips (Higgsfield, Gemini/Veo, …), with a prompt per make and per service:
**`video-kit/README.md`**. A showroom make only needs its 16:9 clip; the phone version is cropped from it.

Crops, blur rectangles and the showroom focus points live in `scripts/images.config.mjs`.

## QA

`node scripts/qa-shot.mjs --url http://127.0.0.1:5173/ --size 390x844 --out shots/m.png`
(headless local Chrome; prints console errors/warnings; `--reduced`, `--full`, `--scroll N`, `--eval "<js>"`).

## Where things are

- `src/components/showroom/` — garage-door intro (`GarageDoor.tsx`), pinned hero + makes sequence (`Showroom.tsx`), art-directed photo
- `src/components/services/Services.tsx` — service list with the sticky photo/video frame (desktop) or inline photos (phones)
- `src/components/media/ScrubVideo.tsx` + `src/lib/scrub.ts` — scroll-driven video playback
- `src/index.css` — brand tokens (`@theme`, default palette removed) and Brand Guideline v3 signature classes
- `design-system/berlin188-garage-3d/MASTER.md` — design rules (ui-ux-pro-max output + brand overrides)
- `CREDITS.md` — asset credits

The retired 3D-studio version (three.js) is snapshotted in `archive/3d-studio-2026-09-25/`. Its source files
under `src/three`, `src/stores`, `src/components/{stage,intro,hero,brands}` are no longer imported and are
excluded from type-checking in `tsconfig.json` until they are moved out.
