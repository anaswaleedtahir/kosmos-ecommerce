'use client';

import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Field({ label, value, onChange, className, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block font-sans text-[11px] uppercase tracking-[0.18em] text-smoke mb-2.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-12 px-4 bg-transparent text-ink border border-line font-sans text-[15px] outline-none transition-[border-color] duration-200 motion-reduce:transition-none focus:border-ink box-border"
        {...rest}
      />
    </div>
  );
}
