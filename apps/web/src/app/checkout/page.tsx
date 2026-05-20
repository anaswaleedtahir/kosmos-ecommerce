import { getProducts } from '@/lib/catalog-api';
import { CheckoutClient } from './CheckoutClient';

export const metadata = {
  title: 'Checkout — Kosmos',
};

export default async function CheckoutPage() {
  const products = await getProducts();
  return <CheckoutClient products={products} />;
}
