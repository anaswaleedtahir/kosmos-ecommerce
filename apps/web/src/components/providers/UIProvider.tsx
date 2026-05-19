'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  productName: string;
  variantLabel: string;
}

interface UIContextValue {
  bagOpen: boolean;
  searchOpen: boolean;
  toast: Toast | null;
  openBag: () => void;
  closeBag: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  flashToast: (t: Toast) => void;
  dismissToast: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const openBag = useCallback(() => {
    setBagOpen(true);
    setSearchOpen(false);
  }, []);
  const closeBag = useCallback(() => setBagOpen(false), []);
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setBagOpen(false);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const flashToast = useCallback((t: Toast) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2400);
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo<UIContextValue>(
    () => ({
      bagOpen,
      searchOpen,
      toast,
      openBag,
      closeBag,
      openSearch,
      closeSearch,
      flashToast,
      dismissToast,
    }),
    [
      bagOpen,
      searchOpen,
      toast,
      openBag,
      closeBag,
      openSearch,
      closeSearch,
      flashToast,
      dismissToast,
    ],
  );

  return <UIContext value={value}>{children}</UIContext>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
