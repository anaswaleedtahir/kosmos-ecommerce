'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'inverse' | 'ghostOnInk';
  block?: boolean;
}

const VARIANTS = {
  primary:    'bg-ink text-paper border-ink hover:bg-transparent hover:text-ink',
  secondary:  'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  inverse:    'bg-paper text-ink border-paper hover:bg-transparent hover:text-paper',
  ghostOnInk: 'bg-transparent text-paper border-white/40 hover:bg-paper hover:text-ink hover:border-paper',
} as const;

export function Btn({ children, variant = 'primary', block, className, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center h-12 px-7 border',
        'font-sans text-[13px] font-medium uppercase tracking-[0.18em]',
        'cursor-pointer whitespace-nowrap transition-[background,color,border-color] duration-200 motion-reduce:transition-none',
        VARIANTS[variant],
        block ? 'w-full' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
