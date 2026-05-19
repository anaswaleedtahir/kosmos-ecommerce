/* eslint-disable */
function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "var(--cream)" }}>
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "96px 48px 56px",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 64,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: 40,
              letterSpacing: "0.22em",
              paddingLeft: "0.22em",
              lineHeight: 1,
              marginBottom: 28,
            }}
          >
            KOSMOS
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
            8, rue du Faubourg<br />
            Saint‑Honoré · Paris VIII<br />
            <br />
            Open daily, 11 – 19h
          </div>
        </div>
        {[
          { h: "Shop", items: ["Fragrance", "Skin", "Lipstick", "The Black Edition"] },
          { h: "Maison", items: ["The house", "Boutiques", "The journal", "Press"] },
          { h: "Care", items: ["Contact", "Shipping", "Returns", "Engraving"] },
        ].map((col) => (
          <div key={col.h}>
            <h6
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 18px",
                fontWeight: 500,
              }}
            >
              {col.h}
            </h6>
            {col.items.map((i) => (
              <a
                key={i}
                href="#"
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--cream)",
                  marginBottom: 12,
                  transition: "opacity 150ms cubic-bezier(0.2,0,0,1)",
                }}
              >
                {i}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "28px 48px",
          borderTop: "1px solid rgba(255,255,255,0.18)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        <span>© MMXXVI Kosmos — Maison de beauté</span>
        <span style={{ display: "flex", gap: 28 }}>
          <a href="#" style={{ color: "inherit" }}>Privacy</a>
          <a href="#" style={{ color: "inherit" }}>Terms</a>
          <a href="#" style={{ color: "inherit" }}>Français</a>
        </span>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
