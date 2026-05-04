'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';
import { decryptToken } from '@/lib/token';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { UserSchema } from '@/types/User';

// Returned to the form on errors. `email` is echoed back so the form
// can re-render with the value the user typed — React resets
// uncontrolled inputs after a form action, so without this both
// fields would come back empty.
export type LoginState = { error?: string; email?: string };

// Validates the form submission before we even talk to the API.
const LoginInputSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// Validates the API response shape.
const TokenResponseSchema = z.object({ token: z.string().min(1) });

// Cookie lifetime: 7 days.
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

// Where to send the user after a successful login.
//
// The form may submit a `next` field (e.g. /cart, so the user is
// returned to the page they were trying to reach). We must not blindly
// trust it — a value like "https://evil.com" or "//evil.com" would let
// an attacker craft a link that signs the user in and bounces them to
// a phishing site. We accept only same-site relative paths (start with
// "/" but not "//"); anything else falls back to /account.
const DEFAULT_REDIRECT = '/account';
const safeNext = (value: FormDataEntryValue | null): string => {
  if (typeof value !== 'string') return DEFAULT_REDIRECT;
  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }
  return value;
};

// Validates the input, calls the token API, validates the response,
// confirms the decrypted payload is a real User, then stores the token
// in an httpOnly cookie. httpOnly so XSS can't read it. On any failure
// we return { error } for the form to render; on success we redirect.
export const login = async (
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const submittedEmail = (() => {
    const v = formData.get('email');
    return typeof v === 'string' ? v : '';
  })();
  const fail = (error: string): LoginState => ({
    error,
    email: submittedEmail,
  });

  const input = LoginInputSchema.safeParse({
    email: submittedEmail,
    password: formData.get('password'),
  });
  if (!input.success) {
    return fail(input.error.errors[0]?.message ?? 'Invalid input.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
      cache: 'no-store',
    });
  } catch {
    return fail('Login failed. Please try again.');
  }

  if (res.status === 401) return fail('Invalid email or password.');
  if (!res.ok) return fail('Login failed. Please try again.');

  const body = TokenResponseSchema.safeParse(await res.json());
  if (!body.success) return fail('Unexpected response from server.');

  // Don't store a token we can't decode into a valid user.
  const user = UserSchema.safeParse(decryptToken(body.data.token));
  if (!user.success) return fail('Unable to verify your account.');

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, body.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK_IN_SECONDS,
  });

  // redirect() must stay outside any try/catch — it throws a signal
  // Next.js needs to propagate.
  redirect(safeNext(formData.get('next')));
};
