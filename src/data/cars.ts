export type CarModelId =
  | 'bmw-3-g20'
  | 'mercedes-e63-wagon-s213'
  | 'audi-q7-2015'
  | 'mini-countryman-2017'
  | 'range-rover-sport-2018'
  | 'land-rover-defender-110';

/** Paint colours copy the car in each reference photo (3D material only, not UI colours). */
export type PaintId = 'berlin-blue' | 'black' | 'graphite' | 'white' | 'silver' | 'red';

export interface CarSlot {
  model: CarModelId;
  paint: PaintId;
}

export interface CarModel {
  id: CarModelId;
  label: string;
  file: string;
  credit: {
    title: string;
    author: string;
    authorUrl: string;
    sourceUrl: string;
  };
}

export const CAR_LICENSE = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
  changes: 'dimodifikasi: disederhanakan, dikompres, dan warna cat diubah',
} as const;

export const CAR_MODELS: Record<CarModelId, CarModel> = {
  'bmw-3-g20': {
    id: 'bmw-3-g20',
    label: 'BMW 3 Series (G20)',
    file: '/models/bmw-3-g20.glb',
    credit: {
      title: '2023 bmw 3 series',
      author: 'solid3ddd',
      authorUrl: 'https://sketchfab.com/solid3ddd',
      sourceUrl: 'https://sketchfab.com/3d-models/82534fdddd7e46e4bdb202d6c1d3c0e7',
    },
  },
  'mercedes-e63-wagon-s213': {
    id: 'mercedes-e63-wagon-s213',
    label: 'Mercedes-AMG E 63 S Wagon (S213)',
    file: '/models/mercedes-e63-wagon-s213.glb',
    credit: {
      title: '2018 Mercedes Benz E63 AMG S Wagon',
      author: 'sinnik',
      authorUrl: 'https://sketchfab.com/sinnik',
      sourceUrl: 'https://sketchfab.com/3d-models/da7dc289aeee4c8590762a1218b1bc6d',
    },
  },
  'audi-q7-2015': {
    id: 'audi-q7-2015',
    label: 'Audi Q7 (2015)',
    file: '/models/audi-q7-2015.glb',
    credit: {
      title: '2015 Audi Q7',
      author: 'razor24',
      authorUrl: 'https://sketchfab.com/razor24',
      sourceUrl: 'https://sketchfab.com/3d-models/65917c52e0b24f1289126128600ed7aa',
    },
  },
  'mini-countryman-2017': {
    id: 'mini-countryman-2017',
    label: 'MINI Countryman (2017)',
    file: '/models/mini-countryman-2017.glb',
    credit: {
      title: '2017 Mini Countryman',
      author: 'razor24',
      authorUrl: 'https://sketchfab.com/razor24',
      sourceUrl: 'https://sketchfab.com/3d-models/8d5fd459a54d4a529c2be4c7ac444b01',
    },
  },
  'range-rover-sport-2018': {
    id: 'range-rover-sport-2018',
    label: 'Range Rover Sport (2018)',
    file: '/models/range-rover-sport-2018.glb',
    credit: {
      title: 'Range Rover Sport 2018',
      author: 'diwdiw',
      authorUrl: 'https://sketchfab.com/diwdiw',
      sourceUrl: 'https://sketchfab.com/3d-models/d1fe581b3baf4af89275e9aa9a1392e2',
    },
  },
  'land-rover-defender-110': {
    id: 'land-rover-defender-110',
    label: 'Land Rover Defender 110',
    file: '/models/land-rover-defender-110.glb',
    credit: {
      title: 'Land Rover Defender 110',
      author: 'meeww',
      authorUrl: 'https://sketchfab.com/meeww',
      sourceUrl: 'https://sketchfab.com/3d-models/5773ec04488b46148816b5f7a9f3f44f',
    },
  },
};

export const HERO_CAR: CarSlot = { model: 'bmw-3-g20', paint: 'berlin-blue' };
