import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'on-dark';
type Size = 'md' | 'sm';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out-quint ' +
  'cursor-pointer select-none';

const VARIANTS: Record<Variant, string> = {
  // White on Berlin Blue = 5.8:1, passes AA at any size.
  primary: 'bg-berlin-blue text-white shadow-product hover:bg-berlin-blue-dark active:bg-berlin-blue-dark',
  secondary:
    'bg-white text-jet-black border border-jet-black/15 hover:border-berlin-blue hover:text-berlin-blue',
  'on-dark': 'border border-cloud-white/35 text-cloud-white hover:border-cloud-white hover:bg-cloud-white/10',
};

const SIZES: Record<Size, string> = {
  md: 'min-h-12 px-6 text-base',
  sm: 'min-h-11 px-4 text-[0.9375rem]',
};

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  external?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  external = false,
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
