/* eslint-disable */
function Editorial({ onEnterProduct }) {
  return (
    <section
      style={{
        background: "var(--cream)",
        padding: "160px 48px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 96,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--smoke)",
              marginBottom: 32,
            }}
          >
            The journal — Chapter I
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: 72,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: "0 0 36px",
              color: "var(--ink)",
            }}
          >
            On the<br/>art of<br/><em style={{ fontStyle: "italic" }}>disappearing.</em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: 1.75,
              color: "var(--smoke)",
              maxWidth: 440,
              marginBottom: 36,
            }}
          >
            A fragrance is not what you wear. It is what remains after you have
            left the room. We spent four winters composing a perfume that knows
            when to fall quiet.
          </p>
          <CapsLink onClick={onEnterProduct}>Read the entry</CapsLink>
        </div>
        <div
          style={{
            aspectRatio: "4/5",
            background:
              "url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=80') center/cover no-repeat",
          }}
        />
      </div>
    </section>
  );
}

Object.assign(window, { Editorial });
