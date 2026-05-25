'use client';

import { useMemo, useState, useTransition } from 'react';
import { ViewTransition } from 'react';
import { CATEGORIES, FAMILIES } from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';
import type { Category, Product } from '@/lib/types';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'asc', label: 'Price · low to high' },
  { id: 'desc', label: 'Price · high to low' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

interface Filters {
  cats: Category[];
  families: string[];
  inStock: boolean;
  sort: SortId;
}

interface Props {
  cat: string;
  initialProducts: Product[];
}

export function CollectionBody({ cat, initialProducts }: Props) {
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>({
    cats: cat === 'all' ? [] : [cat as Category],
    families: [],
    inStock: false,
    sort: 'featured',
  });

  const updateFilters = (next: Filters | ((prev: Filters) => Filters)) => {
    startTransition(() => {
      setFilters((prev) =>
        typeof next === 'function' ? next(prev) : next,
      );
    });
  };

  const products = useMemo(() => {
    let list: Product[] = [...initialProducts];
    if (filters.cats.length) list = list.filter((p) => filters.cats.includes(p.cat));
    if (filters.families.length)
      list = list.filter((p) => filters.families.includes(p.family));
    if (filters.inStock)
      list = list.filter((p) => p.variants.some((v) => v.stock > 0));
    const priceOf = (p: Product) =>
      (p.variants.find((v) => v.default) ?? p.variants[0]).price;
    if (filters.sort === 'asc') list.sort((a, b) => priceOf(a) - priceOf(b));
    if (filters.sort === 'desc') list.sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [filters, initialProducts]);

  const toggleCat = (id: Category) =>
    updateFilters((f) => ({
      ...f,
      cats: f.cats.includes(id) ? f.cats.filter((x) => x !== id) : [...f.cats, id],
    }));
  const toggleFamily = (family: string) =>
    updateFilters((f) => ({
      ...f,
      families: f.families.includes(family)
        ? f.families.filter((x) => x !== family)
        : [...f.families, family],
    }));

  const familyOptions = filters.cats.length
    ? filters.cats.flatMap((c) => FAMILIES[c] ?? [])
    : Object.values(FAMILIES).flat();

  const hasActiveFilters =
    filters.cats.length > 0 || filters.families.length > 0 || filters.inStock;

  return (
    <section
      style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 48px 160px' }}
    >
      <div className="flex justify-end mb-10">
        <div className="inline-flex items-center gap-[10px] font-sans text-[12px] tracking-[0.18em] uppercase">
          <span className="text-smoke">Sort —</span>
          <select
            value={filters.sort}
            onChange={(e) =>
              updateFilters((f) => ({ ...f, sort: e.target.value as SortId }))
            }
            className="border-0 border-b border-ink bg-transparent pl-0 pr-6 py-1 font-sans text-[12px] tracking-[0.18em] uppercase text-ink cursor-pointer outline-none appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><polyline points='1,3 5,7 9,3' stroke='%230A0A0A' stroke-width='1' fill='none'/></svg>\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 4px center',
            }}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-14" style={{ gridTemplateColumns: '240px 1fr' }}>
        <aside className="self-start sticky" style={{ top: 100 }}>
          <FilterGroup title="Discipline">
            {CATEGORIES.map((c) => (
              <FilterCheck
                key={c.id}
                label={c.label}
                count={initialProducts.filter((p) => p.cat === c.id).length}
                checked={filters.cats.includes(c.id)}
                onChange={() => toggleCat(c.id)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Family">
            {familyOptions.map((f) => (
              <FilterCheck
                key={f}
                label={f}
                count={initialProducts.filter((p) => p.family === f).length}
                checked={filters.families.includes(f)}
                onChange={() => toggleFamily(f)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Availability">
            <FilterCheck
              label="In stock only"
              checked={filters.inStock}
              onChange={() =>
                updateFilters((f) => ({ ...f, inStock: !f.inStock }))
              }
            />
          </FilterGroup>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  cats: [],
                  families: [],
                  inStock: false,
                  sort: filters.sort,
                })
              }
              className="mt-6 bg-transparent border-0 font-sans text-[11px] tracking-[0.22em] uppercase text-smoke p-0 cursor-pointer border-b border-smoke pb-1"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="py-[120px] text-center font-display font-light text-[32px] tracking-[-0.01em] text-smoke max-w-none">
              Nothing under these terms.
            </p>
          ) : (
            <div
              className="grid gap-8"
              style={{ gridTemplateColumns: '1fr 1fr 1fr', rowGap: 64 }}
            >
              {products.map((p) => (
                <ViewTransition key={p.id}>
                  <ProductTile product={p} />
                </ViewTransition>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-5 pb-6">
      <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-ink mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterCheck({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-[6px] font-sans text-[13px] text-ink">
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          style={{ background: checked ? 'var(--color-ink)' : 'transparent' }}
          className="w-[14px] h-[14px] border border-ink inline-flex items-center justify-center"
        >
          {checked && (
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              stroke="var(--color-paper)"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              <polyline points="1,4 3,6 7,2" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="hidden"
        />
        <span>{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-smoke text-[12px]">
          {String(count).padStart(2, '0')}
        </span>
      )}
    </label>
  );
}
