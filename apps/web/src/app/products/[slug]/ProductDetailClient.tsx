'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Btn, SizePill } from '@kosmos/design';

const SIZES = [
  { label: '30 ml', price: '€ 140', value: '30' },
  { label: '50 ml', price: '€ 220', value: '50' },
  { label: '100 ml', price: '€ 320', value: '100' },
  { label: '200 ml', price: 'sold out', value: '200', disabled: true },
] as const;

type SizeValue = (typeof SIZES)[number]['value'];

const PRICE_MAP: Record<string, string> = {
  '30': '€ 140',
  '50': '€ 220',
  '100': '€ 320',
};

export function ProductDetailClient() {
  const [size, setSize] = useState<SizeValue>('50');

  return (
    <div className="bg-paper">
      {/* Breadcrumb */}
      <div
        style={{ maxWidth: 1440, margin: '0 auto', padding: '112px 48px 0' }}
        className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke"
      >
        <Link href="/" className="text-inherit">Maison</Link>
        <span className="mx-3">—</span>
        <span className="text-inherit">Fragrance</span>
        <span className="mx-3">—</span>
        <span className="text-ink">Noir, undone</span>
      </div>

      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '56px 48px 160px',
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: 120,
          alignItems: 'start',
        }}
      >
        {/* Product image */}
        <div
          style={{
            background:
              "linear-gradient(rgba(15,12,9,0.15), rgba(15,12,9,0.15)), url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
            aspectRatio: '4/5',
            backgroundColor: 'var(--color-ash)',
          }}
        />

        {/* Purchase column */}
        <div style={{ paddingTop: 40, position: 'sticky', top: 120 }}>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
            Fragrance · N° 04
          </div>

          <h1
            className="font-display font-light text-ink"
            style={{ fontSize: 88, lineHeight: 0.98, letterSpacing: '-0.02em', margin: '0 0 40px' }}
          >
            Noir,
            <br />
            <em>undone.</em>
          </h1>

          <p
            className="font-sans text-smoke"
            style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 420, margin: '0 0 48px' }}
          >
            A scent of cold air and white smoke. Amber, leather, and a quiet
            trace of frankincense long after the room is empty. On the skin,
            it warms.
          </p>

          <div className="mb-8">
            <div className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke mb-[14px]">
              Volume
            </div>
            <div className="flex gap-[10px] flex-wrap">
              {SIZES.map((s) => (
                <SizePill
                  key={s.value}
                  label={s.label}
                  price={s.price}
                  selected={size === s.value}
                  disabled={'disabled' in s ? s.disabled : false}
                  onClick={() => setSize(s.value)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-7">
            <span className="font-sans text-[22px] font-light tracking-[0.04em]">
              {PRICE_MAP[size]}
            </span>
            <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke">
              Eau de parfum · {size} ml
            </span>
          </div>

          <Btn block>Add to bag — {PRICE_MAP[size]}</Btn>

          <div
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: '1px solid var(--color-line)',
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              rowGap: 10,
            }}
            className="font-sans text-[13px] leading-[1.8] text-smoke"
          >
            <span className="text-ink tracking-[0.12em] uppercase text-[11px]">Top</span>
            <span>Bergamot · pink pepper · cold air</span>
            <span className="text-ink tracking-[0.12em] uppercase text-[11px]">Heart</span>
            <span>Iris · leather · smoked tea</span>
            <span className="text-ink tracking-[0.12em] uppercase text-[11px]">Base</span>
            <span>Amber · oud · frankincense</span>
          </div>
        </div>
      </section>
    </div>
  );
}
