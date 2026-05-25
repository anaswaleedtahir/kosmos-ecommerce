import type { Category, CategoryMeta, Product, Variant } from "./types";

// ── Static config (safe to import in client components) ──────────────────────

export const CATEGORIES: CategoryMeta[] = [
  { id: "fragrance", label: "Fragrance", eyebrow: "Eau de parfum · Eau de toilette" },
  { id: "skin", label: "Skin", eyebrow: "Skin · Body · Hands" },
  { id: "lipstick", label: "Lipstick", eyebrow: "Lipstick · Balm" },
];

export const FAMILIES: Record<Category, string[]> = {
  fragrance: ["Amber · Leather", "Floral · Powder", "Woody · Smoke"],
  skin: ["Body · Daily", "Face · Night", "Hands · Daily"],
  lipstick: ["Matte · Long wear", "Balm · Tinted"],
};

export function getCategory(id: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id)!;
}

export function getDefaultVariant(p: Product): Variant {
  return p.variants.find((v) => v.default) ?? p.variants[0];
}
