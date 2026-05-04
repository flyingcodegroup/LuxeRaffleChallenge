import { AppHeader } from '@/components/app-header/app-header';

// Fallback for the @header parallel slot on routes that don't define
// their own. Without this, hard-loading anything but `/` 404s.
export default async function HeaderDefault() {
  return <AppHeader />;
}
