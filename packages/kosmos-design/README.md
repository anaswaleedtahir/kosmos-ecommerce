# Kosmos Design System

A luxury cosmetics house — **lipsticks, skincare, and fragrance**. Editorial monochrome identity inspired by the visual languages of Tom Ford Beauty and Celine: cream and ink‑black palette, Didone serif display paired with a neutral grotesque for body copy, generous negative space, and dramatic full‑color product photography against dark styled backdrops.

This system covers two surfaces:

- **Web storefront** — homepage and product detail page (PDP)
- **Mobile storefront** — same flows, narrower canvas

## Sources

No codebase, Figma file, or design files were provided. Everything in this system was derived from the brief and standard luxury‑beauty editorial conventions. **All visual assumptions below should be reviewed before any of this is used in production.**

## Index

```
README.md                  ← you are here
colors_and_type.css        Design tokens (CSS variables) + @font-face
fonts/                     Webfonts (Google Fonts mirror — flagged below)
assets/                    Logos, marks, photography placeholders
preview/                   Design System cards (registered for review)
ui_kits/
  web/                     Desktop storefront — Homepage + PDP
  mobile/                  Mobile storefront — Homepage + PDP
SKILL.md                   Cross‑compatible Agent Skill manifest
```

---

## Content fundamentals

The voice is **editorial, restrained, sensual**. Kosmos writes the way a perfume house writes — short, declarative, image‑first. Copy never sells; it evokes.

**Tone & cadence**

- Sentences are short. Fragments are common. Periods do heavy lifting.
- The brand is **third‑person omniscient** about its own products ("A scent of cold air and white smoke."). It uses **second person sparingly** ("On your skin, it warms.") and **almost never first person**.
- No exclamation marks. No questions to the reader.
- No emoji. Ever.
- No abbreviations in display copy — "and" not "&" except inside the wordmark.

**Casing**

- Display headlines: **lowercase or full caps** with tracked-tight letterspacing. Title Case is reserved for product names and section labels.
- Navigation labels: **UPPERCASE**, generously letter‑spaced (≈0.18em).
- Body: Sentence case. Never SHOUTY UPPERCASE in a paragraph.

**Numerals**

- Prefer **oldstyle figures** in body copy where the typeface supports them; **lining figures** in price tags and size selectors.
- Prices: `€ 220` with a hair space — never `$220.00` unless the store is US‑set. No `.00` cents.

**Specific examples**

| Context | Bad | Good |
|---|---|---|
| Product description | "Our amazing new fragrance is here!" | "A scent of cold air and white smoke." |
| CTA | "BUY NOW – LIMITED TIME!" | "Add to bag" |
| Section header | "Featured Products 🔥" | "The Black Edition" |
| Empty bag | "Your cart is empty :(" | "The bag is empty." |
| Newsletter | "Sign up for deals!" | "Receive the journal." |

**Vibe**

Quiet luxury. The reader is treated as someone who already knows. Never enthusiastic, never apologetic, never urgent. Time is implied to be on the brand's side.

---

## Visual foundations

### Palette

Strictly monochrome, **cool porcelain over warm cream**. Two dark anchors and two paper anchors do almost everything; three neutrals fill in between. The system was pulled cooler in v2 — less honey, more porcelain — and the dark end was widened with `--graphite` so feature sections can run dark without flattening into a single ink block.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | Primary type, dark backdrops, buttons, footers |
| `--graphite` | `#25221E` | Softer ink — cards on ink, secondary dark surfaces |
| `--ash` | `#161310` | Deepest warm dark — photography backdrop only |
| `--smoke` | `#6F6962` | Muted body / secondary type on paper |
| `--stone` | `#B6AFA1` | Mid neutral — quiet dividers, secondary surfaces, dead air |
| `--bone` | `#D5CEBE` | Alt paper surface (cooler than before) |
| `--paper` | `#E8E4D8` | Primary page background — cool porcelain |
| `--snow` | `#F2EEE4` | Highest paper (modal sheets, drawers) |
| `--line` | `#C7C0AF` | Hairlines on paper |

`--cream` is preserved as a legacy alias pointing at `--paper`. There is no accent color. No reds, golds, or blush pinks. Color enters the system **only through product photography** — a lipstick bullet, a fragrance liquid, the glow of skin against ash. The UI itself never tints.

**Surface distribution.** A Kosmos page is not a sea of paper. Feature sections — the hero, the editorial story, the footer — should run on `--ink` or `--graphite` more often than not. Paper is for catalog, PDP, account, and reading. As a rule of thumb, at least one of the first two scrolls on any landing surface should be dark.

### Typography

- **Display:** Bodoni Moda — a Didone with strong thick/thin contrast. Used in Light (300) and Regular (400). Display sizes always set with **tight tracking** (`letter-spacing: -0.02em` for huge sizes, neutral at headline scale).
- **UI / Body:** Inter — a neutral grotesque, used in Light (300), Regular (400), and Medium (500). Body is set small (15–16px) with **generous line‑height (1.6–1.7)**.
- **Mono / detail:** None. Spec text uses the body face at small caps tracking.

> **Substitution flag.** Ideal pairing is **Söhne** or **Neue Haas Grotesk Display** for the sans. **Inter** is the closest free substitute. If you have access to Söhne, please drop the `.woff2` files into `fonts/` and update `colors_and_type.css`.

### Spacing & rhythm

