import Link from 'next/link';

export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-line">
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 48px',
          height: 76,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        <Link
          href="/"
          className="font-sans text-[11px] tracking-[0.22em] uppercase text-ink border-b border-ink pb-[2px] justify-self-start"
        >
          ← Return to the maison
        </Link>
        <Link
          href="/"
          className="font-display font-light text-ink"
          style={{
            fontSize: 22,
            letterSpacing: '0.34em',
            paddingLeft: '0.34em',
          }}
        >
          KOSMOS
        </Link>
        <span className="justify-self-end font-sans text-[11px] tracking-[0.22em] uppercase text-smoke">
          Checkout · secured
        </span>
      </div>
    </header>
  );
}
