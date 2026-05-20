'use client';

import { createContext, useContext } from 'react';
import type { Product } from '@/lib/types';

const Ctx = createContext<Product[]>([]);

export function ProductsProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={products}>{children}</Ctx.Provider>;
}

export function useProducts(): Product[] {
  return useContext(Ctx);
}
