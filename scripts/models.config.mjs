// Per-model settings for scripts/optimize-models.mjs.
// Source files are downloaded by hand into SOURCE_DIR (read-only for this repo).
//
// Field guide (fill after `npm run models -- --inspect <id>`):
// - lengthM:      real car length in metres; the model is scaled to it.
// - yaw:          extra rotation (radians, around Y) so the nose points to +X.
// - removeNodes:  regexes of node names to drop (interior, driver, ground plane…).
// - paint:        regexes of material names that are body paint → renamed "paint".
// - wheels:       { fl, fr, rl, rr } regex per wheel; matching nodes are grouped
//                 under a pivot node "wheel_fl"… at the wheel centre so they can spin.
// - hood:         optional regex; grouped under a "hood" node hinged at its rear edge.
// - targetFaces:  ceiling after simplification (brief: ≤ 150 000).

// Env overrides exist for dry runs on synthetic files (see scripts/test-model-pipeline.mjs).
export const SOURCE_DIR = process.env.MODELS_SOURCE_DIR ?? 'C:/Project/contoh foto/model 3d';
export const OUTPUT_DIR = process.env.MODELS_OUTPUT_DIR ?? 'public/models';

export const MODELS = [
  {
    id: 'bmw-3-g20',
    lengthM: 4.71,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
  {
    id: 'range-rover-sport-2018',
    lengthM: 4.88,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
  {
    id: 'mercedes-e63-wagon-s213',
    lengthM: 4.99,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
  {
    id: 'audi-q7-2015',
    lengthM: 5.05,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
  {
    id: 'mini-countryman-2017',
    lengthM: 4.3,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
  {
    id: 'land-rover-defender-110',
    lengthM: 5.02,
    yaw: 0,
    removeNodes: [],
    paint: [],
    wheels: null,
    hood: null,
    targetFaces: 150_000,
  },
];
