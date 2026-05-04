'use server';

import { z } from 'zod';
import { getCart, setCart } from '@/lib/cart';

// Form fields arrive as strings; z.coerce parses them to numbers.
const RaffleIdSchema = z.coerce.number().int().positive();
const QuantitySchema = z.coerce.number().int().min(0);

// No revalidatePath here. Server Actions auto-rerender the current
// route, and the header + cart page both read the cookie (which is
// dynamic and uncached), so they pick up the new value for free.
// revalidatePath would also blow away the cached raffles fetch,
// adding a slow re-fetch to every cart click for no gain.

export const addToCart = async (formData: FormData) => {
  const id = RaffleIdSchema.parse(formData.get('raffleId'));
  const cart = await getCart();
  const existing = cart.find((item) => item.id === id);
  const next = existing
    ? cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    : [...cart, { id, quantity: 1 }];
  await setCart(next);
};

export const removeFromCart = async (formData: FormData) => {
  const id = RaffleIdSchema.parse(formData.get('raffleId'));
  const cart = await getCart();
  await setCart(cart.filter((item) => item.id !== id));
};

// Quantity 0 removes the line — saves a separate click.
export const updateCartQuantity = async (formData: FormData) => {
  const id = RaffleIdSchema.parse(formData.get('raffleId'));
  const quantity = QuantitySchema.parse(formData.get('quantity'));
  const cart = await getCart();
  const next =
    quantity === 0
      ? cart.filter((item) => item.id !== id)
      : cart.map((item) => (item.id === id ? { ...item, quantity } : item));
  await setCart(next);
};
