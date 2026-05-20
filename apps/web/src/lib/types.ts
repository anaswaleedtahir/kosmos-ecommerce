export type Category = "fragrance" | "skin" | "lipstick";

export type Variant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  swatch?: string;
  default?: boolean;
};

export type Product = {
  id: string;
  uuid: string;
  cat: Category;
  no: string;
  name: string;
  italic?: string;
  tagline: string;
  description: string;
  image: string;
  image2?: string;
  image3?: string;
  family: string;
  composer?: string;
  variantLabel: string;
  variantsAreShades?: boolean;
  variants: Variant[];
  notes: Record<string, string>;
};

export type CategoryMeta = {
  id: Category;
  label: string;
  eyebrow: string;
};

export type Article = {
  id: string;
  chapter: string;
  title: string;
  titleItalic: string;
  dek: string;
  image: string;
  author: string;
  date: string;
  minutes: number;
  body: string[];
};

export type BagLine = {
  pid: string;
  vid: string;
  qty: number;
};
