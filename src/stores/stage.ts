import { create } from 'zustand';

interface StageState {
  /** 0 = hero; services start at 1 (Fase 2). */
  step: number;
  /** First frame with the car is on screen — the poster can fade out. */
  ready: boolean;
  /** Set when the GPU can't keep up; the page falls back to photos. */
  degraded: boolean;
  /** The garage door is up (or never played): the reveal choreography may start. */
  doorOpen: boolean;
  /** The door intro played this visit, so the car materialises instead of just appearing. */
  introPlayed: boolean;
  /** 0 → 1 while the hero scrolls out of view (drives the camera). */
  heroProgress: number;
  /** The 3D chunk is loading/running (the door waits for it only then). */
  studioActive: boolean;
  /** 0 → 1 asset loading progress reported from inside the canvas. */
  loadProgress: number;
  setStep: (step: number) => void;
  setReady: (ready: boolean) => void;
  degrade: () => void;
  openDoor: (introPlayed: boolean) => void;
  setHeroProgress: (progress: number) => void;
  setStudioActive: (active: boolean) => void;
  setLoadProgress: (progress: number) => void;
}

export const useStage = create<StageState>((set) => ({
  step: 0,
  ready: false,
  degraded: false,
  doorOpen: false,
  introPlayed: false,
  heroProgress: 0,
  studioActive: false,
  loadProgress: 0,
  setStep: (step) => set({ step }),
  setReady: (ready) => set({ ready }),
  degrade: () => set({ degraded: true, ready: false }),
  openDoor: (introPlayed) => set({ doorOpen: true, introPlayed }),
  setHeroProgress: (heroProgress) => set({ heroProgress }),
  setStudioActive: (studioActive) => set({ studioActive }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
}));
