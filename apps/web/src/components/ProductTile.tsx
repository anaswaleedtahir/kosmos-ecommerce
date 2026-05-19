import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import type { Product } from '@/lib/types';
import { eur } from '@/lib/format';
import { getDefaultVariant } from '@/lib/catalog';

interface ProductTileProps {
  product: Product;
  variant?: 'paper' | 'ink';
  priority?: boolean;
  sizes?: string;
  showStockBadge?: boolean;
}

export function ProductTile({
  product,
  variant = 'paper',
  priority,
  sizes = '(min-width: 1024px) 33vw, 100vw',
  showStockBadge = true,
}: ProductTileProps) {
  const def = getDefaultVariant(product);
  const isOOS = product.variants.every((v) => v.stock === 0);
  const lowStock =
    !isOOS && product.variants.reduce((s, v) => s + v.stock, 0) < 10;
  const onInk = variant === 'ink';

  return (
    <Link
      href={`/products/${product.id}`}
      className="block group"
      style={{ color: onInk ? 'var(--color-cream)' : 'var(--color-ink)' }}
    >
      <ViewTransition name={`product-image-${product.id}`} share="morph">
        <div
          className="relative overflow-hidden bg-ash"
          style={{ aspectRatio: '4/5' }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.family}`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[600ms] motion-reduce:transition-none group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)' }}
          />
        </div>
      </ViewTransition>

      <div className="pt-[18px]">
        <div
          className="flex justify-between font-sans text-[10px] tracking-[0.22em] uppercase mb-[10px]"
          style={{ color: onInk ? 'rgba(255,255,255,0.55)' : 'var(--color-smoke)' }}
        >
          <span>
            {product.no} · {product.family}
          </span>
          {showStockBadge && (
            <span>{isOOS ? 'Sold out' : lowStock ? 'Few left' : ''}</span>
          )}
        </div>
        <div className="flex justify-between items-baseline">
          <span
            className="font-display font-light tracking-[-0.01em]"
            style={{ fontSize: 26 }}
          >
            {product.name}
          </span>
          <span
            className="font-sans text-[14px]"
            style={{ color: onInk ? 'rgba(255,255,255,0.75)' : 'var(--color-smoke)' }}
          >
            {eur(def.price)}
          </span>
        </div>
        {product.variantsAreShades && (
          <div className="flex gap-[6px] mt-[14px]">
            {product.variants.slice(0, 8).map((v) => (
              <span
                key={v.id}
                aria-hidden="true"
                className="w-[14px] h-[14px]"
                style={{
                  background: v.swatch,
                  opacity: v.stock === 0 ? 0.3 : 1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
