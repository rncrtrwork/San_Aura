'use client';

import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    let response: Response;

    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
    } catch {
      setError('Unable to reach the server. Please try again.');
      setSubmitting(false);
      return;
    }

    if (!response.ok) {
      setError(response.status === 401 ? 'Invalid email or password.' : 'Unable to sign in.');
      setSubmitting(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-forest-900">Email address</span>
        <span className="relative block">
          <Mail
            aria-hidden="true"
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-admin-muted"
          />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-12 w-full rounded-lg border border-admin-border bg-white pl-12 pr-4 text-forest-900 focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
          />
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-forest-900">Password</span>
        <span className="relative block">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-admin-muted"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-lg border border-admin-border bg-white pl-12 pr-4 text-forest-900 focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
          />
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-admin-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-admin-accent px-5 text-sm font-bold text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
