'use client';

import { useUI } from './providers/UIProvider';

export function Toast() {
  const { toast, dismissToast, openBag } = useUI();
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-paper px-7 py-[18px] z-[100] flex gap-6 items-center border border-ink"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      <span className="text-white/70">Added —</span>
      <span>
        {toast.productName} · {toast.variantLabel}
      </span>
      <button
        type="button"
        onClick={() => {
          dismissToast();
          openBag();
        }}
        className="bg-transparent border border-white/40 text-paper px-[14px] py-2 cursor-pointer font-sans text-[11px] tracking-[0.18em] uppercase"
      >
        View the bag
      </button>
    </div>
  );
}
