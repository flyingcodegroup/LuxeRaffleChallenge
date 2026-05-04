import { AppFooter } from '@/components/app-footer/app-footer';

// Fallback for the @footer parallel slot on routes that don't define
// their own. Without this, hard-loading anything but `/` 404s.
export default async function FooterDefault() {
  return <AppFooter />;
}
