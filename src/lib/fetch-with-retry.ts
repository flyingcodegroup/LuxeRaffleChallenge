// The starter API randomly fails about 10% of the time, so without
// retries roughly 1 in 10 visits would dump the user on the error
// page. Three tries with a short pause between each (0/300/800ms).
// We retry server errors and network failures; 4xx responses get
// returned as-is — a 401 isn't going to get better by trying again.
//
// Used on GETs only. Retrying a POST could create duplicate orders.
//
// Retries skip the cache. Without that, Next would replay the
// failed first response to tries 2 and 3 and the retry would never
// actually reach the API. The first try keeps the caller's caching
// so a successful response is still cached as normal.
const BACKOFF_MS = [0, 300, 800];

// Build a fresh init for retries. We list the safe fields by hand
// instead of spreading the caller's init, because any `next: {...}`
// option they passed has to be dropped — Next disallows it
// alongside `cache: 'no-store'`.
const buildRetryInit = (
  init: RequestInit | undefined,
): RequestInit => ({
  method: init?.method,
  headers: init?.headers,
  body: init?.body,
  signal: init?.signal,
  cache: 'no-store',
});

export const fetchWithRetry = async (
  input: string | URL,
  init?: Parameters<typeof fetch>[1],
): Promise<Response> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt++) {
    if (BACKOFF_MS[attempt] > 0) {
      await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
    }
    try {
      const attemptInit = attempt === 0 ? init : buildRetryInit(init);
      const res = await fetch(input, attemptInit);
      if (res.status >= 500 && attempt < BACKOFF_MS.length - 1) {
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === BACKOFF_MS.length - 1) break;
    }
  }
  throw lastError ?? new Error('fetchWithRetry: all attempts failed');
};
