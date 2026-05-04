import { z } from 'zod';

// We run the decrypted token payload through this so a tampered or
// stale cookie is treated as "signed out" rather than trusted.
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
});

export type User = z.infer<typeof UserSchema>;
