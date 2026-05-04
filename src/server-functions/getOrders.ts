'use server';

import { z } from 'zod';
import { API_BASE_URL, ORDERS_CACHE_TAG } from '@/lib/constants';
import { getAuthToken } from '@/lib/auth';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
import { OrderSchema } from '@/types/Order';

// Tagged cache, 1-hour TTL fallback. Each user's bearer token gets a
// separate cache entry, so `revalidateTag('orders')` after checkout
// invalidates everyone safely. First /account visit after a checkout
// is a cache miss; subsequent visits are instant. fetchWithRetry
// keeps the simulated API's 10% timeout from leaking into the UI.
export const getOrders = async () => {
  // Same reason as getRaffles: skip the self-fetch at build time.
  if (process.env.NEXT_PHASE === 'phase-production-build') return [];

  const token = await getAuthToken();
  if (!token) return [];

  const res = await fetchWithRetry(`${API_BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    next: {
      revalidate: 60 * 60,
      tags: [ORDERS_CACHE_TAG],
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load orders (status ${res.status})`);
  }

  return z.array(OrderSchema).parse(await res.json());
};
