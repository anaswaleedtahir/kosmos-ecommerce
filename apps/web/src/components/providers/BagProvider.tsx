'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { BagLine } from '@/lib/types';

const STORAGE_KEY = 'kosmos.bag.v1';

type Action =
  | { type: 'set'; lines: BagLine[] }
  | { type: 'add'; pid: string; vid: string }
  | { type: 'updateQty'; index: number; qty: number }
  | { type: 'remove'; index: number }
  | { type: 'clear' };

function reducer(state: BagLine[], action: Action): BagLine[] {
  switch (action.type) {
    case 'set':
      return action.lines;
    case 'add': {
      const idx = state.findIndex(
        (l) => l.pid === action.pid && l.vid === action.vid,
      );
      if (idx >= 0) {
        const next = state.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...state, { pid: action.pid, vid: action.vid, qty: 1 }];
    }
    case 'updateQty':
      return state.map((l, i) =>
        i === action.index ? { ...l, qty: Math.max(1, action.qty) } : l,
      );
    case 'remove':
      return state.filter((_, i) => i !== action.index);
    case 'clear':
      return [];
  }
}

interface BagContextValue {
  lines: BagLine[];
  count: number;
  add: (pid: string, vid: string) => void;
  updateQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
}

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: BagLine[] = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: 'set', lines: parsed });
      }
    } catch {
      // ignore corrupt storage
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage may be full or disabled
    }
  }, [lines]);

  const add = useCallback((pid: string, vid: string) => {
    dispatch({ type: 'add', pid, vid });
  }, []);
  const updateQty = useCallback((index: number, qty: number) => {
    dispatch({ type: 'updateQty', index, qty });
  }, []);
  const remove = useCallback((index: number) => {
    dispatch({ type: 'remove', index });
  }, []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = useMemo<BagContextValue>(
    () => ({ lines, count, add, updateQty, remove, clear }),
    [lines, count, add, updateQty, remove, clear],
  );

  return <BagContext value={value}>{children}</BagContext>;
}

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used inside <BagProvider>');
  return ctx;
}
