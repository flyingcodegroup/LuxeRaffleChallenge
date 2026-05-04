import { cookies } from 'next/headers';
import { decryptToken } from '@/lib/token';
import { UserSchema, type User } from '@/types/User';

export const AUTH_COOKIE_NAME = 'auth-token';

// Reads the auth cookie, decrypts it, validates the payload as a User.
// A corrupt or tampered cookie returns null — we'd rather treat that
// case as "signed out" than trust bad data.
export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decryptToken(token);
  const parsed = UserSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
};

// Raw encrypted token for use as a Bearer token in authed API calls.
// Stays server-side — never returned to a Client Component.
export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
};
