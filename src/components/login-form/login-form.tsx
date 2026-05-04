'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, type LoginState } from '@/server-functions/login';
import { useActionState, useEffect, useRef } from 'react';

// Client component for useActionState (pending/error) and the
// password ref. The actual login runs server-side.
const initialState: LoginState = {};

const errorClasses =
  'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500';

export function LoginForm({
  className,
  next,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { next?: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const passwordRef = useRef<HTMLInputElement>(null);

  // After a failed submit, focus the password field. The email is
  // re-rendered from state.email via defaultValue, so the user only
  // has to retype the password.
  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state]);

  const hasError = Boolean(state.error);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              {next && <input type="hidden" name="next" value={next} />}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  defaultValue={state.email ?? ''}
                  aria-invalid={hasError || undefined}
                  className={cn(hasError && errorClasses)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  ref={passwordRef}
                  aria-invalid={hasError || undefined}
                  className={cn(hasError && errorClasses)}
                />
              </div>
              {state.error && (
                <p
                  className="text-sm text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  {state.error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Signing in…' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
