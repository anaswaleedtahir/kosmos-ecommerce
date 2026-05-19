'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@kosmos/design/btn';
import { CheckoutHeader } from '../CheckoutHeader';
import { eur } from '@/lib/format';
import { loadOrder, type Order } from '@/lib/order';

export function ConfirmationClient() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(loadOrder());
    setLoaded(true);
  }, []);

  const arriveDate = useMemo(() => {
    if (!order) return '';
    const d = new Date(order.placedAt);
    const offset =
      order.ship === 'express' ? 1 : order.ship === 'boutique' ? 0 : 3;
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [order]);

  useEffect(() => {
    if (loaded && !order) router.replace('/');
  }, [loaded, order, router]);

  if (!order) return null;

  return (
    <div className="bg-paper min-h-screen">
      <CheckoutHeader />
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '120px 48px 80px',
          textAlign: 'center',
        }}
      >
        <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
          Order {order.orderNo}
        </div>
        <h1
          className="font-display font-light"
          style={{
            fontSize: 120,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: '0 0 40px',
          }}
        >
          Thank you,
          <br />
          <em>{order.info.firstName}.</em>
        </h1>
        <p
          className="font-sans text-smoke max-w-[560px] mx-auto"
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            marginBottom: 56,
          }}
        >
          A receipt is on its way to {order.info.email}. Your order will be
          wrapped by hand in the boutique tomorrow morning, and will arrive on
          or around <span className="text-ink">{arriveDate}</span>.
        </p>
        <div className="inline-flex gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-7 border border-ink bg-ink text-paper font-sans text-[13px] font-medium uppercase tracking-[0.18em] transition-[background,color] duration-200 motion-reduce:transition-none hover:bg-transparent hover:text-ink"
          >
            Continue to the maison
          </Link>
          <Btn variant="secondary">View the order</Btn>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '40px 48px 160px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
        }}
      >
        <div>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
            What's in the box
          </div>
          {order.lines.map((l) => (
            <div
              key={`${l.pid}-${l.vid}`}
              className="grid gap-[18px] py-[18px] border-b border-line"
              style={{ gridTemplateColumns: '72px 1fr auto' }}
            >
              <div
                className="relative bg-ash"
                style={{ aspectRatio: '4/5' }}
              >
                <Image
                  src={l.productImage}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <div>
                <div
                  className="font-display font-light tracking-[-0.01em]"
                  style={{ fontSize: 22 }}
                >
                  {l.productName}
                </div>
                <div className="font-sans text-[12px] text-smoke mt-1">
                  {l.label} · ×{l.qty}
                </div>
              </div>
              <div className="font-sans text-[14px]">
                {eur(l.price * l.qty)}
              </div>
            </div>
          ))}
          {order.engrave && (
            <div className="mt-6 py-5 px-6 border border-line font-sans text-[13px] text-smoke">
              Engraved with{' '}
              <span
                className="text-ink font-display"
                style={{ fontSize: 22, letterSpacing: '0.18em' }}
              >
                {order.engrave}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
            Posting to
          </div>
          <address
            className="font-sans not-italic text-[15px] leading-[1.8] text-ink mb-10"
          >
            {order.info.firstName} {order.info.lastName}
            <br />
            {order.info.address1}
            {order.info.address2 ? `, ${order.info.address2}` : ''}
            <br />
            {order.info.postal} {order.info.city}
            <br />
            {order.info.country}
          </address>

          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
            The receipt
          </div>
          <div className="flex justify-between py-[6px] font-sans text-[13px]">
            <span className="text-smoke">Subtotal</span>
            <span>{eur(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-[6px] font-sans text-[13px]">
            <span className="text-smoke">Shipping</span>
            <span>
              {order.shipCost === 0 ? 'Complimentary' : eur(order.shipCost)}
            </span>
          </div>
          <div className="flex justify-between mt-[14px] pt-[14px] border-t border-line">
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase">
              Total
            </span>
            <span className="font-sans text-[22px] font-light">
              {eur(order.total)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
