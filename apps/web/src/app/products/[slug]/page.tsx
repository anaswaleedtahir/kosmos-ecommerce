import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CapsLink } from '@kosmos/design/caps-link';
import { getCategory } from '@/lib/catalog';
import { getProduct, getRelated } from '@/lib/catalog-api';
import { ProductTile } from '@/components/ProductTile';
import { PDPClient } from './PDPClient';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.cat);
  const related = await getRelated(product);

  return (
    <div className="bg-paper">
      <nav
        aria-label="Breadcrumb"
        style={{ maxWidth: 1440, margin: '0 auto', padding: '112px 48px 0' }}
        className="font-sans text-[11px] tracking-[0.18em] uppercase text-smoke"
      >
        <Link href="/" className="text-inherit">
          Maison
        </Link>
        <span className="mx-3">—</span>
        <Link
          href={`/collection/${product.cat}`}
          className="text-inherit"
          transitionTypes={['nav-back']}
        >
          {category.label}
        </Link>
        <span className="mx-3">—</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <PDPClient product={product} />

      <section style={{ background: 'var(--color-bone)', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex justify-between items-end mb-12">
            <h2
              className="font-display font-light m-0"
              style={{
                fontSize: 48,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              The rest of the
              <br />
              <em>{category.label.toLowerCase()}</em>.
            </h2>
            <CapsLink href={`/collection/${product.cat}`}>
              See the collection
            </CapsLink>
          </div>
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
          >
            {related.map((r) => (
              <ProductTile key={r.id} product={r} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
