/* eslint-disable */
// Kosmos — small interaction primitives

const { useState } = React;

function Btn({ children, variant = "primary", block, onClick, style }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 28px",
    border: "1px solid var(--ink)",
    borderRadius: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    cursor: "pointer",
    transition: "background 200ms cubic-bezier(0.2,0,0,1), color 200ms cubic-bezier(0.2,0,0,1)",
    whiteSpace: "nowrap",
    width: block ? "100%" : "auto",
  };
  const variants = {
    primary: { background: "var(--ink)", color: "var(--cream)" },
    secondary: { background: "transparent", color: "var(--ink)" },
    inverse: { background: "var(--cream)", color: "var(--ink)", borderColor: "var(--cream)" },
    ghostOnInk: { background: "transparent", color: "var(--cream)", borderColor: "rgba(255,255,255,0.4)" },
  };
  const [hover, setHover] = useState(false);
  const hoverStyle =
    hover
      ? variant === "primary"
        ? { background: "transparent", color: "var(--ink)" }
        : variant === "secondary"
        ? { background: "var(--ink)", color: "var(--cream)" }
        : variant === "inverse"
        ? { background: "transparent", color: "var(--cream)", borderColor: "var(--cream)" }
        : { background: "var(--cream)", color: "var(--ink)", borderColor: "var(--cream)" }
      : {};
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
    >
      {children}
    </button>
  );
}

function SizePill({ label, price, selected, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        height: 48,
        padding: "0 22px",
        background: "transparent",
        border: `1px solid ${selected ? "var(--ink)" : "var(--line)"}`,
        borderRadius: 0,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: disabled ? "var(--smoke)" : "var(--ink)",
        cursor: disabled ? "not-allowed" : "pointer",
        textDecoration: disabled ? "line-through" : "none",
        transition: "border-color 200ms cubic-bezier(0.2,0,0,1)",
        display: "inline-flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--smoke)", fontSize: 12, letterSpacing: "0.04em", textTransform: "none" }}>{price}</span>
    </button>
  );
}

function CapsLink({ children, onClick, color = "var(--ink)" }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color,
        borderBottom: `1px solid ${color}`,
        paddingBottom: 4,
        display: "inline-block",
        transition: "opacity 150ms cubic-bezier(0.2,0,0,1)",
      }}
    >
      {children}
    </a>
  );
}

Object.assign(window, { Btn, SizePill, CapsLink });
