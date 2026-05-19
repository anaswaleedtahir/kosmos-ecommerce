import { CapsLink } from './CapsLink';

interface EditorialProps {
  href?: string;
}

export function Editorial({ href = '#' }: EditorialProps) {
  return (
    <section style={{ background: 'var(--color-paper)', padding: '160px 48px' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 96,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-8">
            The journal — Chapter I
          </div>
          <h2
            className="font-display font-light text-ink"
            style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: '-0.02em', margin: '0 0 36px' }}
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
          <CapsLink href={href}>Read the entry</CapsLink>
        </div>

        <div
          style={{
            aspectRatio: '4/5',
            background:
              "url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=80') center/cover no-repeat",
          }}
        />
      </div>
    </section>
  );
}
