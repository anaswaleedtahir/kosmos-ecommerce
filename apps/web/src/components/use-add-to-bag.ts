'use client';

import { useCallback } from 'react';
import { getProduct } from '@/lib/catalog';
import { useBag } from './providers/BagProvider';
import { useUI } from './providers/UIProvider';

export function useAddToBag() {
  const { add } = useBag();
  const { flashToast, openBag } = useUI();
  return useCallback(
    (pid: string, vid: string) => {
      add(pid, vid);
      const p = getProduct(pid);
      const v = p?.variants.find((x) => x.id === vid);
      if (p && v) flashToast({ productName: p.name, variantLabel: v.label });
      window.setTimeout(openBag, 400);
    },
    [add, flashToast, openBag],
  );
}
