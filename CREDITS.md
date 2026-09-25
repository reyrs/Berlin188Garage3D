# Credits

Car makes, badges and designs are trademarks of their respective owners; Berlin 188 Garage is an independent
workshop, not a dealer or authorised service centre of the brands shown.

- **Showroom photos** (`assets-src/showroom/` → `public/images/showroom/`): AI-generated images (Gemini) supplied
  by Berlin 188 Garage, one per make; cropped to 16:9 and 9:16 and resized. Shown with an "Ilustrasi" label.
- **Service photos** (`public/images/services/`): AI-generated reference images supplied by Berlin 188 Garage,
  cropped, resized and with garbled AI lettering blurred. Shown with an "Ilustrasi" label.
- **Scroll videos** (`public/videos/`, when present): image-to-video clips generated from the photos above
  (see `video-kit/README.md`), re-encoded for scrubbing.
- **Make logos** (`src/data/brandMarks.ts`): Simple Icons (CC0 icon data; the marks are trademarks of their owners).
  Used only to say which makes the workshop services, next to the site's independent-workshop disclaimer.
- **Logos** (`public/brand/`): copied from the Berlin 188 Garage main site. `logo-dark.png` is a transparent cut of
  `logo.png` (its flat background unblended into alpha) for the dark header and footer.
- **Fonts:** Poppins and Instrument Sans, self-hosted via Fontsource (SIL Open Font License).
- **Icons:** Phosphor Icons (MIT).
- **Video encoding:** FFmpeg via `ffmpeg-static` (build-time only, not shipped).

The earlier 3D-studio version used Sketchfab car models under CC BY 4.0; its credits are kept with that code in
`archive/`. None of those models are used by the current site.
