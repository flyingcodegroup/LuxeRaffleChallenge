import { Raffle } from '@/types/Raffle';
import { OrderItem } from '@/types/OrderItem';
import RaffleTile from '../raffle-tile/raffle-tile';

// Map the cart once here so each tile gets an O(1) lookup instead of
// scanning the array.
export default function RafflesGrid({
  raffles,
  cart,
}: {
  raffles: Raffle[];
  cart: OrderItem[];
}) {
  const quantityByRaffleId = new Map(
    cart.map((item) => [item.id, item.quantity]),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">LuxeRaffle</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {raffles.map((raffle, index) => (
          <RaffleTile
            key={raffle.id}
            raffle={raffle}
            quantityInCart={quantityByRaffleId.get(raffle.id) ?? 0}
            // Mark the first tile's image as the LCP candidate so Next
            // sets fetchpriority=high and skips lazy-loading.
            priority={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
