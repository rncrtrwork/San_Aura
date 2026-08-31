'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  EMPTY_ADMIN_SEARCH_RESPONSE,
  type AdminSearchResponse,
  type AdminSearchResult,
} from '@/lib/adminSearch';

type SearchGroupProps = {
  label: string;
  results: AdminSearchResult[];
  onSelect(): void;
};

function SearchGroup({ label, results, onSelect }: SearchGroupProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <p className="px-4 py-1 text-xs font-bold uppercase tracking-[0.12em] text-admin-muted">
        {label}
      </p>
      {results.map((result) => (
        <Link
          key={result.id}
          href={result.href}
          onClick={onSelect}
          role="option"
          aria-selected="false"
          className="block px-4 py-2.5 transition-colors hover:bg-admin-canvas focus:bg-admin-canvas"
        >
          <span className="block text-sm font-semibold text-forest-900">{result.label}</span>
          <span className="mt-0.5 block text-xs capitalize text-admin-muted">
            {result.subtitle}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function GlobalSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResponse>(EMPTY_ADMIN_SEARCH_RESPONSE);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setResults(EMPTY_ADMIN_SEARCH_RESPONSE);
          return;
        }

        const data = (await response.json()) as AdminSearchResponse;
        setResults(data);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setResults(EMPTY_ADMIN_SEARCH_RESPONSE);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const resultCount = results.members.length + results.reservations.length + results.sites.length;

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      <label className="relative block">
        <span className="sr-only">Search reservations, guests, and sites</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-admin-muted"
          strokeWidth={1.8}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);

            if (nextQuery.trim().length < 2) {
              setResults(EMPTY_ADMIN_SEARCH_RESPONSE);
              setLoading(false);
              setOpen(false);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search reservations, members, sites..."
          role="combobox"
          aria-expanded={open}
          aria-controls="admin-search-results"
          aria-autocomplete="list"
          className="h-12 w-full rounded-lg border border-admin-border bg-white pl-12 pr-4 text-sm text-forest-900 placeholder:text-admin-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
        />
      </label>
      {open && query.trim().length >= 2 ? (
        <div
          id="admin-search-results"
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] max-h-[28rem] overflow-y-auto rounded-lg border border-admin-border bg-white shadow-card"
        >
          {loading ? <p className="px-4 py-5 text-sm text-admin-muted">Searching…</p> : null}
          {!loading && resultCount === 0 ? (
            <p className="px-4 py-5 text-sm text-admin-muted">No matching records found.</p>
          ) : null}
          {!loading ? (
            <>
              <SearchGroup
                label="Members"
                results={results.members}
                onSelect={() => setOpen(false)}
              />
              <SearchGroup
                label="Reservations"
                results={results.reservations}
                onSelect={() => setOpen(false)}
              />
              <SearchGroup label="Sites" results={results.sites} onSelect={() => setOpen(false)} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
