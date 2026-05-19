import Image from 'next/image';
import Link from 'next/link';
import { CapsLink } from '@kosmos/design/caps-link';
import { JOURNAL } from '@/lib/journal';

export const metadata = {
  title: 'The journal — Kosmos',
  description: 'Quarterly · Long-form · Never urgent.',
};

export default function JournalPage() {
  const [featured, ...rest] = JOURNAL;

  return (
    <div className="bg-paper">
      <section
        style={{ paddingTop: 156, paddingBottom: 64 }}
        className="border-b border-line"
      >
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-[22px]">
            Quarterly · Long-form · Never urgent
          </div>
          <h1
            className="font-display font-light text-ink m-0"
            style={{
              fontSize: 144,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            The journal.
          </h1>
        </div>
      </section>

      <section style={{ padding: '96px 48px', background: 'var(--color-paper)' }}>
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 96,
            alignItems: 'center',
          }}
        >
          <div
            className="relative bg-ash"
            style={{ aspectRatio: '5/6' }}
            aria-hidden="true"
          >
            <Image
              src={featured.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
              {featured.chapter} · {featured.date} · {featured.minutes} min read
            </div>
            <h2
              className="font-display font-light text-ink"
              style={{
                fontSize: 80,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                margin: '0 0 32px',
              }}
            >
              {featured.title.replace(featured.titleItalic, '').trim()}{' '}
              <em>{featured.titleItalic}</em>
            </h2>
            <p
              className="font-sans text-smoke"
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                marginBottom: 40,
                maxWidth: 480,
              }}
            >
              {featured.dek}
            </p>
            <CapsLink href={`/journal/${featured.id}`}>Read the entry</CapsLink>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 48px 160px' }}>
        <div
          style={{ maxWidth: 1440, margin: '0 auto' }}
          className="border-t border-line"
        >
          {rest.map((a) => (
            <Link
              key={a.id}
              href={`/journal/${a.id}`}
              className="grid items-center text-ink py-10 border-b border-line"
              style={{
                gridTemplateColumns: '0.6fr 1.4fr 1fr auto',
                gap: 32,
              }}
            >
              <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke">
                {a.chapter} · {a.date}
              </div>
              <div
                className="font-display font-light tracking-[-0.01em]"
                style={{ fontSize: 36, lineHeight: 1.05 }}
              >
                {a.title.replace(a.titleItalic, '').trim()}{' '}
                <em>{a.titleItalic}</em>
              </div>
              <div className="font-sans text-[14px] leading-[1.6] text-smoke">
                {a.dek}
              </div>
              <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke">
                {a.minutes} min read →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
