import "server-only";

import { z } from "zod";

import type { Product } from "../types";

const CategorySchema = z.enum(["fragrance", "skin", "lipstick"]);

const StorefrontMetadataSchema = z.object({
  image_url: z.string().min(1),
  cat: CategorySchema.default("fragrance"),
  no: z.string().default(""),
  tagline: z.string().default(""),
  italic: z.string().optional(),
  image_url_2: z.string().optional(),
  image_url_3: z.string().optional(),
  family: z.string().default(""),
  composer: z.string().optional(),
  variant_label: z.string().default("Variant"),
  variants_are_shades: z.boolean().default(false),
  notes: z.record(z.string(), z.string()).default({}),
});

const VariantAttributesSchema = z
  .object({
    label: z.string().optional(),
    swatch: z.string().optional(),
    is_default: z.boolean().optional(),
  })
  .catch({});

const BackendVariantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  price: z.number(),
  attributes: VariantAttributesSchema,
  is_active: z.boolean(),
});

export const BackendProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  category_id: z.string(),
  status: z.string(),
  storefront_metadata: StorefrontMetadataSchema,
  variants: z.array(BackendVariantSchema),
});

export function logSchemaFailure(err: z.ZodError, raw: unknown): void {
  console.error(
    "[storefront-schema] parse failed",
    JSON.stringify(err.issues, null, 2),
    raw,
  );
}

export function parseStorefrontProduct(
  raw: unknown,
  stockMap: Map<string, number>,
): Product | null {
  const result = BackendProductSchema.safeParse(raw);
  if (!result.success) {
    logSchemaFailure(result.error, raw);
    return null;
  }
  const bp = result.data;
  const m = bp.storefront_metadata;
  return {
    id: bp.slug,
    uuid: bp.id,
    cat: m.cat,
    no: m.no,
    name: bp.name,
    italic: m.italic,
    tagline: m.tagline,
    description: bp.description ?? "",
    image: m.image_url,
    image2: m.image_url_2,
    image3: m.image_url_3,
    family: m.family,
    composer: m.composer,
    variantLabel: m.variant_label,
    variantsAreShades: m.variants_are_shades,
    notes: m.notes,
    variants: bp.variants
      .filter((v) => v.is_active)
      .map((v) => ({
        id: v.id,
        label: v.attributes.label ?? v.sku,
        price: v.price,
        stock: stockMap.get(v.id) ?? 0,
        swatch: v.attributes.swatch,
        default: v.attributes.is_default ?? false,
      })),
  };
}
