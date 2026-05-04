# Implementation Notes

> **Time spent:** roughly 4 hours, split across the sections of the
> challenge. I deliberately time-boxed the work to keep the focus on
> the core functionality and the quality of what shipped, rather than
> chasing every nice-to-have.

What I changed and why. The first four sections each map back to one
or more `// TODO:` from the starter code. Everything below "Other
improvements" was prompted by something I noticed while building, not
by an explicit TODO.

---

## 1. Type-safe raffles + caching + loading/error UI

**TODOs addressed**

- `src/server-functions/getRaffles.ts:6` — _"Make this somehow type-safe, possibly with zod"_

**What I did**

- Defined `RaffleSchema` in `src/types/Raffle.ts` and inferred the
  `Raffle` TS type from it with `z.infer`. One schema, one source of
  truth for runtime checks and types.
- Updated `getRaffles` to cache with `next: { revalidate: 60 }` and
  parse the response through the schema. Throws on bad status or
  schema mismatch — both end up at the error boundary.
- Added a route-level `loading.tsx` (skeleton grid) and `error.tsx`
  (Try again button) for the home page. No `useState` flags needed;
  Suspense and the error boundary handle the swap.

**One quirk worth calling out**

The API sends `carPrice` for one of the rows as `"2.800.000"` (a
European-formatted string), not a number. I added a `MoneySchema`
that accepts either a number or that exact format and normalises to
a number. Anything else still fails validation — no silent coercion
of arbitrary garbage, just one documented exception for the format
the API actually uses.

---

## 2. Authentication: login, header user, logout

**TODOs addressed**

- `src/server-functions/login.ts:6` — _"Implement login and store token safely"_
- `src/components/login-form/login-form.tsx:11` — _"Make the form work"_
- `src/components/app-header/app-header.tsx:12` — _"Somehow get this from the token"_
- `src/app/account/page.tsx:16` — _"Implement logout"_
- `src/app/account/page.tsx:19` — _"This should be the user's first name"_

**What I did**

- Login is a Server Action (`useActionState` on the client side for
  pending + error). It validates input with Zod, calls the token API,
  validates the response, decrypts the token through `decryptToken`,
  validates the payload as a `User`, then sets the encrypted token in
  an httpOnly cookie. Three Zod parses, three different boundaries.
- Stored the token as **httpOnly, secure-in-prod, SameSite=Lax,
  7-day maxAge**. httpOnly was the main reason — JS can't read the
  cookie, so XSS can't steal the session.
- Created `src/lib/auth.ts` with `getCurrentUser()` and
  `getAuthToken()`. Both the header and the account page use
  `getCurrentUser()`, so there's one place that decides "who is
  signed in". The token never leaves the server.
- `logout` is its own Server Action — clears the cookie, redirects
  home. Triggered by a plain HTML form, so it works without JS.
- The account page reads the user up front and `redirect('/login')`
  if not signed in.

**One thing I came back and fixed**

After getting checkout working I noticed that signing in from the
cart page sent the user to `/account`, not back to `/cart` to finish
their order. Added a `?next=` query string the login page reads and
forwards through the form. The action validates `next` must start
with `/` and not `//` before redirecting (otherwise it's an
open-redirect — `/login?next=https://evil.com` would be a phishing
gift). Falls back to `/account` for anything that fails validation.

---

## 3. Shopping cart

**TODOs addressed**

- `src/components/app-header/app-header.tsx:13` — _"Somehow get this from the cart"_
- `src/app/cart/page.tsx:14` — _"This must come from the cart"_
- `src/app/cart/page.tsx:35` — _"Implement this"_ (remove)
- `src/app/cart/page.tsx:52` — _"We need to load data from the server somehow"_

**What I did**

- Cart lives in a cookie (`cart`, httpOnly, JSON of `OrderItem[]`).
  Same shape as the API expects at checkout, so no transformation
  later. Defined `OrderItemSchema` in `src/types/OrderItem.ts` and
  validate the cookie on every read — cookies are user-controllable;
  malformed > treated as empty.
