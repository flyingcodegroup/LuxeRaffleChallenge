# 🏎️ LuxeRaffle - Take-Home Challenge

> 📝 **Implementation notes & design decisions:** see [NOTES.md](./NOTES.md)

## 🎯 Overview

Welcome to LuxeRaffle - where car dreams come true! We're building an exciting platform for car enthusiasts to win their dream rides through exclusive raffles. While most of the foundation is in place, we need your expertise to add the finishing touches and make it shine!

## 🎨 Your Mission

Transform our platform by implementing these key features:

1. Create an engaging landing page showcasing luxury car raffles
2. Enable smooth ticket purchases through the cart system
3. Build a user-friendly cart management experience
4. Implement secure customer authentication
5. Create a seamless checkout process
6. Design a personal account dashboard for purchase tracking

## 🚀 Technical Foundation

- **API Status**: Our API is still in development (sometimes slow, occasionally grumpy) - but fixing that is not part of this assignment!
- **Demo Account**: Take it for a spin with `jane.doe@gmail.com` / `applejuice` once the login is implemente.
- **Database**: Check `/data.db.json` for our simulated database.
- **API Simulation**: Our simulated API can be found in `/src/app/(please-ignore)/api` but should not be touched for this assignment.
  - `POST /api/auth/token` received `email` and `password` and returns a `token`.
  - `GET /api/raffles` returns a list of all available raffles.
  - `GET /api/orders` returns a list of all orders for an authenticated customer. A bearer token is expected in the `Authorization` header.
  - `POST /api/orders` receives `items` of shape `OrderItem` and returns an order id for an authenticated customer. A bearer token is expected in the `Authorization` header.
- **Token Utilities**: Make use of our secure `decryptToken` function from `/src/lib/token.ts` to get the token payload after calling the token api.
- **Known Issue**: Direct access to sub-pages returns 404 (except home page). For now, navigate from home!

## 🎯 Core Requirements

1. **Homepage Raffle Display**

   - Use `/src/server-functions/getRaffles.ts` to fetch and display raffles
   - Validate API responses with Zod schema
   - Show loading animation during API requests
   - Display error messages for failed requests
   - Implement caching for faster subsequent loads

2. **Shopping Cart Integration**

   - Enable "Add to cart" functionality
   - Update cart icon in header with item count
   - Implement server-side rendering for cart

3. **Cart Management Page**

   - Display detailed car information for cart items
   - Allow quantity adjustments and item removal
   - Show cart total

4. **User Authentication**

   - Connect login form to `/src/server-functions/login.ts`
   - Validate login responses with Zod schema
   - Show error messages for failed login attempts
   - Update header to show login status
   - Implement logout functionality

5. **Optional: Checkout Flow**

   - Create checkout process
   - Redirect to `/account` after successful purchase
   - Display order history in account dashboard

6. **Optional: Route Fix**

   - Resolve 404 errors on direct subpage access

## 💻 Technical Guidelines

Build with modern React patterns using:

- React Server Components (default)
- Strategic client components
- TypeScript (strict mode)
- Zod validation
- Performance optimizations
- Server-side state management

## 🏃‍♂️ Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000 and start coding!
```

## 🤝 Follow-Up Session

We'll pair program to:

- Polish any remaining features
- Implement cart reservations
- Create detailed raffle pages

Ready to build something awesome? Let's get racing! 🏁
