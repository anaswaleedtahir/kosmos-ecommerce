'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IconSearch, IconX } from '@kosmos/design/icons';
import { useUI } from './providers/UIProvider';
import { getDefaultVariant, getProducts } from '@/lib/catalog';
import { JOURNAL } from '@/lib/journal';
import { eur } from '@/lib/format';

const SUGGESTIONS = [
  { label: 'Noir, undone', href: '/products/noir-undone' },
  { label: 'Rouge mat', href: '/products/rouge-mat' },
  { label: 'Huile de visage', href: '/products/huile-visage' },
  { label: 'Fragrance', href: '/collection/fragrance' },
  { label: 'The Black Edition', href: '/collection/fragrance' },
];

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!searchOpen) setQ('');
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return getProducts().filter((p) =>
      `${p.name} ${p.family} ${p.tagline} ${p.cat}`
        .toLowerCase()
        .includes(term),
    );
  }, [q]);

  const journalPreview = JOURNAL.slice(0, 2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the maison"
      aria-hidden={!searchOpen}
      className="fixed inset-0 z-[95] bg-paper overflow-auto transition-opacity duration-[250ms] motion-reduce:transition-none"
      style={{
        opacity: searchOpen ? 1 : 0,
        pointerEvents: searchOpen ? 'auto' : 'none',
        transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
      }}
    >
      <div className="sticky top-0 bg-paper border-b border-line">
        <div
          style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}
          className="h-24 flex items-center gap-6"
        >
          <IconSearch size={20} className="text-smoke" />
          <input
            autoFocus={searchOpen}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="A scent, a shade, a chapter…"
            aria-label="Search query"
            className="flex-1 h-16 bg-transparent border-0 outline-none font-display font-light text-[40px] tracking-[-0.01em] text-ink"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="bg-transparent border border-line w-12 h-12 p-0 cursor-pointer inline-flex items-center justify-center text-ink"
          >
            <IconX size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 48px 160px' }}>
        {q.trim().length === 0 ? (
          <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div>
              <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
                Suggested
              </div>
              <ul className="list-none m-0 p-0">
                {SUGGESTIONS.map((s) => (
                  <li key={s.label} className="mb-[14px]">
                    <Link
                      href={s.href}
                      onClick={closeSearch}
                      className="font-display font-light text-[28px] tracking-[-0.01em] text-ink"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
                From the journal
              </div>
              {journalPreview.map((a) => (
                <Link
                  key={a.id}
                  href={`/journal/${a.id}`}
                  onClick={closeSearch}
                  className="block mb-7 text-ink"
                >
                  <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-smoke mb-2">
                    {a.chapter}
                  </div>
                  <div className="font-display font-light text-[24px] leading-[1.1] tracking-[-0.01em]">
                    {a.title}
                  </div>
                </Link>
              ))}
            </div>
            <div
              className="relative bg-ash"
              style={{ aspectRatio: '4/5' }}
              aria-hidden="true"
            >
              <Image
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80"
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.length === 0 ? (
              <p className="font-display font-light text-[40px] tracking-[-0.01em] text-smoke mt-16 max-w-none">
                Nothing under that name.
              </p>
            ) : (
              <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {results.map((p) => {
                  const def = getDefaultVariant(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={closeSearch}
                      className="text-ink"
                    >
                      <div
                        className="relative bg-ash mb-4"
                        style={{ aspectRatio: '4/5' }}
                      >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-smoke mb-1">
                            {p.no}
                          </div>
                          <div className="font-display font-light text-[24px] tracking-[-0.01em]">
                            {p.name}
                          </div>
                        </div>
                        <span className="font-sans text-[13px] text-smoke">
                          {eur(def.price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
