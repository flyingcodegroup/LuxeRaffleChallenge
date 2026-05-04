'use server';

import { API_BASE_URL, ORDERS_CACHE_TAG } from '@/lib/constants';
import { getCart, setCart } from '@/lib/cart';

import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

// Shape returned to the cart page so we can show error messages.
export type CheckoutState = { error?: string };

// What POST /api/orders returns on success.
const OrderResponseSchema = z.object({ orderId: z.string() });

// POSTs the cart items to /api/orders with the bearer token, clears
// the cart, invalidates the orders cache, redirects to /account.
//   401 > token expired/tampered, redirect to /login
//   400 > API rejected (usually a sold-out raffle), show inline
//   other > generic "try again"
export const checkout = async (
  _previousState: CheckoutState,
  _formData: FormData,
): Promise<CheckoutState> => {
  const token = await getAuthToken();
  if (!token) redirect('/login');

  const cart = await getCart();
  if (cart.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cart }),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Could not place order. Please try again.' };
  }

  if (res.status === 401) redirect('/login');
  if (res.status === 400) {
    return {
      error: 'One of your raffles ran out of tickets. Please review your cart.',
    };
  }
  if (!res.ok) {
    return { error: 'Could not place order. Please try again.' };
  }

  const body = OrderResponseSchema.safeParse(await res.json());
  if (!body.success) {
    return { error: 'Unexpected response from server.' };
  }

  await setCart([]);
  // So the next /account render shows the order we just placed.
  revalidateTag(ORDERS_CACHE_TAG);

  redirect('/account');
};
