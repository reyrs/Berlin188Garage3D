// Reference photos → service images (brief §8). Sources are read-only; files
// are matched by their timestamp suffix because the original names contain
// "…", which breaks shell scripts.
//
// All photos are 1536×2752 portrait with the action in a middle band.
// cardTop / portraitTop are the crop's top edge in source pixels:
//   card     = 4:3  (1536×1152) for service cards;
//   portrait = 4:5  (1536×1920) for the phone / no-WebGL fallback.
// blur: [x, y, w, h] rectangles in source pixels, blurred before cropping —
// AI-garbled lettering (uniform badges, machine brands, box labels).

export const SOURCE_DIR = process.env.PHOTOS_SOURCE_DIR ?? 'C:/Project/contoh foto/gambar web';
export const OUTPUT_DIR = 'public/images/services';
export const WIDTHS = [480, 960, 1536];
export const CARD = { width: 1536, height: 1152 };
export const PORTRAIT = { width: 1536, height: 1920 };

export const PHOTOS = [
  { id: 'turun-mesin', stamp: '20260924163959', cardTop: 770, portraitTop: 430, blur: [[998, 1182, 46, 24], [1072, 1172, 62, 36], [484, 1169, 34, 20], [526, 1166, 34, 28], [478, 1388, 30, 40], [572, 1398, 32, 34]] },
  { id: 'overhaul-transmisi', stamp: '20260924164002', cardTop: 590, portraitTop: 420, blur: [[1078, 1242, 54, 22], [1178, 1246, 64, 40]] },
  { id: 'flushing-transmisi', stamp: '20260924164006', cardTop: 715, portraitTop: 470, blur: [[758, 1384, 40, 22], [808, 1374, 34, 32], [1188, 1150, 40, 30], [1138, 1159, 34, 20]] },
  { id: 'tune-up', stamp: '20260924164028', cardTop: 690, portraitTop: 470, blur: [[905, 1146, 40, 22], [948, 1142, 30, 30], [551, 1162, 30, 24], [594, 1154, 28, 28], [503, 1364, 34, 22], [543, 1354, 32, 28]] },
  { id: 'kalibrasi-injector', stamp: '20260924171606', cardTop: 840, portraitTop: 560, blur: [[905, 1146, 40, 22], [968, 1139, 34, 32], [551, 1159, 36, 22], [592, 1154, 30, 28], [474, 1299, 38, 32]] },
  { id: 'scan-all-brand', stamp: '20260924171621', cardTop: 690, portraitTop: 470, blur: [[905, 1146, 52, 30], [970, 1139, 36, 32], [547, 1159, 38, 22], [592, 1159, 26, 22], [479, 1296, 38, 36]] },
  { id: 'coding-ecu', stamp: '20260924171726', cardTop: 810, portraitTop: 560, blur: [[245, 1452, 100, 34], [905, 1152, 42, 22], [971, 1139, 40, 28], [549, 1162, 38, 22], [594, 1159, 28, 28], [309, 1157, 32, 30]] },
  { id: 'service-hardware-ecu', stamp: '20260924171754', cardTop: 960, portraitTop: 620, blur: [[662, 1526, 66, 28], [782, 1500, 80, 42]] },
  { id: 'balancing-shaking', stamp: '20260924171735', cardTop: 715, portraitTop: 470, blur: [[792, 1370, 64, 34], [795, 1168, 110, 18], [978, 1123, 32, 30], [553, 1152, 42, 20], [591, 1146, 30, 28], [503, 1333, 30, 34]] },
  { id: 'service-ac', stamp: '20260924171758', cardTop: 850, portraitTop: 560, blur: [[1141, 1191, 36, 24], [1208, 1189, 44, 30], [1340, 1329, 40, 20], [1068, 1468, 30, 34]] },
  { id: 'salon-body', stamp: '20260924173402', cardTop: 880, portraitTop: 600, blur: [[228, 1600, 135, 75], [552, 1654, 46, 30], [614, 1636, 52, 38], [738, 1724, 40, 24]] },
  { id: 'pengadaan-sparepart', stamp: '20260924171803', cardTop: 880, portraitTop: 600, blur: [[536, 1580, 68, 44], [536, 1638, 44, 46], [510, 1692, 86, 48], [670, 1642, 92, 44], [668, 1692, 88, 46], [540, 1894, 86, 54], [680, 1845, 84, 42], [680, 1914, 84, 52], [820, 1900, 80, 50], [540, 1990, 86, 50], [680, 2002, 84, 46], [820, 1988, 80, 58], [920, 1990, 86, 56], [930, 1934, 76, 28], [680, 1412, 72, 24]] },
  { id: 'fast-import-sparepart', stamp: '20260924172923', cardTop: 740, portraitTop: 470, blur: [[648, 1410, 40, 32], [604, 1431, 40, 24], [974, 1580, 68, 52], [1172, 1674, 76, 64], [1084, 1684, 76, 72], [1004, 1646, 52, 26], [1000, 1694, 56, 44], [920, 1676, 26, 48], [920, 1742, 26, 42], [1086, 1756, 70, 32]] },
  { id: 'towing-24-jam', stamp: '20260924171821', cardTop: 770, portraitTop: 470, blur: [[921, 1415, 36, 32]] },
];

// Showroom sequence: one AI-rendered photo per make (2816×1536), copied into
// assets-src/showroom/<id>.jpg. wide = 16:9 centre crop (desktop, landscape);
// tall = 9:16 crop centred on focusX (0-1 of the width), where the front of
// the car and its badge sit, for phones.
export const SHOWROOM_SOURCE_DIR = 'assets-src/showroom';
export const SHOWROOM_OUTPUT_DIR = 'public/images/showroom';
export const SHOWROOM_WIDE_WIDTHS = [1280, 1920, 2560];
export const SHOWROOM_TALL_WIDTHS = [540, 864];
export const SHOWROOM = [
  { id: 'bmw', focusX: 0.72 },
  { id: 'mercedes-benz', focusX: 0.72 },
  { id: 'audi', focusX: 0.71 },
  { id: 'volkswagen', focusX: 0.7 },
  { id: 'mini', focusX: 0.69 },
  { id: 'land-rover', focusX: 0.67 },
];

// Start frames for image-to-video (video-kit/README.md): the same crops at
// the size video models expect, services from the blurred full-height photo.
export const KIT_DIR = 'video-kit/start-frames';
