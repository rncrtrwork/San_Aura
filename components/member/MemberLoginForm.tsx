'use client';

import { LoaderCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { MemberLoginRequestResponse } from '@/lib/memberAuth';

export function MemberLoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setMagicLink('');
    setError('');

    try {
      const response = await fetch('/api/member/auth/request', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as MemberLoginRequestResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to request member access.');
        return;
      }
      setMessage(result.message ?? 'If that email belongs to an active member, access is ready.');
      setMagicLink(result.magicLink ?? '');
    } catch {
      setError('Unable to reach member login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-forest-900">Member email</span>
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
      {message ? (
        <p
          role="status"
          className="rounded-lg bg-cream-alt p-3 text-sm font-semibold text-forest-900"
        >
          {message}
        </p>
      ) : null}
      {magicLink ? (
        <Link
          href={magicLink}
          className="rounded-lg border border-gold-600 bg-white p-3 text-sm font-bold text-gold-700 hover:bg-cream-alt"
        >
          Continue with secure member link
        </Link>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-admin-accent px-5 text-sm font-bold text-white transition-colors hover:bg-admin-accent-hover disabled:opacity-70"
      >
        {submitting ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
        Request access link
      </button>
    </form>
  );
}
