import type { CategoryMeta, Product } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  { id: "fragrance", label: "Fragrance", eyebrow: "Eau de parfum · Eau de toilette" },
  { id: "skin", label: "Skin", eyebrow: "Skin · Body · Hands" },
  { id: "lipstick", label: "Lipstick", eyebrow: "Lipstick · Balm" },
];

export const FAMILIES: Record<Product["cat"], string[]> = {
  fragrance: ["Amber · Leather", "Floral · Powder", "Woody · Smoke"],
  skin: ["Body · Daily", "Face · Night", "Hands · Daily"],
  lipstick: ["Matte · Long wear", "Balm · Tinted"],
};

export const PRODUCTS: Product[] = [
  {
    id: "noir-undone",
    cat: "fragrance",
    no: "N° 04",
    name: "Noir, undone",
    italic: "undone",
    tagline: "A scent of cold air and white smoke.",
    description:
      "A scent of cold air and white smoke. Amber, leather, and a quiet trace of frankincense long after the room is empty. On the skin, it warms.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80",
    image2: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
    image3: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80",
    family: "Amber · Leather",
    composer: "H. Vasseur",
    variantLabel: "Volume",
    variants: [
      { id: "30", label: "30 ml", price: 140, stock: 24 },
      { id: "50", label: "50 ml", price: 220, stock: 12, default: true },
      { id: "100", label: "100 ml", price: 320, stock: 6 },
      { id: "200", label: "200 ml", price: 540, stock: 0 },
    ],
    notes: {
      top: "Bergamot · pink pepper · cold air",
      heart: "Iris · leather · smoked tea",
      base: "Amber · oud · frankincense",
    },
  },
  {
    id: "blanche",
    cat: "fragrance",
    no: "N° 02",
    name: "Blanche",
    tagline: "Iris, white musk, and the hush after snow.",
    description:
      "Composed in winter. White iris carried over a bed of musk and orris root. The kind of scent worn alone, late, in a quiet apartment.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
    family: "Floral · Powder",
    composer: "H. Vasseur",
    variantLabel: "Volume",
    variants: [
      { id: "30", label: "30 ml", price: 130, stock: 31 },
      { id: "50", label: "50 ml", price: 200, stock: 18, default: true },
      { id: "100", label: "100 ml", price: 290, stock: 9 },
    ],
    notes: {
      top: "Aldehydes · pear · mandarin",
      heart: "White iris · neroli",
      base: "Musk · orris · ambrette",
    },
  },
  {
    id: "fumee",
    cat: "fragrance",
    no: "N° 07",
    name: "Fumée",
    tagline: "Tobacco leaf, vetiver, and warm wood.",
    description:
      "A masculine, ungendered fragrance built on Virginia tobacco and Haitian vetiver. Smoke kept low, never theatrical.",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80",
    family: "Woody · Smoke",
    composer: "L. Mercier",
    variantLabel: "Volume",
    variants: [
      { id: "50", label: "50 ml", price: 210, stock: 14, default: true },
      { id: "100", label: "100 ml", price: 310, stock: 4 },
    ],
    notes: {
      top: "Black pepper · cardamom",
      heart: "Tobacco leaf · cedar",
      base: "Vetiver · benzoin · labdanum",
    },
  },
  {
    id: "lait-corps",
    cat: "skin",
    no: "S° 01",
    name: "Lait de corps",
    tagline: "A daily body lotion of almond and oat.",
    description:
      "A weightless body milk of sweet almond, oat, and a trace of orange flower. Absorbs in seconds. Leaves no film.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80",
    family: "Body · Daily",
    variantLabel: "Size",
    variants: [
      { id: "200", label: "200 ml", price: 58, stock: 42, default: true },
      { id: "500", label: "500 ml", price: 120, stock: 18 },
    ],
    notes: {
      key: "Almond · oat · glycerin",
      use: "Apply to damp skin, morning or evening",
      avoid: "Free of silicones · synthetic fragrance",
    },
  },
  {
    id: "huile-visage",
    cat: "skin",
    no: "S° 04",
    name: "Huile de visage",
    tagline: "A nightly face oil. Camellia and rose hip.",
    description:
      "A nightly face oil pressed from camellia seeds, rose hip, and a single drop of rose absolute. Worn alone or beneath cream.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=80",
    family: "Face · Night",
    variantLabel: "Size",
    variants: [
      { id: "30", label: "30 ml", price: 110, stock: 22, default: true },
      { id: "50", label: "50 ml", price: 170, stock: 11 },
    ],
    notes: {
      key: "Camellia · rose hip · squalane",
      use: "Three drops, pressed into skin at night",
      avoid: "Non-comedogenic · vegan",
    },
  },
  {
    id: "creme-mains",
    cat: "skin",
    no: "S° 02",
    name: "Crème de mains",
    tagline: "Shea, honey, a small luxury.",
    description:
      "A rich hand cream of unrefined shea, acacia honey, and beeswax. Designed to be carried.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1600&q=80",
    family: "Hands · Daily",
    variantLabel: "Size",
    variants: [
      { id: "50", label: "50 ml", price: 32, stock: 88, default: true },
      { id: "100", label: "100 ml", price: 56, stock: 0 },
    ],
    notes: {
      key: "Shea · honey · beeswax",
      use: "Apply as needed",
      avoid: "Free of mineral oil",
    },
  },
  {
    id: "rouge-mat",
    cat: "lipstick",
    no: "L° 01",
    name: "Rouge mat",
    tagline: "A matte lipstick in eight quiet shades.",
    description:
      "A flat matte lipstick that wears for hours without drying. Eight shades, all named after rooms in old Parisian apartments.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1600&q=80",
    family: "Matte · Long wear",
    variantLabel: "Shade",
    variantsAreShades: true,
    variants: [
      { id: "salon", label: "Salon", swatch: "#7C1F1B", price: 48, stock: 32, default: true },
      { id: "atelier", label: "Atelier", swatch: "#5A1116", price: 48, stock: 18 },
      { id: "boudoir", label: "Boudoir", swatch: "#9C3340", price: 48, stock: 14 },
      { id: "veranda", label: "Véranda", swatch: "#C46A5F", price: 48, stock: 0 },
      { id: "cuisine", label: "Cuisine", swatch: "#B47A5A", price: 48, stock: 22 },
      { id: "chambre", label: "Chambre", swatch: "#8B3D49", price: 48, stock: 9 },
      { id: "couloir", label: "Couloir", swatch: "#4D1014", price: 48, stock: 26 },
      { id: "bibliotheque", label: "Bibliothèque", swatch: "#6E2620", price: 48, stock: 11 },
    ],
    notes: {
      finish: "Flat matte · zero transfer",
      key: "Castor seed oil · candelilla wax",
      avoid: "Cruelty-free · fragrance-free",
    },
  },
  {
    id: "baume-levres",
    cat: "lipstick",
    no: "L° 03",
    name: "Baume des lèvres",
    tagline: "A tinted lip balm. Bare, with a trace of color.",
    description:
      "A nearly-invisible tint with the comfort of a balm. Worn alone or layered over Rouge mat.",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1600&q=80",
    family: "Balm · Tinted",
    variantLabel: "Shade",
    variantsAreShades: true,
    variants: [
      { id: "nu", label: "Nu", swatch: "#C49386", price: 34, stock: 40, default: true },
      { id: "miel", label: "Miel", swatch: "#A86A50", price: 34, stock: 21 },
      { id: "framboise", label: "Framboise", swatch: "#A8474F", price: 34, stock: 17 },
      { id: "prune", label: "Prune", swatch: "#6E323D", price: 34, stock: 8 },
    ],
    notes: {
      finish: "Sheer · soft sheen",
      key: "Beeswax · jojoba · raspberry pigment",
      avoid: "Cruelty-free · fragrance-free",
    },
  },
];

const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

export function getProduct(id: string): Product | undefined {
  return PRODUCT_BY_ID[id];
}

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getCategory(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getRelated(p: Product, limit = 3): Product[] {
  return PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, limit);
}

export function getDefaultVariant(p: Product) {
  return p.variants.find((v) => v.default) ?? p.variants[0];
}
