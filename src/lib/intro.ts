import { useSyncExternalStore } from 'react';

// Whether the garage-door intro has started to open. The inline script in
// index.html decides before first paint whether the intro plays at all
// (data-intro="play" | "skip"); when it is skipped, the page counts as open.
let open = typeof document === 'undefined' || document.documentElement.dataset.intro !== 'play';
const listeners = new Set<() => void>();

export function markIntroOpen() {
  if (open) return;
  open = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True once the door starts lifting (or straight away when the intro is skipped). */
export function useIntroOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => true);
}
