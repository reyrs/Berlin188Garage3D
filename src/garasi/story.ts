// Scroll progress of each chapter of /garasi (0-1), written by ScrollTriggers in
// GaragePage and read every frame by the 3D scene. A plain mutable object on
// purpose: no React render per scroll frame.
export const story = {
  /** Hero entrance and scrolling away (0-1). */
  hero: 0,
  /** The five service steps while the camera circles the car (0-1). */
  process: 0,
  /** The lift going up, the camera dropping under the car (0-1). */
  lift: 0,
  /** Exploded view separating car components with service callout pins (0-1). */
  explode: 0,
  /** Closing wide shot of the entire workshop with booking CTA (0-1). */
  outro: 0,
};

/** Lift travel in metres at the top. */
export const LIFT_TOP = 1.75;
