import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

const pad = (n: number) => String(n).padStart(2, '0');

interface SliderControlsProps {
  active: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  /** What the slides are, for the button labels ("Merek", "Layanan"). */
  noun: string;
  tone?: 'dark' | 'light';
  className?: string;
}

/** Counter and previous/next buttons for a useSnapSlider slider. */
export function SliderControls({ active, count, onPrev, onNext, noun, tone = 'dark', className = '' }: SliderControlsProps) {
  const dark = tone === 'dark';
  const button = `flex size-12 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 disabled:cursor-default disabled:opacity-30 ${
    dark
      ? 'border-cloud-white/30 text-cloud-white hover:border-cloud-white hover:bg-cloud-white/10 disabled:hover:bg-transparent'
      : 'border-jet-black/20 text-jet-black hover:border-jet-black hover:bg-jet-black/5 disabled:hover:bg-transparent'
  }`;
  return (
    <div className={`shrink-0 items-center gap-3 ${className}`}>
      <p className={`spec-label mr-2 tabular-nums ${dark ? 'text-cloud-white/70' : 'text-jet-black/60'}`} aria-live="polite">
        <span className={dark ? 'text-cloud-white' : 'text-jet-black'}>{pad(active + 1)}</span> / {pad(count)}
      </p>
      <button type="button" onClick={onPrev} disabled={active === 0} aria-label={`${noun} sebelumnya`} className={button}>
        <ArrowLeft weight="bold" size={18} aria-hidden="true" />
      </button>
      <button type="button" onClick={onNext} disabled={active === count - 1} aria-label={`${noun} berikutnya`} className={button}>
        <ArrowRight weight="bold" size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
