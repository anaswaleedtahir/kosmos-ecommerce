import type { BagLine, Product, Variant } from './types';
import { saveOrder, type Order } from './order';

export type CheckoutInfo = Order['info'];
export type ShipMethod = Order['ship'];
export type PayMethod = Order['pay'];

export type ResolvedOrderLine = BagLine & {
  p: Product;
  v: Variant;
};

export interface OrderPricing {
  subtotal: number;
  shipCost: number;
  total: number;
}

export interface OrderIntakeInput {
  lines: BagLine[];
  products: Product[];
  info: CheckoutInfo;
  ship: ShipMethod;
  pay: PayMethod;
  engrave: string;
}

export interface OrderIntakeAdapter {
  place(order: Order): Promise<Order>;
}

export const sessionStorageOrderAdapter: OrderIntakeAdapter = {
  async place(order) {
    saveOrder(order);
    return order;
  },
};

export function resolveOrderLines(
  lines: BagLine[],
  products: Product[],
): ResolvedOrderLine[] {
  return lines
    .map((line) => {
      const p = products.find((x) => x.id === line.pid);
      const v = p?.variants.find((x) => x.id === line.vid);
      return p && v ? { ...line, p, v } : null;
    })
    .filter((x): x is ResolvedOrderLine => x !== null);
}

export function calculateOrderPricing(
  resolved: ResolvedOrderLine[],
  ship: ShipMethod,
): OrderPricing {
  const subtotal = resolved.reduce((sum, line) => sum + line.v.price * line.qty, 0);
  const shipCost = ship === 'express' ? 22 : subtotal >= 120 ? 0 : 8;
  return {
    subtotal,
    shipCost,
    total: subtotal + shipCost,
  };
}

function generateOrderNo(): string {
  const seg = Math.random().toString(36).slice(2, 6).toUpperCase();
  const num = Math.floor(Math.random() * 90000 + 10000);
  return `KSM-${seg}-${num}`;
}

function buildOrder(input: OrderIntakeInput): Order {
  const resolved = resolveOrderLines(input.lines, input.products);
  const pricing = calculateOrderPricing(resolved, input.ship);

  return {
    orderNo: generateOrderNo(),
    info: input.info,
    ship: input.ship,
    pay: input.pay,
    engrave: input.engrave,
    subtotal: pricing.subtotal,
    shipCost: pricing.shipCost,
    total: pricing.total,
    lines: resolved.map((line) => ({
      pid: line.pid,
      vid: line.vid,
      qty: line.qty,
      price: line.v.price,
      label: line.v.label,
      productName: line.p.name,
      productImage: line.p.image,
      family: line.p.family,
      no: line.p.no,
    })),
    placedAt: new Date().toISOString(),
  };
}

export async function submitOrderIntake(
  input: OrderIntakeInput,
  adapter: OrderIntakeAdapter = sessionStorageOrderAdapter,
): Promise<Order> {
  return adapter.place(buildOrder(input));
}
