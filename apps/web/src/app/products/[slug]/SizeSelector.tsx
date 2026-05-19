'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@kosmos/design/btn';
import { SizePill } from '@kosmos/design/size-pill';

const SIZES = [
  { label: '30 ml', price: '€ 140', value: '30' },
  { label: '50 ml', price: '€ 220', value: '50' },
  { label: '100 ml', price: '€ 320', value: '100' },
  { label: '200 ml', price: 'sold out', value: '200', disabled: true },
] as const;

export type SizeValue = (typeof SIZES)[number]['value'];

const PRICE_MAP: Record<string, string> = {
  '30': '€ 140',
  '50': '€ 220',
  '100': '€ 320',
};

export function SizeSelector({ initialSize = '50' }: { initialSize?: SizeValue }) {
  const router = useRouter();
  const [size, setSize] = useState<SizeValue>(initialSize);

  function handleSelect(val: SizeValue) {
    setSize(val);
    router.replace(`?size=${val}`, { scroll: false });
  }

  return (
    <>
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
              onClick={() => handleSelect(s.value)}
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
    </>
  );
}
