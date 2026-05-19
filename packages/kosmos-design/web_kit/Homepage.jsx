/* eslint-disable */
function Homepage({ onEnterProduct }) {
  return (
    <div data-screen-label="Web · Homepage">
      {/* Hero — full bleed, oversized wordmark, single product, minimal copy */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: 760,
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 65% 55%, rgba(120, 70, 30, 0.55) 0%, rgba(10, 10, 10, 0) 55%), linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.92)), url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2200&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "var(--cream)",
          overflow: "hidden",
        }}
      >
        {/* Oversized wordmark */}
        <h1
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transform: "translate(-50%, -50%)",
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(120px, 16vw, 240px)",
            letterSpacing: "0.18em",
            paddingLeft: "0.18em",
            lineHeight: 1,
            color: "var(--cream)",
            whiteSpace: "nowrap",
          }}
        >
          KOSMOS
        </h1>

        {/* Bottom bar — minimal copy */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 56,
            padding: "0 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "var(--cream)",
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 14,
              }}
            >
              The Black Edition · Mmxxvi
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onEnterProduct(); }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: 44,
                lineHeight: 1.05,
                color: "var(--cream)",
                letterSpacing: "-0.01em",
                display: "block",
                textDecoration: "none",
              }}
            >
              Noir,<br />undone.
            </a>
          </div>
          <div style={{ textAlign: "right", maxWidth: 340 }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.78)",
                marginBottom: 20,
              }}
            >
              A scent of cold air and white smoke. Amber lingers at the wrist;
              the rest disappears.
            </p>
            <Btn variant="ghostOnInk" onClick={onEnterProduct}>Discover the fragrance</Btn>
          </div>
        </div>

        {/* Hairline corners */}
        <div style={{ position: "absolute", top: 24, left: 24, fontFamily: "var(--font-sans)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          N° 04 — Eau de parfum
        </div>
        <div style={{ position: "absolute", top: 24, right: 24, fontFamily: "var(--font-sans)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          Paris — Composed by H. Vasseur
        </div>
      </section>

      {/* Editorial — one section below the fold */}
      <Editorial onEnterProduct={onEnterProduct} />
    </div>
  );
}

Object.assign(window, { Homepage });
