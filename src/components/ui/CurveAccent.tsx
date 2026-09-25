/**
 * Brand guideline: accent shapes must be a ring, circle, or curved line —
 * never straight. Adapted from the main site's shared/src/components/CurveAccent.tsx.
 */
export function CurveAccent({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none text-berlin-red ${className}`}
    >
      <path d="M2,2 Q50,8 98,2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
