'use client';

import { useCallback } from 'react';
import { useBag } from './providers/BagProvider';
import { useUI } from './providers/UIProvider';
import { useProducts } from './providers/ProductsProvider';

export function useAddToBag() {
  const { add } = useBag();
  const { flashToast, openBag } = useUI();
  const products = useProducts();
  return useCallback(
    (pid: string, vid: string) => {
      add(pid, vid);
      const p = products.find((x) => x.id === pid);
      const v = p?.variants.find((x) => x.id === vid);
      if (p && v) flashToast({ productName: p.name, variantLabel: v.label });
      window.setTimeout(openBag, 400);
    },
    [add, flashToast, openBag, products],
  );
}
