import { z } from 'zod';

// The API occasionally sends money values as EU-formatted
// strings ("2.800.000" = 2,800,000). Accept either a number or that
// exact string format, normalize to a number. Anything else fails.
const MoneySchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    if (typeof value === 'number') return value;
    const parsed = Number(value.replace(/\./g, ''));
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Cannot parse "${value}" as a number`,
      });
      return z.NEVER;
    }
    return parsed;
  })
  .pipe(z.number().nonnegative());

// One Zod schema, two outputs: runtime validation against the API
// response and the TypeScript type used everywhere else.
export const RaffleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  longDescription: z.string(),
  carPrice: MoneySchema,
  ticketPrice: MoneySchema,
  totalTickets: z.number().int().nonnegative(),
  availableTickets: z.number().int().nonnegative(),
});

export type Raffle = z.infer<typeof RaffleSchema>;
