'use client';

import { useEffect, useState } from 'react';

interface NavProps {
  variant?: 'cream' | 'dark';
  onLogo?: () => void;
  onCategory?: (category: string) => void;
}

const CATEGORIES = ['Fragrance', 'Skin', 'Lipstick', 'The Maison'] as const;
const ACTIONS = ['Search', 'Account', 'Bag'] as const;

export function Nav({ variant = 'cream', onLogo, onCategory }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const overHero = variant === 'dark' && !scrolled;
  const fg = overHero ? 'var(--color-cream)' : 'var(--color-ink)';
  const bg = overHero ? 'transparent' : 'rgba(232, 228, 216, 0.92)';
  const borderColor = overHero ? 'transparent' : 'var(--color-line)';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: bg,
        backdropFilter: overHero ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: overHero ? 'none' : 'blur(12px)',
        borderBottom: `1px solid ${borderColor}`,
        color: fg,
        transition:
          'background 300ms cubic-bezier(0.2,0,0,1), color 300ms cubic-bezier(0.2,0,0,1), border-color 300ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 48px',
          height: 76,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        <div className="flex gap-9">
          {CATEGORIES.map((c) => (
            <a
              key={c}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategory?.(c);
              }}
              className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit"
            >
              {c}
            </a>
          ))}
        </div>

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onLogo?.();
          }}
          className="font-display font-light text-[28px] text-inherit tracking-[0.34em] pl-[0.34em]"
        >
          KOSMOS
        </a>

        <div className="flex justify-end gap-6">
          {ACTIONS.map((c) => (
            <a
              key={c}
              href="#"
              className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit"
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
