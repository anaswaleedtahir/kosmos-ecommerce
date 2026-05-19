import { notFound } from 'next/navigation';
import { CATEGORIES, getCategory, getProducts } from '@/lib/catalog';
import { CollectionBody } from './CollectionBody';

interface Params {
  cat: string;
}

const ALLOWED = new Set<string>(['all', ...CATEGORIES.map((c) => c.id)]);

export function generateStaticParams() {
  return ['all', ...CATEGORIES.map((c) => c.id)].map((cat) => ({ cat }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cat } = await params;
  if (!ALLOWED.has(cat)) notFound();

  const meta = cat === 'all' ? null : getCategory(cat);
  const heading = meta?.label ?? 'The maison';
  const eyebrow = meta?.eyebrow ?? 'All disciplines';

  return (
    <div className="bg-paper">
      <section
        style={{ paddingTop: 156, paddingBottom: 56 }}
        className="border-b border-line"
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '0 48px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'end',
          }}
        >
          <div>
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-[22px]">
              {eyebrow}
            </div>
            <h1
              className="font-display font-light text-ink m-0"
              style={{ fontSize: 112, lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              {heading}.
            </h1>
          </div>
          <div className="text-right">
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-2">
              {getProducts().filter((p) => cat === 'all' || p.cat === cat).length} pieces
            </div>
          </div>
        </div>
      </section>

      <CollectionBody key={cat} cat={cat} />
    </div>
  );
}
