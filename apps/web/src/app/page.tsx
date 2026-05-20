import Image from "next/image";
import Link from "next/link";
import { preload } from "react-dom";
import { CapsLink } from "@kosmos/design/caps-link";
import { ProductTile } from "@/components/ProductTile";
import { getProducts } from "@/lib/catalog-api";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2200&q=80";

const HERO_PRODUCT_HREF = "/products/noir-undone";

const CATEGORY_TILES = [
  {
    cat: "fragrance",
    title: "Fragrance",
    count: 12,
    img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cat: "skin",
    title: "Skin",
    count: 8,
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cat: "lipstick",
    title: "Lipstick",
    count: 6,
    img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

const ARRIVAL_IDS = ["noir-undone", "rouge-mat", "huile-visage"] as const;

const BOUTIQUE_IMAGE =
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=80";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=80";

export default async function HomePage() {
  preload(HERO_IMAGE, { as: "image" });

  const allProducts = await getProducts();
  const arrivals = ARRIVAL_IDS.map((id) => allProducts.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => p !== undefined,
  );

  return (
    <div>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: 760,
          backgroundColor: "var(--color-ink)",
          backgroundImage: `radial-gradient(ellipse at 65% 55%, rgba(120, 70, 30, 0.55) 0%, rgba(10, 10, 10, 0) 55%), linear-gradient(rgba(10,10,10,0.55), rgba(10,10,10,0.92)), url('${HERO_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          color: "var(--color-cream)",
        }}
      >
        <div
          style={{ position: "absolute", top: 110, left: 48 }}
          className="font-sans text-[10px] tracking-[0.24em] uppercase text-white/55"
        >
          N° 04 — Eau de parfum
        </div>
        <div
          style={{ position: "absolute", top: 110, right: 48 }}
          className="font-sans text-[10px] tracking-[0.24em] uppercase text-white/55"
        >
          Paris — Composed by H. Vasseur
        </div>

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
            color: "white",
          }}
          className="font-display font-light"
        >
          KOSMOS
        </h1>

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
              href={HERO_PRODUCT_HREF}
              transitionTypes={["nav-forward"]}
              style={{ fontSize: 64, lineHeight: 1, letterSpacing: "-0.01em" }}
              className="font-display font-light text-paper block"
            >
              Noir,
              <br />
              <em>undone.</em>
            </Link>
          </div>

          <div style={{ textAlign: "right", maxWidth: 340 }}>
            <p
              style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: "var(--color-cream)" }}
              className="font-sans"
            >
              A scent of cold air and white smoke. Amber lingers at the wrist;
              the rest disappears.
            </p>
            <Link
              href={HERO_PRODUCT_HREF}
              transitionTypes={["nav-forward"]}
              className="inline-flex items-center justify-center h-12 px-7 border font-sans text-[13px] font-medium uppercase tracking-[0.18em] bg-transparent text-paper border-white/40 hover:bg-paper hover:text-ink hover:border-paper transition-[background,color,border-color] duration-200 motion-reduce:transition-none"
            >
              Discover the Fragrance
            </Link>
          </div>
        </div>
      </section>

      {/* THREE CATEGORY STRIP */}
      <section style={{ background: "var(--color-ash)", color: "var(--color-cream)" }}>
        <div style={{ padding: "120px 48px 64px", textAlign: "center" }}>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 mb-7">
            Three disciplines · One house
          </div>
          <h2
            className="font-display font-light"
            style={{
              fontSize: 88,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              margin: "0 auto",
              maxWidth: 900,
              color: "var(--color-cream)",
            }}
          >
            Fragrance, skin,
            <br />
            <em>and a quiet red.</em>
          </h2>
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {CATEGORY_TILES.map((c, i) => (
            <Link
              key={c.cat}
              href={`/collection/${c.cat}`}
              transitionTypes={["nav-forward"]}
              className="relative text-paper overflow-hidden block"
              style={{
                height: 640,
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.18)" : "none",
              }}
            >
              <Image
                src={c.img}
                alt={`${c.title} collection`}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(rgba(10,10,10,0.45), rgba(10,10,10,0.7))",
                }}
              />
              <div
                className="absolute top-8 left-8 font-sans text-[10px] tracking-[0.24em] uppercase text-white/60"
              >
                {String(i + 1).padStart(2, "0")} · {c.count} pieces
              </div>
              <div className="absolute bottom-10 left-8 right-8">
                <h3
                  className="font-display font-light m-0"
                  style={{
                    fontSize: 56,
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                    color: "var(--color-cream)",
                  }}
                >
                  {c.title}
                </h3>
                <div className="mt-[18px] font-sans text-[11px] tracking-[0.22em] uppercase border-b border-white/50 pb-1 inline-block">
                  Enter the collection
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL — Chapter I */}
      <section style={{ background: "var(--color-paper)", padding: "160px 48px" }}>
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
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-8">
              The journal — Chapter I
            </div>
            <h2
              className="font-display font-light text-ink"
              style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: "-0.02em", margin: "0 0 36px" }}
            >
              On the
              <br />
              art of
              <br />
              <em>disappearing.</em>
            </h2>
            <p
              className="font-sans text-smoke"
              style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 440, marginBottom: 36 }}
            >
              A fragrance is not what you wear. It is what remains after you have
              left the room. We spent four winters composing a perfume that knows
              when to fall quiet.
            </p>
            <CapsLink href="/journal/disappearing">Read the entry</CapsLink>
          </div>
          <div
            className="relative bg-ash"
            style={{ aspectRatio: "4/5" }}
            aria-hidden="true"
          >
            <Image
              src={EDITORIAL_IMAGE}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section
        style={{
          background: "var(--color-graphite)",
          color: "var(--color-cream)",
          padding: "120px 48px",
        }}
      >
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div className="flex justify-between items-end mb-14">
            <h2
              className="font-display font-light m-0"
              style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--color-cream)" }}
            >
              The arrivals,
              <br />
              <em>spring MMXXVI.</em>
            </h2>
            <CapsLink href="/collection/all" color="var(--color-cream)">
              See everything
            </CapsLink>
          </div>
          <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {arrivals.map((p) => (
              <ProductTile
                key={p.id}
                product={p}
                variant="ink"
                showStockBadge={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BOUTIQUE */}
      <section style={{ background: "var(--color-bone)", padding: "120px 48px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 96,
            alignItems: "center",
          }}
        >
          <div>
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-7">
              The boutique · Paris VIII
            </div>
            <h2
              className="font-display font-light text-ink"
              style={{ fontSize: 56, lineHeight: 1.04, letterSpacing: "-0.02em", margin: "0 0 28px" }}
            >
              A house,
              <br />
              <em>not a brand.</em>
            </h2>
            <p
              className="font-sans text-smoke"
              style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}
            >
              8, rue du Faubourg Saint-Honoré. Open daily, 11 to 19h. Fittings by
              appointment. Engraving offered with every fragrance.
            </p>
            <CapsLink href="#">Book a fitting</CapsLink>
          </div>
          <div
            className="relative"
            style={{ aspectRatio: "16/10" }}
            aria-hidden="true"
          >
            <Image
              src={BOUTIQUE_IMAGE}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(rgba(15,12,9,0.2), rgba(15,12,9,0.2))",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
