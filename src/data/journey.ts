// "Dari check-in sampai pulang": the five process steps (PROCESS_STEPS) on one
// line, with real photos of the workshop where there is one. The photos are
// built from assets-src/bengkel by `npm run images -- --bengkel` into
// public/images/bengkel/<id>-<480|960>.<avif|webp>. A step without a photo
// stays text: no stand-in images (video-kit/HERO-STORY.md lists the photos
// still to take).
import { PROCESS_STEPS } from './content';

export interface JourneyPhoto {
  id: string;
  /** Size of the source photo, for the aspect ratio. */
  width: number;
  height: number;
  alt: string;
}

export interface JourneyStep {
  title: string;
  description: string;
  photos: JourneyPhoto[];
}

const PHOTOS: Record<string, JourneyPhoto[]> = {
  'Check-in': [
    {
      id: 'bay',
      width: 960,
      height: 1280,
      alt: 'Area servis Berlin 188 Garage dilihat dari mezanin: lantai biru dan deretan mobil yang sedang dikerjakan',
    },
  ],
  Pengerjaan: [
    {
      id: 'overhaul',
      width: 1280,
      height: 960,
      alt: 'Mekanik Berlin 188 mengerjakan mesin yang diturunkan, di samping crane mesin merah',
    },
    {
      id: 'ban',
      width: 1280,
      height: 960,
      alt: 'Mesin pasang ban dan balancing di samping Mercedes-Benz G-Class',
    },
  ],
  'Serah terima': [
    {
      id: 'mezanin',
      width: 1280,
      height: 960,
      alt: 'Jaguar XK hitam dan Mercedes-Benz klasik di bengkel, dekat tangga kayu ke mezanin',
    },
  ],
};

export const JOURNEY: JourneyStep[] = PROCESS_STEPS.map((step) => ({
  title: step.title,
  description: step.description,
  photos: PHOTOS[step.title] ?? [],
}));
