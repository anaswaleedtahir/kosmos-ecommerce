'use client';

interface SizePillProps {
  label: string;
  price: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SizePill({ label, price, selected, disabled, onClick }: SizePillProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={{ border: `1px solid ${selected ? 'var(--color-ink)' : 'var(--color-line)'}` }}
      className="h-12 px-[22px] bg-transparent font-sans text-[13px] tracking-[0.06em] uppercase inline-flex gap-[10px] items-center transition-[border-color] duration-200 motion-reduce:transition-none disabled:cursor-not-allowed disabled:line-through"
    >
      <span className={disabled ? 'text-smoke' : 'text-ink'}>{label}</span>
      <span className="text-smoke text-[12px] tracking-[0.04em] normal-case">{price}</span>
    </button>
  );
}
