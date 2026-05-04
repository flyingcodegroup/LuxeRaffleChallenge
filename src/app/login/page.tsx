import { LoginForm } from '@/components/login-form/login-form';

// Forwards ?next= to the form so a successful login can redirect to
// the page the user came from instead of the default /account.
// (Next.js 15: searchParams is a Promise.)
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
