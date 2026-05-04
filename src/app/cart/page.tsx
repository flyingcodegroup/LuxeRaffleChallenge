import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/checkout-button/checkout-button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getCart } from '@/lib/cart';
import { getCurrentUser } from '@/lib/auth';
import { getRaffles } from '@/server-functions/getRaffles';
import {
  removeFromCart,
  updateCartQuantity,
} from '@/server-functions/cart';

// Reads the cart cookie + raffles in parallel and joins them on the
// server. Every button is a <form> posting to a Server Action — no
// client-side state, no fetch, works without JS.
export default async function CartPage() {
  const [cart, raffles, user] = await Promise.all([
    getCart(),
    getRaffles(),
    getCurrentUser(),
  ]);
  const rafflesById = new Map(raffles.map((r) => [r.id, r]));

  // Drop entries pointing to a raffle the API no longer returns.
  const lineItems = cart.flatMap((item) => {
    const raffle = rafflesById.get(item.id);
    return raffle ? [{ ...item, raffle }] : [];
  });

  const total = lineItems.reduce(
    (sum, line) => sum + line.raffle.ticketPrice * line.quantity,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

        {lineItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-4 mb-8">
              {lineItems.map((line) => {
                const atMax = line.quantity >= line.raffle.availableTickets;
                return (
                  <li
                    key={line.id}
                    className="flex items-center space-x-4"
                  >
                    <Image
                      src={line.raffle.image}
                      alt={line.raffle.name}
                      width={80}
                      height={60}
                      className="rounded-md object-cover h-[60px] w-[80px]"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{line.raffle.name}</h3>
                      <p className="text-sm text-gray-600">
                        {line.raffle.ticketPrice} € per ticket
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <form action={updateCartQuantity}>
                          <input
                            type="hidden"
                            name="raffleId"
                            value={line.id}
                          />
                          <input
                            type="hidden"
                            name="quantity"
                            value={Math.max(1, line.quantity - 1)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            type="submit"
                            disabled={line.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </form>
                        <span className="font-medium" aria-live="polite">
                          {line.quantity}
                        </span>
                        <form action={updateCartQuantity}>
                          <input
                            type="hidden"
                            name="raffleId"
                            value={line.id}
                          />
                          <input
                            type="hidden"
                            name="quantity"
                            value={line.quantity + 1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            type="submit"
                            disabled={atMax}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                    <form action={removeFromCart}>
                      <input
                        type="hidden"
                        name="raffleId"
                        value={line.id}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        type="submit"
                        aria-label={`Remove ${line.raffle.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-end border-t pt-4">
              <p className="text-lg font-semibold">Total: {total} €</p>
              {user ? (
                <CheckoutButton />
              ) : (
                // Direct CTA for logged-out users; the checkout action
                // also redirects to /login as a fallback.
                <Button asChild>
                  <Link href="/login?next=/cart">Sign in to checkout</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
