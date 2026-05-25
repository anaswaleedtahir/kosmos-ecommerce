'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Btn } from '@kosmos/design/btn';
import { Field } from '@kosmos/design/field';
import { useBag } from '@/components/providers/BagProvider';
import { eur } from '@/lib/format';
import type { Product } from '@/lib/types';
import {
  calculateOrderPricing,
  resolveOrderLines,
  submitOrderIntake,
  type PayMethod,
  type ShipMethod,
} from '@/lib/order-intake';
import { CheckoutHeader } from './CheckoutHeader';

const DEFAULT_INFO = {
  email: 'camille.aubert@kosmos.example',
  firstName: 'Camille',
  lastName: 'Aubert',
  address1: '12, rue de Tournon',
  address2: 'Apt. 3',
  city: 'Paris',
  postal: '75006',
  country: 'France',
  phone: '+33 6 14 22 88 41',
};

export function CheckoutClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const { lines, clear } = useBag();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [ship, setShip] = useState<ShipMethod>('standard');
  const [pay, setPay] = useState<PayMethod>('card');
  const [card, setCard] = useState({
    num: '',
    name: `${DEFAULT_INFO.firstName} ${DEFAULT_INFO.lastName}`,
    exp: '',
    cvc: '',
  });
  const [engrave, setEngrave] = useState('');

  const resolved = resolveOrderLines(lines, products);
  const { subtotal, shipCost, total } = calculateOrderPricing(resolved, ship);

  // Empty-bag guard: send back home if nothing to check out.
  useEffect(() => {
    if (lines.length === 0) router.replace('/');
  }, [lines.length, router]);

  const placeOrder = async () => {
    await submitOrderIntake({
      lines,
      products,
      info,
      ship,
      pay,
      engrave,
    });
    clear();
    router.push('/checkout/confirmation');
  };

  if (resolved.length === 0) return null;

  return (
    <div className="bg-paper min-h-screen">
      <CheckoutHeader />
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '72px 48px 160px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.9fr',
          gap: 96,
          alignItems: 'start',
        }}
      >
        <div>
          <Stepper step={step} onStep={setStep} />

          {step === 1 && (
            <StepBlock
              title="A little correspondence."
              dek="We'll send the receipt and tracking here."
            >
              <Field
                label="Email"
                type="email"
                value={info.email}
                onChange={(v) => setInfo({ ...info, email: v })}
                autoComplete="email"
              />
              <Row two>
                <Field
                  label="First name"
                  value={info.firstName}
                  onChange={(v) => setInfo({ ...info, firstName: v })}
                  autoComplete="given-name"
                />
                <Field
                  label="Last name"
                  value={info.lastName}
                  onChange={(v) => setInfo({ ...info, lastName: v })}
                  autoComplete="family-name"
                />
              </Row>
              <Field
                label="Address line 1"
                value={info.address1}
                onChange={(v) => setInfo({ ...info, address1: v })}
                autoComplete="address-line1"
              />
              <Field
                label="Address line 2 — optional"
                value={info.address2}
                onChange={(v) => setInfo({ ...info, address2: v })}
                autoComplete="address-line2"
              />
              <Row three>
                <Field
                  label="City"
                  value={info.city}
                  onChange={(v) => setInfo({ ...info, city: v })}
                  autoComplete="address-level2"
                />
                <Field
                  label="Postal"
                  value={info.postal}
                  onChange={(v) => setInfo({ ...info, postal: v })}
                  autoComplete="postal-code"
                />
                <Field
                  label="Country"
                  value={info.country}
                  onChange={(v) => setInfo({ ...info, country: v })}
                  autoComplete="country-name"
                />
              </Row>
              <Field
                label="Phone — for delivery"
                value={info.phone}
                onChange={(v) => setInfo({ ...info, phone: v })}
                autoComplete="tel"
              />
              <div className="mt-8">
                <Btn onClick={() => setStep(2)}>Continue to shipping →</Btn>
              </div>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock
              title="A method of arrival."
              dek="All packages are wrapped by hand. Boxed in matte black."
            >
              <ShipChoice
                title="Standard post"
                sub="Two to four working days · France"
                price={subtotal >= 120 ? 'Complimentary' : eur(8)}
                checked={ship === 'standard'}
                onChange={() => setShip('standard')}
              />
              <ShipChoice
                title="Express, by courier"
                sub="Next working day before 18h · Paris VIII"
                price={eur(22)}
                checked={ship === 'express'}
                onChange={() => setShip('express')}
              />
              <ShipChoice
                title="Collect at the boutique"
                sub="8, rue du Faubourg Saint-Honoré · ready in 4 hours"
                price="Complimentary"
                checked={ship === 'boutique'}
                onChange={() => setShip('boutique')}
              />

              <div className="mt-10 pt-8 border-t border-line">
                <Field
                  label="Engraving — three characters offered with every fragrance"
                  value={engrave}
                  onChange={(v) => setEngrave(v.toUpperCase().slice(0, 3))}
                  placeholder="C.A."
                />
                <p className="mt-[10px] font-sans text-[12px] text-smoke max-w-none">
                  Adds one working day to dispatch.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <Btn variant="secondary" onClick={() => setStep(1)}>
                  ← Back
                </Btn>
                <Btn onClick={() => setStep(3)}>Continue to payment →</Btn>
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock
              title="A method of settlement."
              dek="Transactions are encrypted. No information is stored on our end."
            >
              <div className="flex gap-3 mb-7">
                {(['card', 'paypal', 'applepay'] as PayMethod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPay(p)}
                    style={{
                      border: `1px solid ${pay === p ? 'var(--color-ink)' : 'var(--color-line)'}`,
                    }}
                    className="flex-1 h-14 bg-transparent cursor-pointer font-sans text-[12px] tracking-[0.18em] uppercase text-ink"
                  >
                    {p === 'card' ? 'Card' : p === 'paypal' ? 'PayPal' : 'Apple Pay'}
                  </button>
                ))}
              </div>

              {pay === 'card' ? (
                <>
                  <Field
                    label="Card number"
                    value={card.num}
                    onChange={(v) => setCard({ ...card, num: v })}
                    placeholder="4242 4242 4242 4242"
                    autoComplete="cc-number"
                    inputMode="numeric"
                  />
                  <Field
                    label="Name on card"
                    value={card.name}
                    onChange={(v) => setCard({ ...card, name: v })}
                    autoComplete="cc-name"
                  />
                  <Row two>
                    <Field
                      label="Expiry"
                      value={card.exp}
                      onChange={(v) => setCard({ ...card, exp: v })}
                      placeholder="MM / YY"
                      autoComplete="cc-exp"
                    />
                    <Field
                      label="CVC"
                      value={card.cvc}
                      onChange={(v) => setCard({ ...card, cvc: v })}
                      placeholder="•••"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                    />
                  </Row>
                </>
              ) : (
                <div className="py-12 px-6 border border-line text-center font-sans text-[14px] text-smoke">
                  You&apos;ll be redirected to{' '}
                  {pay === 'paypal' ? 'PayPal' : 'Apple Pay'} to complete the
                  transaction.
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <Btn variant="secondary" onClick={() => setStep(2)}>
                  ← Back
                </Btn>
                <Btn onClick={placeOrder}>Place order — {eur(total)}</Btn>
              </div>
              <p className="mt-5 font-sans text-[11px] text-smoke leading-[1.7] max-w-none">
                By placing the order you accept the terms of the house and the
                conditions of return — fourteen days, unopened.
              </p>
            </StepBlock>
          )}
        </div>

        <aside
          className="sticky bg-snow border border-line"
          style={{ top: 100, padding: 32 }}
        >
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
            The order · {resolved.length}{' '}
            {resolved.length === 1 ? 'piece' : 'pieces'}
          </div>

          {resolved.map((l, i) => (
            <div
              key={`${l.pid}-${l.vid}`}
              className="grid gap-4 py-4"
              style={{
                gridTemplateColumns: '64px 1fr auto',
                borderBottom:
                  i < resolved.length - 1 ? '1px solid var(--color-line)' : 'none',
              }}
            >
              <div className="relative bg-ash" style={{ aspectRatio: '4/5' }}>
                <Image
                  src={l.p.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div
                  className="font-display font-light tracking-[-0.01em]"
                  style={{ fontSize: 18 }}
                >
                  {l.p.name}
                </div>
                <div className="font-sans text-[11px] text-smoke mt-1">
                  {l.v.label} · ×{l.qty}
                </div>
              </div>
              <div className="font-sans text-[13px] whitespace-nowrap">
                {eur(l.v.price * l.qty)}
              </div>
            </div>
          ))}

          <div className="mt-6 pt-5 border-t border-line">
            <SummaryRow label="Subtotal" value={eur(subtotal)} />
            <SummaryRow
              label="Shipping"
              value={shipCost === 0 ? 'Complimentary' : eur(shipCost)}
            />
            <SummaryRow label="Engraving" value="Offered" muted />
            <div className="flex justify-between mt-4 pt-4 border-t border-line">
              <span className="font-sans text-[11px] tracking-[0.22em] uppercase">
                Total
              </span>
              <span className="font-sans text-[24px] font-light">
                {eur(total)}
              </span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stepper({
  step,
  onStep,
}: {
  step: 1 | 2 | 3;
  onStep: (s: 1 | 2 | 3) => void;
}) {
  return (
    <ol className="flex list-none p-0 m-0 mb-14 gap-10 font-sans text-[11px] tracking-[0.22em] uppercase">
      {(['Information', 'Shipping', 'Payment'] as const).map((s, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = step === n;
        const reachable = step > n;
        return (
          <li
            key={s}
            onClick={() => reachable && onStep(n)}
            style={{
              color: active ? 'var(--color-ink)' : 'var(--color-smoke)',
              borderBottom: active
                ? '1px solid var(--color-ink)'
                : '1px solid transparent',
              cursor: reachable ? 'pointer' : 'default',
              opacity: step >= n ? 1 : 0.5,
            }}
            className="pb-2"
          >
            {String(n).padStart(2, '0')} — {s}
          </li>
        );
      })}
    </ol>
  );
}

function StepBlock({
  title,
  dek,
  children,
}: {
  title: string;
  dek: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="font-display font-light"
        style={{
          fontSize: 48,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
        }}
      >
        {title}
      </h2>
      <p
        className="font-sans text-smoke"
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 40,
          maxWidth: 480,
        }}
      >
        {dek}
      </p>
      <div className="flex flex-col gap-[18px]" style={{ maxWidth: 540 }}>
        {children}
      </div>
    </div>
  );
}

