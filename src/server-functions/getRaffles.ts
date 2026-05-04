'use server';

import { z } from 'zod';
import { API_BASE_URL } from '@/lib/constants';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
import { RaffleSchema } from '@/types/Raffle';

// Cached for 60 seconds — the first visitor pays the slow API cost,
// the rest get it instantly until revalidation. Wraps fetch with
// retry/backoff so the simulated 10% timeout doesn't routinely
// dump users onto error.tsx. Throws on a still-failing response
// or schema mismatch; the page's error boundary handles both.
export const getRaffles = async () => {
  // At build time the dev server isn't running, so a self-fetch to
  // localhost:3000 fails with ECONNREFUSED. The page is dynamic
  // anyway — return empty here and let it re-fetch at request time.
  if (process.env.NEXT_PHASE === 'phase-production-build') return [];

  const res = await fetchWithRetry(`${API_BASE_URL}/api/raffles`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to load raffles (status ${res.status})`);
  }

  const data = await res.json();

  // Validate at the boundary so downstream code can trust the shape.
  return z.array(RaffleSchema).parse(data);
};
