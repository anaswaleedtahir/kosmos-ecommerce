import type { BagLine } from './types';

const STORAGE_KEY = 'kosmos.lastOrder.v1';

export interface Order {
  orderNo: string;
  info: {
    email: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    postal: string;
    country: string;
    phone: string;
  };
  ship: 'standard' | 'express' | 'boutique';
  pay: 'card' | 'paypal' | 'applepay';
  engrave: string;
  subtotal: number;
  shipCost: number;
  total: number;
  lines: Array<BagLine & { price: number; label: string; productName: string; productImage: string; family: string; no: string }>;
  placedAt: string;
}

export function saveOrder(order: Order) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

export function loadOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

export function clearOrder() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function generateOrderNo(): string {
  const seg = Math.random().toString(36).slice(2, 6).toUpperCase();
  const num = Math.floor(Math.random() * 90000 + 10000);
  return `KSM-${seg}-${num}`;
}
