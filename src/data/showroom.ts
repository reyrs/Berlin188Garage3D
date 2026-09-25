// The six makes in the dark showroom sequence, one AI-rendered photo each
// (assets-src/showroom, built by `npm run images -- --showroom`). Same makes
// as the JSON-LD knowsAbout; `mark` points at the logo in brandMarks.ts.

export type ShowroomId = 'bmw' | 'mercedes-benz' | 'audi' | 'volkswagen' | 'mini' | 'land-rover';

export interface ShowroomCar {
  id: ShowroomId;
  brand: string;
  /** The car in the illustration, shown in its caption. */
  model: string;
  alt: string;
}

export const SHOWROOM: ShowroomCar[] = [
  {
    id: 'bmw',
    brand: 'BMW',
    model: 'BMW 3 Series',
    alt: 'BMW 3 Series abu-abu di showroom beton gelap dengan lantai hitam mengilap.',
  },
  {
    id: 'mercedes-benz',
    brand: 'Mercedes-Benz',
    model: 'Mercedes-AMG E-Class Estate',
    alt: 'Mercedes-AMG E-Class Estate hitam di showroom beton gelap.',
  },
  {
    id: 'audi',
    brand: 'Audi',
    model: 'Audi Q7',
    alt: 'Audi Q7 abu-abu di bawah deretan lampu LED showroom.',
  },
  {
    id: 'volkswagen',
    brand: 'Volkswagen',
    model: 'Volkswagen Golf R',
    alt: 'Volkswagen Golf R biru di bawah deretan lampu LED showroom.',
  },
  {
    id: 'mini',
    brand: 'MINI',
    model: 'MINI Countryman JCW',
    alt: 'MINI Countryman JCW hijau dengan atap merah di showroom gelap.',
  },
  {
    id: 'land-rover',
    brand: 'Land Rover',
    model: 'Land Rover Defender',
    alt: 'Land Rover Defender abu-abu doff di showroom gelap dengan lampu hangat.',
  },
];
