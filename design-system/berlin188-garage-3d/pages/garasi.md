# /garasi — page override

Overrides MASTER.md for the garage page (`src/garasi/`).

- **Purpose:** "Mobil Anda kenapa?" — a complaint picker, not a configurator. No paint picker, no free 360° orbit,
  no pulsing hotspots.
- **Stage:** the BMW M4 stills of the home page story shown in depth (`DepthStage.tsx`: one displaced grid per frame,
  depth maps in `public/images/garasi/`). The canvas renders on demand only; pixel ratio capped at 2.
- **Frame changes:** wipe left to right behind a blue scan line (same motif as the home page story).
- **Markers:** numbered rings on the parts; names beside them from `sm` up, kept inside the free area between the list
  and the panel; phones show numbers only and the names sit in the panel under the stage.
- **Layout (lg):** list column 360px left, detail panel 400px right, the focus point lands between them.
- **Copy:** causes and steps are neutral drafts (`src/data/keluhan.ts`, TODO: tinjau); only services and tools already
  named on the site.
- **Upgrade path:** a real Scaniverse capture of the workshop with a car (.spz, rendered with Spark) can replace the
  stills; the complaint data and panel stay.
