import { cookies } from 'next/headers';
import { z } from 'zod';
import { OrderItemSchema, type OrderItem } from '@/types/OrderItem';

export const CART_COOKIE_NAME = 'cart';

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

// Cookies are user-controllable — a hand-crafted request can put
// anything in them. Validate on every read; treat malformed as empty.
const CartCookieSchema = z.array(OrderItemSchema);

export const getCart = async (): Promise<OrderItem[]> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const parsed = CartCookieSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

export const setCart = async (cart: OrderItem[]) => {
  const cookieStore = await cookies();
  // Don't keep a cookie holding "[]".
  if (cart.length === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK_IN_SECONDS,
  });
};

export const getCartCount = async (): Promise<number> => {
  const cart = await getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
