/* eslint-disable */
const { useState: useStateP } = React;

function ProductDetail({ onBack }) {
  const [size, setSize] = useStateP("50");
  const priceMap = { "30": "€ 140", "50": "€ 220", "100": "€ 320" };

  return (
    <div data-screen-label="Web · PDP — Noir, undone" style={{ background: "var(--cream)" }}>
      {/* Breadcrumb */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "112px 48px 0",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--smoke)",
        }}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ color: "inherit" }}>Maison</a>
        <span style={{ margin: "0 12px" }}>—</span>
        <a href="#" style={{ color: "inherit" }}>Fragrance</a>
        <span style={{ margin: "0 12px" }}>—</span>
        <span style={{ color: "var(--ink)" }}>Noir, undone</span>
      </div>

      <section
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "56px 48px 160px",
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 120,
          alignItems: "start",
        }}
      >
        {/* Image */}
        <div
          style={{
            background:
              "linear-gradient(rgba(15,12,9,0.15), rgba(15,12,9,0.15)), url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
            aspectRatio: "4/5",
            backgroundColor: "var(--ash)",
          }}
        />

        {/* Right column */}
        <div style={{ paddingTop: 40, position: "sticky", top: 120 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--smoke)",
              marginBottom: 28,
            }}
          >
            Fragrance · N° 04
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: 88,
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              margin: "0 0 40px",
              color: "var(--ink)",
            }}
          >
            Noir,<br/><em style={{ fontStyle: "italic" }}>undone.</em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: 1.75,
              color: "var(--smoke)",
              maxWidth: 420,
              margin: "0 0 48px",
            }}
          >
            A scent of cold air and white smoke. Amber, leather, and a quiet
            trace of frankincense long after the room is empty. On the skin,
            it warms.
          </p>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--smoke)",
                marginBottom: 14,
              }}
            >
              Volume
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <SizePill label="30 ml" price="€ 140" selected={size === "30"} onClick={() => setSize("30")} />
              <SizePill label="50 ml" price="€ 220" selected={size === "50"} onClick={() => setSize("50")} />
              <SizePill label="100 ml" price="€ 320" selected={size === "100"} onClick={() => setSize("100")} />
              <SizePill label="200 ml" price="sold out" disabled />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 300, letterSpacing: "0.04em" }}>
              {priceMap[size]}
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--smoke)" }}>
              Eau de parfum · {size} ml
            </span>
          </div>

          <Btn block>Add to bag — {priceMap[size]}</Btn>

          <div
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: "1px solid var(--line)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              lineHeight: 1.8,
              color: "var(--smoke)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 10 }}>
              <span style={{ color: "var(--ink)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>Top</span>
              <span>Bergamot · pink pepper · cold air</span>
              <span style={{ color: "var(--ink)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>Heart</span>
              <span>Iris · leather · smoked tea</span>
              <span style={{ color: "var(--ink)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>Base</span>
              <span>Amber · oud · frankincense</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ProductDetail });
