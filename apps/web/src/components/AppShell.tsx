'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Nav } from '@kosmos/design/nav';
import { Footer } from '@kosmos/design/footer';
import { useBag } from './providers/BagProvider';
import { useUI } from './providers/UIProvider';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useBag();
  const { openBag, openSearch } = useUI();

  if (pathname.startsWith('/checkout')) return null;

  return (
    <Nav
      bagCount={count}
      onSearch={openSearch}
      onBag={openBag}
      onAccount={() => router.push('/signin')}
    />
  );
}

export function AppFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/checkout')) return null;
  return <Footer />;
}
