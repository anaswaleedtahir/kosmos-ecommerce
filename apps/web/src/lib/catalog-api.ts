import "server-only";

import type { Category, Product, Variant } from "./types";

const BASE = process.env.CATALOG_SERVICE_URL ?? "http://localhost:8001";
const API = `${BASE}/api/v1`;

// ── Backend response shapes ───────────────────────────────────────────────────

interface BackendVariant {
  id: string;
  sku: string;
  price: number;
  attributes: Record<string, unknown>;
  is_active: boolean;
}

interface BackendProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string;
  status: string;
  storefront_metadata: Record<string, unknown>;
  variants: BackendVariant[];
}

interface InventoryItem {
  variant_id: string;
  available: number;
}

// ── Mapping ───────────────────────────────────────────────────────────────────

function toVariant(v: BackendVariant, stockMap: Map<string, number>): Variant {
  const attrs = v.attributes as Record<string, unknown>;
  return {
    id: v.id,
    label: (attrs.label as string | undefined) ?? v.sku,
    price: v.price,
    stock: stockMap.get(v.id) ?? 0,
    swatch: (attrs.swatch as string | undefined) ?? undefined,
    default: (attrs.is_default as boolean | undefined) ?? false,
  };
}

function toProduct(bp: BackendProduct, stockMap: Map<string, number>): Product {
  const m = bp.storefront_metadata as Record<string, unknown>;
  return {
    id: bp.slug,
    uuid: bp.id,
    cat: ((m.cat as string) ?? "fragrance") as Category,
    no: (m.no as string) ?? "",
    name: bp.name,
    italic: (m.italic as string | undefined) ?? undefined,
    tagline: (m.tagline as string) ?? "",
    description: bp.description ?? "",
    image: (m.image_url as string) ?? "",
    image2: (m.image_url_2 as string | undefined) ?? undefined,
    image3: (m.image_url_3 as string | undefined) ?? undefined,
    family: (m.family as string) ?? "",
    composer: (m.composer as string | undefined) ?? undefined,
    variantLabel: (m.variant_label as string) ?? "Variant",
    variantsAreShades: (m.variants_are_shades as boolean) ?? false,
    notes: (m.notes as Record<string, string>) ?? {},
    variants: bp.variants
      .filter((v) => v.is_active)
      .map((v) => toVariant(v, stockMap)),
  };
}

// ── Inventory batch fetch ─────────────────────────────────────────────────────

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

// ── Public API (server-only) ──────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/catalog/products?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const products = (await res.json()) as BackendProduct[];

    const allVariantIds = products.flatMap((p) => p.variants.map((v) => v.id));
    const stockMap = await fetchStockMap(allVariantIds);

    return products.map((p) => toProduct(p, stockMap));
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
    const bp = (await res.json()) as BackendProduct;

    const variantIds = bp.variants.map((v) => v.id);
    const stockMap = await fetchStockMap(variantIds);

    return toProduct(bp, stockMap);
  } catch {
    return null;
  }
}

export async function getRelated(product: Product, limit = 3): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, limit);
}
