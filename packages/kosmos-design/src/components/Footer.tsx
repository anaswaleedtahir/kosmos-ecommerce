const LINKS = [
  { h: 'Shop', items: ['Fragrance', 'Skin', 'Lipstick', 'The Black Edition'] },
  { h: 'Maison', items: ['The house', 'Boutiques', 'The journal', 'Press'] },
  { h: 'Care', items: ['Contact', 'Shipping', 'Returns', 'Engraving'] },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-snow">
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '96px 48px 56px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: 64,
        }}
      >
        <div>
          <div className="font-display font-light text-[40px] tracking-[0.22em] pl-[0.22em] leading-none mb-7">
            KOSMOS
          </div>
          <address className="font-sans not-italic text-[13px] leading-[1.7] text-white/70">
            8, rue du Faubourg
            <br />
            Saint‑Honoré · Paris VIII
            <br />
            <br />
            Open daily, 11 – 19h
          </address>
        </div>

        {LINKS.map((col) => (
          <div key={col.h}>
            <p className="font-sans text-[11px] tracking-[0.18em] uppercase m-0 mb-[18px] font-medium max-w-none" style={{ color: "var(--color-cream)" }}>
              {col.h}
            </p>
            {col.items.map((item) => (
              <a
                key={item}
                href="#"
                className="block font-sans text-[14px] text-snow mb-3"
              >
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '28px 48px',
          borderTop: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
        className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/55"
      >
        <span>© MMXXVI Kosmos — Maison de beauté</span>
        <span className="flex gap-7">
          <a href="#" className="text-inherit">Privacy</a>
          <a href="#" className="text-inherit">Terms</a>
          <a href="#" className="text-inherit">Français</a>
        </span>
      </div>
    </footer>
  );
}
