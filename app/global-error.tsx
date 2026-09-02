'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-cream px-6 py-12 text-forest-900">
        <main className="mx-auto max-w-xl rounded-3xl border border-admin-border bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-admin-accent">
            Sun Aura Resort
          </p>
          <h1 className="mt-3 font-serif text-4xl text-forest-900">Something went wrong.</h1>
          <p className="mt-4 text-sm leading-6 text-ink-700">
            The issue has been logged for staff review. Please try again, or contact the resort if
            the problem continues.
          </p>
          {error.digest ? (
            <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-xs text-ink-700">
              Error reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:ring-offset-2"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
