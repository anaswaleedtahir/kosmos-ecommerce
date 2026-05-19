'use client';

interface ShadePillProps {
  swatch: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function ShadePill({ swatch, label, selected, disabled, onClick }: ShadePillProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      style={{ border: `1px solid ${selected ? 'var(--color-ink)' : 'var(--color-line)'}` }}
      className="w-16 h-16 p-0 bg-transparent transition-[border-color] duration-200 motion-reduce:transition-none relative inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        style={{ background: swatch }}
        className="block w-11 h-11"
      />
      {disabled && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-smoke text-[10px] tracking-[0.18em] uppercase bg-paper/60"
        >
          —
        </span>
      )}
    </button>
  );
}