- Three Server Actions in `src/server-functions/cart.ts`:
  `addToCart`, `removeFromCart`, `updateCartQuantity`. All inputs
  parsed with `z.coerce.number()` since FormData arrives as strings.
- Rewrote `cart/page.tsx` from a `useState` Client Component to a
  Server Component. Reads the cart cookie + raffles in parallel
  (`Promise.all`), joins them server-side, computes the total. Each
  +/-/trash button is a small `<form>` with hidden inputs — works
  without JS.
- Header reads `getCartCount()` for the badge. `Add to Cart` on the
  raffle tile is also a form posting to `addToCart`.

**Performance gotcha I hit**

I had `revalidatePath('/', 'layout')` in every cart action initially.
That made cart updates feel sluggish (1–5s). The reason: that call
also blew away the cached `getRaffles()` fetch, so every cart click
forced a fresh hit to the slow API. Removing it fixed it — Server
Actions auto-rerender the route, and both the header and cart page
read cookies (so they're already dynamic). The cookie change is
picked up for free, no need to touch the data cache.

---

## 4. Checkout flow + order history

**TODOs addressed**

- `src/app/cart/page.tsx:39` — _"Implement this. Redirect to /account"_
- `src/server-functions/order.ts:11` — _"Implement placing order for customer"_
- `src/server-functions/getOrders.ts:6` — _"Implement getting orders to display on the account page"_
- `src/server-functions/getOrders.ts:7` — _"Make this type-safe, possibly with zod"_

**What I did**

- Renamed `order.ts` > `checkout.ts` to match the project's
  filename = function name pattern. The `checkout` Server Action:
  - Reads the auth token + cart cookie. Empty cart > inline error.
    Not signed in > redirect to login.
  - POSTs `{ items: cart }` to `/api/orders` with the bearer token.
  - Maps known failures to friendly messages: 401 > redirect to login,
    400 > "ran out of tickets", anything else > generic "try again".
  - Validates `{ orderId }` with Zod, clears the cart cookie,
    redirects to `/account`.
- The Checkout button on the cart page is a small Client Component
  (`useActionState` for pending + error). Rest of the page stays a
  Server Component.
- Wired `/cart` to show `<CheckoutButton />` for signed-in users and a
  "Sign in to checkout" link (with `?next=/cart`) for everyone else.
  The action still redirects to `/login` on the server as a backstop
  if anyone bypasses the UI.
- `getOrders.ts` reads the token, calls `GET /api/orders` with the
  Bearer header, validates with `z.array(OrderSchema)`. Defined
  `OrderSchema` in `src/types/Order.ts`, reusing `OrderItem` so the
  cart, the checkout payload, and the order history all share one
  schema.
- Account page joins orders with raffles to show real car names in
  each line. Wrapped in a try/catch so an API timeout shows an inline
  "couldn't load" instead of crashing the whole page.

**Why I structured the orders fetch the way I did**

- I started with `cache: 'no-store'`, which made every `/account`
  visit hit the slow API. That fixed correctness but felt sluggish
  even after the streaming fix below.
- Switched to a tagged cache: `next: { revalidate: 3600, tags: ['orders'] }`
  in `getOrders`, and `revalidateTag('orders')` in `checkout` after a
  successful order. Each user's bearer token gives them their own
  cache entry (Next keys by request signature), so the tag invalidates
  everyone but the next visit per user fetches their own fresh data.
  Result: first visit after a checkout is one slow fetch, every
  subsequent visit is instant until the next checkout.
- The cache tag string lives in `src/lib/constants.ts` (not in
  `getOrders.ts`) because `'use server'` files can only export async
  functions — exporting a string from one of those throws at runtime.
  Both reader and writer import it from constants so the key can't
  silently drift.

---

## Other improvements

These weren't tied to a TODO but came up while testing.

### 404 on direct sub-page loads

The README flagged this as a known issue. The root layout uses
parallel routes (`@header`, `@footer`), and each parallel slot only
had a `page.tsx` (which matches its own URL only). With no
`default.tsx`, hard-loading anything but `/` had no header to render
in the slot, so Next returned 404. Added `default.tsx` to both slots
rendering `<AppHeader />` and `<AppFooter />`. Two files, fix.

### Loading skeleton was leaking onto every route

I originally put `loading.tsx` and `error.tsx` at `src/app/`. Those
cascade to every route below — so the raffle-shaped skeleton briefly
flashed on `/cart`, `/login`, `/account` during navigation. Moved
the home page and its `loading.tsx` into an `(home)/` route group.
Parentheses don't change the URL, but they scope `loading.tsx` and
`error.tsx` to just that group. The global `error.tsx` stayed at
`src/app/` as a generic fallback (with non-raffle copy).

### `/account` was blocked on the slow orders fetch

After clicking Checkout, the redirect to `/account` took a few
seconds because the page awaited `getOrders()` before sending any
HTML. Pulled the orders rendering into its own Server Component
(`OrdersList`) and wrapped it in `<Suspense>`. Now the page shell
(welcome message, logout button) streams immediately and the orders
section fills in behind a skeleton. Combined with the tagged cache
above, repeat visits are instant.

### Post-login redirect

Covered in section 2 above — the `?next=/cart` thing.

### Placeholder pages for unbuilt nav links

Six links across the header and footer (`/winners`, `/about`,
`/terms`, `/privacy`, `/faq`, `/contact`) pointed at routes that
didn't exist. Clicking any of them gave a 404. Added a small shared
`<ComingSoon title description />` component and a four-line page
per route. They use the same Card layout as the rest of the app, so
the gaps look intentional.

### Card layout, in-cart visual, price emphasis

- Cards had different description lengths, so the action buttons
  didn't line up across the grid. Made the card a `flex flex-col`
  with `flex-grow` on the description — the action row is now pinned
  to the bottom regardless of description length.
- Made the price `text-2xl font-extrabold text-primary` so it stands
  out from the title. The "€" stays small to keep the number the
  focal point.
- The home page now reads the cart cookie alongside raffles, builds
  a `Map<raffleId, quantity>` once in `RafflesGrid`, and passes a
  `quantityInCart` prop to each tile. When non-zero, the Add to Cart
  button switches to a green "✓ In cart (N)" — visually distinct
  from the dark View Details button next to it.

### Login form: keep the email, clear the password, mark errors

A failed login showed an error message but both inputs came back
empty (React resets uncontrolled inputs after a form action). The
password being empty is fine — you want to retype it — but losing
the email too meant retyping that as well, even when it wasn't
wrong. Fix:

- Echo the submitted email back through `useActionState`'s state
  object on every error path in `login.ts`.
- Set `defaultValue={state.email}` on the email input so it
  re-renders with what the user typed.
- Leave the password input without `defaultValue` so it stays empty
  on retry.
- Add red border + focus ring + `aria-invalid="true"` on both
  inputs when there's an error.
- `useEffect` on the action state moves focus to the password field
  on error, so the user can just start typing.

### "View Details" button now opens a dialog

It used to do nothing (detailed raffle pages are listed in the
README's follow-up session). Installed `@radix-ui/react-dialog`,
added the standard shadcn Dialog at `src/components/ui/dialog.tsx`
to match the existing components, and wrapped the button in a small
client component (`RaffleDetailsDialog`) that opens a centred dialog
with the car name, image, and a "Coming soon" message. The
surrounding raffle tile stays a Server Component — only this small
island is client.

### ESLint config tweak

Added the `argsIgnorePattern: '^_'` rule to `eslint.config.mjs` so
intentionally-unused args (like the `_previousState` and `_formData`
on `useActionState` actions) don't spam warnings.

### Retry on transient API failures

The starter API throws a timeout on roughly 10% of GETs, so without
anything in front of it about 1 in 10 first-time visits would land
on the error page. Added a small `fetchWithRetry` in `src/lib/` —
three attempts with a short backoff (0/300/800ms), retries 5xx and
network errors, leaves 4xx alone.

Retry attempts use `cache: 'no-store'`. Without that, Next.js would
memoize the first call by URL + options inside a single render and
silently hand the same failed response back to attempts two and
three — so the retry would never actually reach the API. The first
attempt keeps the caller's caching options, so a successful fetch
still populates the data cache normally.

Wired into `getRaffles` and `getOrders` only. `login` and `checkout`
intentionally aren't retried — those are POSTs that mutate state,
and retrying could create duplicate orders.

### Performance audit fixes

Lighthouse flagged a "resource load delay" on the LCP image (the
first raffle tile photo). Two fixes:

- **`priority` on the LCP tile.** `RafflesGrid` passes
  `priority={index === 0}` to the first tile, plus an explicit
  `fetchPriority="high"` on the `<Image>` for the same one. The
  rendered `<img>` ends up with `fetchpriority="high"` and skips
  lazy-loading; the other tiles stay lazy.
- **`sizes` on every tile image.** Tells Next which width variant to
  download per breakpoint, matching the grid's columns
  (`100vw` mobile, `50vw` sm, `33vw` lg, `25vw` xl). Browsers fetch
  smaller files on smaller screens.

The remaining LCP delay is the simulated API itself — the homepage
HTML can't include the image src until raffles resolve. That's
out of scope per the README.

### Accessibility audit fixes

Ran a Lighthouse audit and fixed the three flagged issues:

- **Footer copyright contrast.** `text-gray-500` on `bg-gray-100`
  was failing WCAG AA. Bumped to `text-gray-700`.
- **Icon-only links had no accessible name.** The User and Cart
  links in the header rendered just an SVG icon, so screen readers
  announced them as the URL or "link". Added `aria-label` to each:
  - User icon (signed out) > "Sign in"
  - User avatar (signed in) > `"Your account, ${firstName}"`
  - Cart link > `"Cart"` or `"Cart, N items"` depending on count
- **Missing `<main>` landmark.** Wrapped `{children}` in `<main>`
  in the root layout, so screen-reader users can jump to the main
  content with their landmarks shortcut.

---

## Things I considered but didn't ship

A couple of items I'd address on a real codebase but left alone here
to keep the scope focused on the README.

### Page-level SEO metadata

I built a small SEO setup (a `data/site.ts` with site-wide constants
plus per-page `home/winners/about` blocks for title, description,
OpenGraph and Twitter card) and wired it through the root layout +
each page's `metadata` export. While testing the production build
I hit a Next.js 15.4.5 behaviour where the metadata gets streamed
into `<body>` instead of `<head>` (React 19 hoists it client-side).
That's fine for crawlers that run JavaScript, but not great for
HTML-only readers. Two ways to fix it would be (1) bumping Next to
15.5+, where it's resolved, or (2) setting `htmlLimitedBots` in
`next.config.ts`. I reverted the metadata work since SEO wasn't in
the README scope and bumping a pinned framework version on a
take-home didn't feel right.

### npm audit vulnerabilities

`npm audit` reports 10 issues in the dependency tree (5 moderate,
4 high, 1 critical). They're all in transitive dependencies of the
starter's pinned packages — `npm audit fix` won't help, and
`npm audit fix --force` would change the locked versions, which
seemed risky for a take-home. On a real project I'd open a PR
bumping the affected dependencies one at a time and verifying each
one in CI.

### Visual design

I kept the overall look close to the starter. Proper visual polish —
colour, type scale, spacing rules, illustration — really wants a
UX/UI designer driving it, and that felt out of scope for a 4-hour
engineering brief. The project's already on Tailwind + shadcn/ui, so
once a design system lands it's straightforward to apply: swap a
few CSS variables, layer in a custom theme, and the existing
components inherit it. With more than the 4-hour budget I'd have
taken a pass at the UX/UI myself, but within the time I'd rather
ship working features cleanly than half-finished decoration.
