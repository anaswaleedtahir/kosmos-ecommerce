'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface CapsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  color?: string;
}

export function CapsLink({
  children,
  href = '#',
  onClick,
  color = 'var(--color-ink)',
  ...rest
}: CapsLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{ color, borderBottom: `1px solid ${color}`, paddingBottom: 4 }}
      className="font-sans text-[12px] uppercase tracking-[0.18em] inline-block"
      {...rest}
    >
      {children}
    </a>
  );
}
