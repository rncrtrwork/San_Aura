'use client';

import { Link2, LoaderCircle, Search, UserPlus, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PartyLinkCreateResponse, PartyLinkItem, PartySearchResponse } from '@/lib/partyLinks';

type MemberPartyLinksProps = {
  memberId: string;
  initialLinks: PartyLinkItem[];
};

export function MemberPartyLinks({ memberId, initialLinks }: MemberPartyLinksProps) {
  const [links, setLinks] = useState(initialLinks);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PartyLinkItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [linkingId, setLinkingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const response = await fetch(
          `/api/admin/members/${memberId}/party-links?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const result = (await response.json()) as PartySearchResponse;
        if (!response.ok) {
          setError(result.message ?? 'Unable to search party records.');
          return;
        }
        setResults(result.results);
      } catch {
        if (!controller.signal.aborted) {
          setError('Unable to search party records.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [memberId, query]);

  async function addLink(person: PartyLinkItem) {
    setLinkingId(person.entityId);
    setError('');
    try {
      const response = await fetch(`/api/admin/members/${memberId}/party-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: person.entityType, entityId: person.entityId }),
      });
      const result = (await response.json()) as PartyLinkCreateResponse;
      const linkedPerson = result.link;
      if (!response.ok || !linkedPerson) {
        setError(result.message ?? 'Unable to link this person.');
        return;
      }
      setLinks((current) => [...current, linkedPerson]);
      setResults((current) => current.filter((item) => item.entityId !== person.entityId));
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLinkingId('');
    }
  }

  return (
    <div className="mt-6 border-t border-admin-border pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-forest-900">
            <UsersRound aria-hidden="true" className="size-4 text-admin-accent" />
            Checked in with
          </h3>
          <p className="mt-1 text-xs text-admin-muted">
            Link members or guests who are part of the same visiting party.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) {
                setResults([]);
                setSearching(false);
              }
            }}
            placeholder="Search member or guest"
            aria-label="Search members and guests to link"
            className="h-10 w-full rounded-lg border border-admin-border bg-white pl-9 pr-9 text-sm text-forest-900"
          />
          {searching ? (
            <LoaderCircle
              aria-hidden="true"
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-admin-muted"
            />
          ) : null}
          {query.trim().length >= 2 && !searching ? (
            <div className="absolute right-0 top-[calc(100%+0.4rem)] z-20 w-full overflow-hidden rounded-lg border border-admin-border bg-white shadow-card">
              {results.length === 0 ? (
                <p className="px-4 py-3 text-xs text-admin-muted">No unlinked records found.</p>
              ) : (
                <ul className="divide-y divide-admin-border">
                  {results.map((person) => (
                    <li
                      key={`${person.entityType}:${person.entityId}`}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-forest-900">
                          {person.name}
                        </p>
                        <p className="truncate text-xs text-admin-muted">
                          {person.entityType} · {person.subtitle}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addLink(person)}
                        disabled={Boolean(linkingId)}
                        aria-label={`Link ${person.name}`}
                        className="grid size-8 place-items-center rounded-lg bg-admin-sidebar text-white disabled:opacity-60"
                      >
                        {linkingId === person.entityId ? (
                          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                        ) : (
                          <UserPlus aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
      {links.length === 0 ? (
        <p className="mt-4 text-sm text-admin-muted">No linked party members yet.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((person) => (
            <li
              key={`${person.entityType}:${person.entityId}`}
              className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-cream-alt px-3 py-2"
            >
              <Link2 aria-hidden="true" className="size-3.5 text-admin-accent" />
              <span className="text-sm font-semibold text-forest-900">{person.name}</span>
              <span className="text-xs text-admin-muted">{person.entityType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
