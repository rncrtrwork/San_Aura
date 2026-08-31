import { Search, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { MEMBERSHIP_TIERS, MEMBER_STATUSES } from '@/models/Member';
import { getMembers, parseMemberFilters } from '@/server/members/getMembers';

export const dynamic = 'force-dynamic';

type MembersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });

function monthName(month: number): string {
  return monthFormatter.format(new Date(Date.UTC(2026, month - 1, 1)));
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const filters = parseMemberFilters(await searchParams);
  const { members, total } = await getMembers(filters);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Membership
          </p>
          <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Members</h1>
          <p className="mt-2 text-sm text-admin-muted">
            Manage profiles, renewals, documents, and account history.
          </p>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white transition-colors hover:bg-admin-sidebar-active"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Add Member
        </Link>
      </header>

      <form className="admin-card grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(10rem,0.35fr))_auto]">
        <label className="relative block">
          <span className="sr-only">Search members</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="search"
            name="search"
            defaultValue={filters.search}
            placeholder="Search name, email, or phone"
            className="h-11 w-full rounded-lg border border-admin-border bg-white pl-10 pr-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="sr-only">Membership tier</span>
          <select
            name="tier"
            defaultValue={filters.tier}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">All tiers</option>
            {MEMBERSHIP_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                ${tier} tier
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Member status</span>
          <select
            name="status"
            defaultValue={filters.status}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm capitalize text-forest-900"
          >
            <option value="">All statuses</option>
            {MEMBER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Renewal month</span>
          <select
            name="renewalMonth"
            defaultValue={filters.renewalMonth?.toString() ?? ''}
            className="h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">All renewal months</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={month}>
                {monthName(month)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg border border-admin-sidebar px-5 text-sm font-bold text-admin-sidebar transition-colors hover:bg-admin-sidebar hover:text-white"
        >
          Apply
        </button>
      </form>

      <section className="admin-card overflow-hidden" aria-labelledby="member-list-heading">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-4 sm:px-6">
          <h2 id="member-list-heading" className="font-bold text-forest-900">
            Member Directory
          </h2>
          <span className="text-sm text-admin-muted">
            {total} {total === 1 ? 'member' : 'members'}
          </span>
        </div>
        {members.length === 0 ? (
          <div className="grid justify-items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
              <Users aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-forest-900">No members match these filters</p>
            <p className="mt-1 text-sm text-admin-muted">Adjust the filters or add a new member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-cream-alt/70 text-xs uppercase tracking-wide text-admin-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold sm:pl-6">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Renewal
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold sm:pr-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-cream-alt/40">
                    <td className="px-5 py-4 sm:pl-6">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="font-semibold text-forest-900 hover:text-admin-accent"
                      >
                        {member.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-admin-muted">
                        {member.email || 'No email on file'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-admin-muted">{member.phone}</td>
                    <td className="px-4 py-4 font-semibold text-forest-900">${member.tier}</td>
                    <td className="px-4 py-4 text-admin-muted">{monthName(member.renewalMonth)}</td>
                    <td className="px-5 py-4 text-right sm:pr-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          member.status === 'active'
                            ? 'bg-admin-success/10 text-admin-success'
                            : 'bg-cream-alt text-admin-muted'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