A modular scale built on **8px**, with a **24px column gutter** at web and **16px gutter** at mobile.

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 40px
--space-7: 64px
--space-8: 96px
--space-9: 160px   ← used between editorial sections
```

Editorial sections breathe. Vertical padding between major page sections is **at least 96px** on web, **64px** on mobile. Hero blocks routinely set 160–240px of vertical air.

### Backgrounds

- **No gradients. Anywhere.**
- **No textures, patterns, or grain.** Photography carries all surface variation.
- Page background is `--cream`. Dark sections use solid `--ink` or `--ash`.
- Hero images are **full‑bleed** at desktop, full‑width on mobile. Product photography is shot against dark, styled backdrops with a single light source — never a white seamless.

### Borders, corners, shadows

- **Corner radius is always `0`.** No exceptions. Buttons, inputs, image frames, modals — all hard‑edged.
- **No box shadows, no drop shadows, no inset shadows.** Elevation is communicated through whitespace and value contrast, not depth effects.
- **Hairlines** are `1px solid var(--line)` on cream surfaces, `1px solid rgba(255,255,255,0.18)` on ink.
- Dividers between sections are 1px hairlines or pure negative space.

### Buttons

- **Primary:** solid `--ink`, cream text, UPPERCASE, letterspaced. 1px border same as fill. No fill on hover — instead the **fill drops to transparent and the border + text remain**, with a 200ms ease.
- **Secondary:** transparent fill, `--ink` text, 1px ink border. Hover inverts (fill becomes ink, text becomes cream).
- **Tertiary / link:** underlined small caps, 1px underline offset 4px. Hover: underline thickens to 2px.
- Buttons are full‑height rectangles (48px web, 52px mobile). They never wrap.

### Hover & press

- Hover is **invert or fade**, never colorize. Links fade to 60% opacity over 150ms. Buttons invert ink↔cream over 200ms with `cubic-bezier(0.2, 0, 0, 1)`.
- Press = no transform, just an opacity dip to 0.85 for 80ms. **No scale, no bounce.**
- Image hover (PDP thumbs, editorial tiles): a 600ms `ease-out` crop expansion (`transform: scale(1.03)`). Subtle.

### Animation

- Motion is **slow and editorial**. Default duration **400ms** for layout, **150–200ms** for state.
- Easing is always one of: `cubic-bezier(0.2, 0, 0, 1)` (ease‑out emphasized) or `cubic-bezier(0.4, 0, 0.6, 1)` (sine).
- **No bounces, no springs, no rotation.**
- Page transitions cross‑fade. Hero text often enters with a 700ms vertical 8px translate + fade.

### Transparency & blur

- Used sparingly. The fixed top navigation may sit on a `backdrop-filter: blur(12px)` over cream at 78% opacity once the user has scrolled past the hero. Otherwise transparency is reserved for image overlays (an ink scrim at 0.35 opacity behind hero headlines on full‑bleed photography).

### Layout rules

- Max content width: **1440px**; gutter outside that.
- Primary type column for editorial prose: **560px max**.
- Navigation is **fixed** at the top of the viewport. It is transparent over the hero and gains a `--cream` background once scrolled.
- No sticky promo bars, no announcement bars, no chat bubbles, no cookie banners (handled separately).
- Footer is single‑column, left‑aligned, minimal: wordmark, address, three link clusters, set in small caps.

### Imagery

- **Warm, low‑key, single‑source lighting.** Product photography lives on `--ash` to near‑black backdrops. Skin tones are warm but not over‑saturated.
- No bright primary colors in imagery. The only "color" allowed is the product itself: a deep red lipstick, an amber fragrance, glistening cream.
- No grain or film simulation. Clean digital, sharp focal point, generous negative space around the subject.
- **No lifestyle photography with smiling models facing camera.** Faces, when present, are turned, cropped, or in profile.

### Cards & containers

There are barely any. Editorial layout favors **the page itself** as the container. When a "card" is required (e.g. a product tile on a collection grid), it is:

- Background: `--cream` or `--bone`
- Border: none (or a 1px `--line` hairline on cream sections)
- Radius: 0
- Shadow: none
- Padding: 24px

### Iconography

See **ICONOGRAPHY** below.

---

## Iconography

Kosmos uses **almost no icons**. The brand favors words over symbols.

- **Navigation:** the cart is the word `BAG`; search is the word `SEARCH`; account is `ACCOUNT`. No glyphs.
- **Where icons are unavoidable** (close, back, plus/minus for quantity, social icons in the footer), they are **1px stroke, monoline, 16×16 viewbox, currentColor**, drawn from **Lucide** (which ships as `currentColor` strokes at the right weight).
- **No emoji.** Anywhere.
- **No filled glyphs.** No two‑tone icons. No colored icons.

> **Substitution flag.** Lucide is loaded from `unpkg` in this kit as a CDN fallback. If you have a hand‑drawn icon set, drop SVGs into `assets/icons/` and they will override the Lucide imports.

---

## Caveats & open questions

This system was built from a written brief alone. The following decisions are **defaults** that should be confirmed:

1. **Font substitution.** Display = Bodoni Moda (Google) standing in for Didot/Bodoni. Body = Inter (Google) standing in for Söhne / Neue Haas Grotesk. Provide real `.woff2` files and we'll swap.
2. **Wordmark.** Drawn here as set type ("KOSMOS" in Bodoni Moda, tracked). If there is a real logo asset, replace `assets/wordmark.svg`.
3. **Photography.** Hero images are linked to placeholder Unsplash URLs in the UI kits. They should be replaced with real campaign photography.
4. **Iconography.** Lucide via CDN, monoline, with hand‑rolled fallbacks for cart/account/search wordmarks.
5. **No accent color** was assumed. If Kosmos has a single signature accent (e.g. a house red), it has not been added — and the system is currently designed to not need one.
