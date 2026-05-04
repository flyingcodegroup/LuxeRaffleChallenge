import { z } from 'zod';
import { OrderItemSchema } from './OrderItem';

// Shape of GET /api/orders. `id` is a UUID; items reuse OrderItem.
export const OrderSchema = z.object({
  id: z.string(),
  items: z.array(OrderItemSchema),
});

export type Order = z.infer<typeof OrderSchema>;
