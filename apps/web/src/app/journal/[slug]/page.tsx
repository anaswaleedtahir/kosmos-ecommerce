import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JOURNAL, getArticle, getNextArticle } from '@/lib/journal';

export function generateStaticParams() {
  return JOURNAL.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  return {
    title: a ? `${a.title} — Kosmos` : 'Kosmos',
    description: a?.dek,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const next = getNextArticle(article.id);

  return (
    <div className="bg-paper">
      <section
        className="relative overflow-hidden text-paper"
        style={{ height: 640, marginTop: 76 }}
      >
        <Image
          src={article.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.65))',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            padding: '64px 48px',
            maxWidth: 1440,
            margin: '0 auto',
          }}
        >
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/70 mb-6">
            The journal · {article.chapter} · {article.date}
          </div>
          <h1
            className="font-display font-light text-paper m-0"
            style={{
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {article.title.replace(article.titleItalic, '').trim()}{' '}
            <em>{article.titleItalic}</em>
          </h1>
        </div>
      </section>

      <section style={{ padding: '120px 48px' }}>
        <article style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-8 flex justify-between">
            <span>Written by {article.author}</span>
            <span>{article.minutes} minute read</span>
          </div>
          <p
            className="font-display font-light text-ink max-w-none"
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              marginBottom: 48,
            }}
          >
            {article.dek}
          </p>
          {article.body.map((p, i) => (
            <p
              key={i}
              className="font-sans text-ink max-w-none"
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              {p}
            </p>
          ))}

          <div
            className="mt-20 pt-7 border-t border-line flex justify-between items-center"
          >
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke">
              Next — {next.chapter}
            </div>
            <Link
              href={`/journal/${next.id}`}
              className="font-display font-light tracking-[-0.01em] text-ink"
              style={{ fontSize: 32 }}
            >
              {next.title}
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
