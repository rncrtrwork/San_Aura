import { Bell, ExternalLink, Search, Settings } from 'lucide-react';
import Link from 'next/link';

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center gap-4 border-b border-admin-border bg-admin-surface/95 px-5 backdrop-blur lg:px-8">
      <label className="relative max-w-md flex-1">
        <span className="sr-only">Search reservations, guests, and sites</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-admin-muted"
          strokeWidth={1.8}
        />
        <input
          type="search"
          placeholder="Search reservations, guests, sites..."
          className="h-12 w-full rounded-lg border border-admin-border bg-white pl-12 pr-4 text-sm text-forest-900 placeholder:text-admin-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
        />
      </label>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Open notifications"
          className="grid size-11 place-items-center rounded-lg text-forest-900 transition-colors hover:bg-black/5"
        >
          <Bell aria-hidden="true" className="size-5" strokeWidth={1.7} />
        </button>
        <Link
          href="/"
          target="_blank"
          className="hidden h-11 items-center gap-2 rounded-lg border border-admin-accent px-5 text-sm font-semibold text-admin-accent transition-colors hover:bg-admin-accent hover:text-white sm:flex"
        >
          View Website
          <ExternalLink aria-hidden="true" className="size-4" />
        </Link>
        <Link
          href="/admin/settings"
          aria-label="Open settings"
          className="grid size-11 place-items-center rounded-lg text-forest-900 transition-colors hover:bg-black/5"
        >
          <Settings aria-hidden="true" className="size-5" strokeWidth={1.7} />
        </Link>
      </div>
    </header>
  );
}
