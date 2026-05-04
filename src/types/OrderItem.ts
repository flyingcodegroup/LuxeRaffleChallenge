import { z } from 'zod';

// Used for both cart entries and order lines — same shape, no
// transformation at checkout. `id` is the raffle id (matches the
// API's field name on POST /api/orders).
export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
