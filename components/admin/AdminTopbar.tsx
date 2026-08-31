import { Bell, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from './GlobalSearch';

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center gap-4 border-b border-admin-border bg-admin-surface/95 px-5 backdrop-blur lg:px-8">
      <GlobalSearch />
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
