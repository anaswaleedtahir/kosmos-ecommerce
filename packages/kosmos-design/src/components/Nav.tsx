'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavProps {
  bagCount?: number;
  onSearch?: () => void;
  onBag?: () => void;
  onAccount?: () => void;
}

const CATEGORIES = [
  { id: 'fragrance', label: 'Fragrance', href: '/collection/fragrance' },
  { id: 'skin', label: 'Skin', href: '/collection/skin' },
  { id: 'lipstick', label: 'Lipstick', href: '/collection/lipstick' },
  { id: 'journal', label: 'The Journal', href: '/journal' },
] as const;

export function Nav({ bagCount = 0, onSearch, onBag, onAccount }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';
  const overHero = isHome && !scrolled;
  const fg = overHero ? 'var(--color-cream)' : 'var(--color-ink)';
  const bg = overHero ? 'transparent' : 'rgba(232, 228, 216, 0.92)';
  const borderColor = overHero ? 'transparent' : 'var(--color-line)';

  const isActive = (href: string) => {
    if (href === '/journal') {
      return pathname === '/journal' || pathname.startsWith('/journal/');
    }
    if (href.startsWith('/collection/')) {
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    return pathname === href;
  };

  return (
    <nav
      className="kosmos-nav-motion"
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
          {CATEGORIES.map((c) => {
            const active = isActive(c.href);
            return (
              <Link
                key={c.id}
                href={c.href}
                className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit"
                style={
                  active
                    ? { borderBottom: '1px solid currentColor', paddingBottom: 2 }
                    : undefined
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/"
          className="font-display font-light text-[28px] text-inherit tracking-[0.34em] pl-[0.34em] justify-self-center"
        >
          KOSMOS
        </Link>

        <div className="flex justify-end gap-6 items-center">
          <button
            type="button"
            onClick={onSearch}
            className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit bg-transparent border-0 cursor-pointer p-0 hover:opacity-60"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onAccount}
            className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit bg-transparent border-0 cursor-pointer p-0 hover:opacity-60"
          >
            Account
          </button>
          <button
            type="button"
            onClick={onBag}
            className="font-sans text-[12px] uppercase tracking-[0.18em] text-inherit bg-transparent border-0 cursor-pointer p-0 hover:opacity-60"
          >
            Bag ({String(bagCount).padStart(2, '0')})
          </button>
        </div>
      </div>
    </nav>
  );
}
