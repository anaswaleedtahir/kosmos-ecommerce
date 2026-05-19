'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@kosmos/design/btn';
import { Field } from '@kosmos/design/field';

type Mode = 'signin' | 'create';

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke mb-6">
        Account
      </div>
      <h1
        className="font-display font-light"
        style={{
          fontSize: 72,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: '0 0 28px',
        }}
      >
        {mode === 'signin' ? (
          <>
            Welcome <em>back.</em>
          </>
        ) : (
          <>
            A new <em>address.</em>
          </>
        )}
      </h1>
      <p
        className="font-sans text-smoke"
        style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}
      >
        {mode === 'signin'
          ? 'Your orders, your wardrobe of scents, your engraving preferences — all here.'
          : "Begin a correspondence with the house. You'll receive the journal and nothing else."}
      </p>

      <div className="flex flex-col gap-4">
        {mode === 'create' && (
          <Field
            label="Full name"
            value={name}
            onChange={setName}
            autoComplete="name"
            required
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={pw}
          onChange={setPw}
          autoComplete={
            mode === 'signin' ? 'current-password' : 'new-password'
          }
          required
        />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Btn type="submit" block>
          {mode === 'signin' ? 'Sign in' : 'Create the account'}
        </Btn>
        <div className="font-sans text-[12px] text-smoke">
          {mode === 'signin' ? 'First time? ' : 'Already a guest? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'create' : 'signin')}
            className="text-ink border-0 bg-transparent cursor-pointer uppercase tracking-[0.18em] text-[11px] p-0 border-b border-ink pb-[2px]"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
          </button>
        </div>
        {mode === 'signin' && (
          <a
            href="#"
            className="font-sans text-[11px] tracking-[0.22em] uppercase text-smoke"
          >
            Forgotten password
          </a>
        )}
      </div>
    </form>
  );
}
