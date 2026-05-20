import "server-only";

import { parseStorefrontProduct } from "./schemas/catalog";
import type { Product } from "./types";

const BASE = process.env.CATALOG_SERVICE_URL ?? "http://localhost:8001";
const API = `${BASE}/api/v1`;

interface InventoryItem {
  variant_id: string;
  available: number;
}

interface RawBackendProductLike {
  variants?: Array<{ id?: unknown }>;
}

function collectVariantIds(raw: unknown[]): string[] {
  const ids: string[] = [];
  for (const p of raw) {
    const variants = (p as RawBackendProductLike).variants ?? [];
    for (const v of variants) {
      if (typeof v.id === "string") ids.push(v.id);
    }
  }
  return ids;
}

async function fetchStockMap(variantIds: string[]): Promise<Map<string, number>> {
  if (!variantIds.length) return new Map();
  try {
    const params = variantIds.map((id) => `variant_ids=${id}`).join("&");
    const res = await fetch(`${API}/inventory/variants?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return new Map();
    const data = (await res.json()) as { items: InventoryItem[] };
    return new Map(data.items.map((item) => [item.variant_id, item.available]));
  } catch {
    return new Map();
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/catalog/products?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as unknown[];

    const stockMap = await fetchStockMap(collectVariantIds(raw));

    return raw
      .map((row) => parseStorefrontProduct(row, stockMap))
      .filter((p): p is Product => p !== null);
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/catalog/products/by-slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;

    const variantIds = collectVariantIds([raw]);
    const stockMap = await fetchStockMap(variantIds);

    return parseStorefrontProduct(raw, stockMap);
  } catch {
    return null;
  }
}

export async function getRelated(product: Product, limit = 3): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, limit);
}
