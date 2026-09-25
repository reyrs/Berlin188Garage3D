import type { CSSProperties } from 'react';
import { BRAND_MARKS } from '../../data/brandMarks';

const MARKS = new Map(BRAND_MARKS.map((mark) => [mark.id, mark]));

/**
 * One make's logo in currentColor. Sized by area through the --mark custom
 * property, so the wide Audi rings carry the same visual weight as a roundel.
 * Decorative: the make's name is always in the text next to it.
 */
export function BrandMarkIcon({ id, className = '' }: { id: string; className?: string }) {
  const mark = MARKS.get(id);
  if (!mark) return null;
  const [, , width, height] = mark.viewBox.split(' ').map(Number);
  const root = Math.sqrt(width / height);
  const style: CSSProperties = {
    width: `calc(var(--mark, 2rem) * ${root.toFixed(3)})`,
    height: `calc(var(--mark, 2rem) / ${root.toFixed(3)})`,
  };
  return (
    <svg viewBox={mark.viewBox} aria-hidden="true" fill="currentColor" className={`shrink-0 ${className}`} style={style}>
      <path d={mark.path} />
    </svg>
  );
}
