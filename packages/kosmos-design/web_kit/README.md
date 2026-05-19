# Kosmos — Web UI Kit

Pixel‑accurate recreation of the desktop storefront. Two screens are wired up:

- **Homepage** — full‑bleed hero (oversized wordmark + product), 4‑item top nav, one editorial section, footer.
- **Product Detail Page (PDP)** — large product image left, generous whitespace right, name + short poetic description, price, size selector, single primary CTA.

Open `index.html` to navigate. Click **NOIR, UNDONE** on the homepage to enter the PDP. Click the wordmark to return.

## Files

- `index.html` — entry point. Loads React + Babel and mounts `<App>` from `App.jsx`.
- `App.jsx` — route shell (manages `home` / `product` state).
- `Nav.jsx` — fixed top navigation. Transparent over hero on `dark` variant; cream below.
- `Footer.jsx` — ink footer block.
- `Homepage.jsx` — hero + editorial section.
- `ProductDetail.jsx` — PDP layout, size selector state, CTA.
- `Editorial.jsx` — the single "below the fold" editorial block.
- `controls.jsx` — `<Btn>` and `<SizePill>` primitives.

## Conventions

- All radii are 0. All shadows are none. All hairlines are 1px.
- Buttons invert fill ↔ border on hover (200ms ease‑out).
- Photography uses warm low‑key Unsplash placeholders; replace with real campaign imagery.
