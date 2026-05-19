'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@kosmos/design/btn';
import { IconX, IconMinus, IconPlus } from '@kosmos/design/icons';
import { useBag } from './providers/BagProvider';
import { useUI } from './providers/UIProvider';
import { getProduct } from '@/lib/catalog';
import { eur } from '@/lib/format';

export function BagDrawer() {
  const { bagOpen, closeBag } = useUI();
  const { lines, updateQty, remove } = useBag();
  const router = useRouter();

  useEffect(() => {
    if (bagOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [bagOpen]);

  useEffect(() => {
    if (!bagOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBag();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bagOpen, closeBag]);

  const resolved = lines
    .map((b) => {
      const p = getProduct(b.pid);
      const v = p?.variants.find((x) => x.id === b.vid);
      return p && v ? { ...b, p, v } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = resolved.reduce((s, l) => s + l.v.price * l.qty, 0);
  const ship = subtotal >= 120 ? 0 : 8;
  const total = subtotal + ship;

  const onCheckout = () => {
    closeBag();
    router.push('/checkout');
  };

  return (
    <>
      <div
        onClick={closeBag}
        aria-hidden={!bagOpen}
        className="fixed inset-0 bg-ink/35 z-[80] transition-opacity duration-300 motion-reduce:transition-none"
        style={{
          opacity: bagOpen ? 1 : 0,
          pointerEvents: bagOpen ? 'auto' : 'none',
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="The bag"
        aria-hidden={!bagOpen}
        className="fixed top-0 right-0 bottom-0 w-[480px] max-w-full bg-snow text-ink z-[90] flex flex-col border-l border-line transition-transform duration-[400ms] motion-reduce:transition-none"
        style={{
          transform: bagOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
        }}
      >
        <header className="px-8 py-7 flex justify-between items-center border-b border-line">
          <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke">
            The bag · {resolved.length} {resolved.length === 1 ? 'piece' : 'pieces'}
          </span>
          <button
            type="button"
            onClick={closeBag}
            aria-label="Close bag"
            className="bg-transparent border-0 p-2 cursor-pointer text-ink"
          >
            <IconX size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-auto px-8 py-2">
          {resolved.length === 0 ? (
            <div className="text-center py-[120px] px-6 text-smoke">
              <p className="font-display font-light text-[40px] leading-[1.1] text-ink m-0 mb-4">
                The bag is <em>empty.</em>
              </p>
              <p className="font-sans text-[14px] leading-[1.7] mb-8 max-w-none">
                A house, three disciplines. Begin anywhere.
              </p>
              <Btn variant="secondary" onClick={closeBag}>
                Enter the maison
              </Btn>
            </div>
          ) : (
            resolved.map((l, i) => (
              <div
                key={`${l.pid}-${l.vid}`}
                className="grid gap-5 py-6"
                style={{
                  gridTemplateColumns: '96px 1fr auto',
                  borderBottom:
                    i < resolved.length - 1 ? '1px solid var(--color-line)' : 'none',
                }}
              >
                <Link
                  href={`/products/${l.p.id}`}
                  onClick={closeBag}
                  className="relative bg-ash"
                  style={{ aspectRatio: '4/5' }}
                >
                  <Image
                    src={l.p.image}
                    alt={l.p.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div>
                  <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-smoke mb-2">
                    {l.p.no} · {l.p.family}
                  </div>
                  <div className="font-display font-light text-[24px] leading-[1.05] tracking-[-0.01em] mb-[6px]">
                    {l.p.name}
                  </div>
                  <div className="font-sans text-[12px] text-smoke mb-[14px]">
                    {l.v.label}
                  </div>
                  <div className="inline-flex items-center border border-line h-8">
                    <button
                      type="button"
                      onClick={() => updateQty(i, l.qty - 1)}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 bg-transparent border-0 cursor-pointer text-ink inline-flex items-center justify-center"
                    >
                      <IconMinus />
                    </button>
                    <span className="min-w-[28px] text-center font-sans text-[13px]">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(i, l.qty + 1)}
                      aria-label="Increase quantity"
                      className="w-8 h-8 bg-transparent border-0 cursor-pointer text-ink inline-flex items-center justify-center"
                    >
                      <IconPlus />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-sans text-[15px]">
                    {eur(l.v.price * l.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="bg-transparent border-0 p-0 cursor-pointer font-sans text-[10px] tracking-[0.22em] uppercase text-smoke border-b border-smoke pb-[2px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {resolved.length > 0 && (
          <div className="border-t border-line px-8 pt-6 pb-8">
            <SummaryRow label="Subtotal" value={eur(subtotal)} />
            <SummaryRow
              label="Post · France"
              value={ship === 0 ? 'Complimentary' : eur(ship)}
            />
            <div className="flex justify-between mt-[14px] pt-[14px] border-t border-line">
              <span className="font-sans text-[11px] tracking-[0.22em] uppercase">
                Total
              </span>
              <span className="font-sans text-[22px] font-light">
                {eur(total)}
              </span>
            </div>
            <p className="mt-[14px] mb-5 font-sans text-[11px] text-smoke leading-[1.7] max-w-none">
              Complimentary engraving offered at checkout. Wrapped by hand in
              Paris.
            </p>
            <Btn block onClick={onCheckout}>
              Continue to checkout
            </Btn>
          </div>
        )}
      </aside>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-[6px] font-sans text-[13px]">
      <span className="text-smoke">{label}</span>
      <span>{value}</span>
    </div>
  );
}
