import RafflesGrid from '@/components/raffles-grid/raffles-grid';
import { getRaffles } from '@/server-functions/getRaffles';
import { getCart } from '@/lib/cart';

// Home fetches raffles and the cart in parallel. The cart is read
// from the cookie (fast, no network), so each tile can show whether
// it's already been added.
export default async function Home() {
  const [raffles, cart] = await Promise.all([getRaffles(), getCart()]);
  return <RafflesGrid raffles={raffles} cart={cart} />;
}
