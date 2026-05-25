'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ViewTransition } from 'react';
import { Btn } from '@kosmos/design/btn';
import { SizePill } from '@kosmos/design/size-pill';
import { ShadePill } from '@kosmos/design/shade-pill';
import { useAddToBag } from '@/components/use-add-to-bag';
import { getCategory, getDefaultVariant } from '@/lib/catalog';
import { eur } from '@/lib/format';
import type { Product } from '@/lib/types';

export function PDPClient({ product }: { product: Product }) {
  const defaultV = getDefaultVariant(product);
  const [vid, setVid] = useState<string>(defaultV.id);
  const [imgIdx, setImgIdx] = useState(0);
  const addToBag = useAddToBag();

  const v = useMemo(
    () => product.variants.find((x) => x.id === vid) ?? defaultV,
    [product, vid, defaultV],
  );

  const images = [product.image, product.image2, product.image3].filter(
    (img): img is string => Boolean(img),
  );

  const category = getCategory(product.cat);

  const tagline =
    product.cat === 'fragrance'
      ? 'Eau de parfum'
      : product.cat === 'skin'
        ? product.family
        : 'Matte lipstick';

  const nameHead = product.italic
    ? product.name.replace(`, ${product.italic}`, ',')
    : product.name;

  return (
    <section
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '56px 48px 120px',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: 96,
        alignItems: 'start',
      }}
    >
      <div
        className="grid items-start"
        style={{ gridTemplateColumns: '72px 1fr', gap: 16 }}
      >
        <div className="flex flex-col gap-3">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setImgIdx(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === imgIdx}
              style={{
                width: 72,
                height: 90,
                border: `1px solid ${i === imgIdx ? 'var(--color-ink)' : 'var(--color-line)'}`,
              }}
              className="relative bg-ash p-0 cursor-pointer"
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <ViewTransition name={`product-image-${product.id}`} share="morph">
          <div
            className="relative bg-ash"
            style={{ aspectRatio: '4/5' }}
            role="img"
            aria-label={`${product.name} — ${product.family}`}
          >
            <Image
              src={images[imgIdx]}
              alt={`${product.name} — ${product.family}`}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(rgba(15,12,9,0.15), rgba(15,12,9,0.15))',
              }}
            />
          </div>
        </ViewTransition>
      </div>

      <div style={{ paddingTop: 40, position: 'sticky', top: 100 }}>
        <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
          {category.label} · {product.no}
        </div>
        <h1
          className="font-display font-light text-ink"
          style={{
            fontSize: 88,
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            margin: '0 0 32px',
          }}
        >
          {product.italic ? (
            <>
              {nameHead}
              <br />
              <em>{product.italic}.</em>
            </>
          ) : (
            product.name
          )}
        </h1>
        <p
          className="font-sans text-smoke"
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            maxWidth: 460,
            margin: '0 0 44px',
          }}
        >
          {product.description}
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-[14px]">
            <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke">
              {product.variantLabel}
            </span>
            {product.variantsAreShades && (
              <span className="font-sans text-[12px] tracking-[0.04em] text-ink">
                {v.label}
              </span>
            )}
          </div>
          {product.variantsAreShades ? (
            <div className="flex flex-wrap gap-2">
              {product.variants.map((s) => (
                <ShadePill
                  key={s.id}
                  swatch={s.swatch!}
                  label={s.label}
                  selected={vid === s.id}
                  disabled={s.stock === 0}
                  onClick={() => setVid(s.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-[10px]">
              {product.variants.map((s) => (
                <SizePill
                  key={s.id}
                  label={s.label}
                  price={s.stock === 0 ? 'sold out' : eur(s.price)}
                  selected={vid === s.id}
                  disabled={s.stock === 0}
                  onClick={() => setVid(s.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between mb-6">
          <span className="font-sans text-[24px] font-light tracking-[0.04em]">
            {eur(v.price)}
          </span>
          <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke">
            {tagline} · {v.label}
          </span>
        </div>

        <Btn
          block
          disabled={v.stock === 0}
          onClick={() => addToBag(product.id, v.id)}
        >
          {v.stock === 0 ? 'Sold out' : `Add to bag — ${eur(v.price)}`}
        </Btn>

        <div className="mt-6 flex gap-6 font-sans text-[11px] tracking-[0.18em] uppercase text-smoke">
          <span>Complimentary engraving</span>
          <span>Wrapped by hand</span>
          <span>Free post over €120</span>
        </div>

        <div
          className="mt-14 pt-7 border-t border-line font-sans text-[13px] leading-[1.8] text-smoke"
        >
          <div className="grid" style={{ gridTemplateColumns: '140px 1fr', rowGap: 10 }}>
            {Object.entries(product.notes).map(([k, val]) => (
              <Notes key={k} label={k} value={val} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Notes({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-ink tracking-[0.18em] uppercase text-[11px]">
        {label}
      </span>
      <span>{value}</span>
    </>
  );
}