function Row({
  two,
  three,
  children,
}: {
  two?: boolean;
  three?: boolean;
  children: React.ReactNode;
}) {
  const cols = three ? '1fr 1fr 1fr' : two ? '1fr 1fr' : '1fr';
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: cols }}>
      {children}
    </div>
  );
}

function ShipChoice({
  title,
  sub,
  price,
  checked,
  onChange,
}: {
  title: string;
  sub: string;
  price: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        border: `1px solid ${checked ? 'var(--color-ink)' : 'var(--color-line)'}`,
      }}
      className="grid items-center cursor-pointer py-5 px-6 gap-5"
      data-testid="ship-choice"
    >
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: 'auto 1fr auto',
          gap: 20,
        }}
      >
        <span
          aria-hidden="true"
          className="w-[14px] h-[14px] border border-ink relative"
          style={{ background: checked ? 'var(--color-ink)' : 'transparent' }}
        />
        <input
          type="radio"
          name="ship"
          checked={checked}
          onChange={onChange}
          className="hidden"
        />
        <div>
          <div className="font-sans text-[15px] font-medium">{title}</div>
          <div className="font-sans text-[12px] text-smoke mt-1">{sub}</div>
        </div>
        <div className="font-sans text-[14px]">{price}</div>
      </div>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between py-[6px] font-sans text-[13px]">
      <span className="text-smoke">{label}</span>
      <span className={muted ? 'text-smoke' : 'text-ink'}>{value}</span>
    </div>
  );
}
