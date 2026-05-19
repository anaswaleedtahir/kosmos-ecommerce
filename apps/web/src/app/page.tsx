import Link from "next/link";
import { Editorial } from "@kosmos/design";

const PRODUCT_HREF = "/products/noir-undone";

export default function HomePage() {
  return (
    <div>
      {/* Hero — full-bleed, dark, oversized wordmark */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: 760,
          backgroundColor: "var(--color-ink)",
          backgroundImage:
            "radial-gradient(ellipse at 65% 55%, rgba(120, 70, 30, 0.55) 0%, rgba(10, 10, 10, 0) 55%), linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.92)), url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2200&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          color: "var(--color-cream)",
        }}
      >
        {/* Hairline corners */}
        <div
          style={{ position: "absolute", top: 24, left: 24 }}
          className="font-sans text-[10px] tracking-[0.24em] uppercase text-white/55"
        >
          N° 04 — Eau de parfum
        </div>
        <div
          style={{ position: "absolute", top: 24, right: 24 }}
          className="font-sans text-[10px] tracking-[0.24em] uppercase text-white/55"
        >
          Paris — Composed by H. Vasseur
        </div>

        {/* Oversized wordmark */}
        <h1
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transform: "translate(-50%, -50%)",
            margin: 0,
            fontSize: "clamp(120px, 16vw, 240px)",
            letterSpacing: "0.18em",
            paddingLeft: "0.18em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
          className="font-display font-light text-paper"
        >
          KOSMOS
        </h1>

        {/* Bottom bar */}
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
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/65 mb-[14px]">
              The Black Edition · Mmxxvi
            </div>
            <Link
              href={PRODUCT_HREF}
              style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.01em" }}
              className="font-display font-light text-paper block"
            >
              Noir,
              <br />
              undone.
            </Link>
          </div>

          <div style={{ textAlign: "right", maxWidth: 340 }}>
            <p
              style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}
              className="font-sans text-white/78"
            >
              A scent of cold air and white smoke. Amber lingers at the wrist;
              the rest disappears.
            </p>
            <Link
              href={PRODUCT_HREF}
              className="inline-flex items-center justify-center h-12 px-7 border font-sans text-[13px] font-medium uppercase tracking-[0.18em] bg-transparent text-paper border-white/40 hover:bg-paper hover:text-ink hover:border-paper transition-[background,color,border-color] duration-200"
            >
              Discover the fragrance
            </Link>
          </div>
        </div>
      </section>

      <Editorial href={PRODUCT_HREF} />
    </div>
  );
}
