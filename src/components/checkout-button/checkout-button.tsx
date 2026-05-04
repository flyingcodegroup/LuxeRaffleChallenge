'use client';

import { Button } from '@/components/ui/button';
import { checkout, type CheckoutState } from '@/server-functions/checkout';
import { useActionState } from 'react';

// Client island for pending + error state. On success the action
// redirects, so state.error only ever holds failures.
const initialState: CheckoutState = {};

export function CheckoutButton() {
  const [state, formAction, isPending] = useActionState(checkout, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      {state.error && (
        <p
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Placing order…' : 'Checkout'}
      </Button>
    </form>
  );
}
