import Image from 'next/image';
import { SignInForm } from './SignInForm';

const SIGNIN_IMAGE =
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=80';

export const metadata = {
  title: 'Account — Kosmos',
};

export default function SignInPage() {
  return (
    <div className="bg-paper">
      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '156px 48px 160px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 96,
          alignItems: 'start',
        }}
      >
        <div
          className="relative bg-ash"
          style={{ aspectRatio: '4/5' }}
          aria-hidden="true"
        >
          <Image
            src={SIGNIN_IMAGE}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <div style={{ paddingTop: 24, maxWidth: 440 }}>
          <SignInForm />
        </div>
      </section>
    </div>
  );
}
