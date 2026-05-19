/* eslint-disable */
const { useEffect, useState } = React;

function Nav({ variant = "cream", onLogo, onCategory }) {
  // variant: "cream" | "dark" (transparent over photography)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = variant === "dark" && !scrolled;
  const fg = overHero ? "var(--cream)" : "var(--ink)";
  const bg = overHero ? "transparent" : "rgba(244, 239, 230, 0.92)";
  const borderColor = overHero ? "transparent" : "var(--line)";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: bg,
        backdropFilter: overHero ? "none" : "blur(12px)",
        WebkitBackdropFilter: overHero ? "none" : "blur(12px)",
        borderBottom: `1px solid ${borderColor}`,
        color: fg,
        transition: "background 300ms cubic-bezier(0.2,0,0,1), color 300ms cubic-bezier(0.2,0,0,1), border-color 300ms cubic-bezier(0.2,0,0,1)",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 48px",
          height: 76,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 36 }}>
          {["Fragrance", "Skin", "Lipstick", "The Maison"].map((c) => (
            <a
              key={c}
              href="#"
              onClick={(e) => { e.preventDefault(); onCategory && onCategory(c); }}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "inherit",
              }}
            >
              {c}
            </a>
          ))}
        </div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onLogo && onLogo(); }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: 28,
            letterSpacing: "0.34em",
            color: "inherit",
            paddingLeft: "0.34em",
          }}
        >
          KOSMOS
        </a>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 24 }}>
          {["Search", "Account", "Bag (0)"].map((c) => (
            <a
              key={c}
              href="#"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "inherit",
              }}
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Nav });
