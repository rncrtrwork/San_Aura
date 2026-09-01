import {
  Bell,
  CalendarCheck,
  CreditCard,
  PlugZap,
  Settings2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { SETTINGS_TAB_DEFINITIONS, settingsTabHref, type SettingsTab } from '@/lib/settingsManager';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getSettingsOverview } from '@/server/settings/getSettingsOverview';

export const dynamic = 'force-dynamic';

type SettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const tabIcons: Record<SettingsTab, typeof Settings2> = {
  property: Settings2,
  booking: CalendarCheck,
  payments: CreditCard,
  notifications: Bell,
  'staff-roles': UsersRound,
  integrations: PlugZap,
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  await requirePagePermission('settings.read');
  const params = await searchParams;
  const overview = await getSettingsOverview(params);
  const activeDefinition =
    SETTINGS_TAB_DEFINITIONS.find((tab) => tab.id === overview.activeTab) ??
    SETTINGS_TAB_DEFINITIONS[0];

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Administration
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Configure resort identity, operating rules, staff access, notifications, and MVP payment
          guidance from one controlled workspace.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="admin-card p-5" aria-labelledby="settings-tabs-heading">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Settings tabs
          </p>
          <h2 id="settings-tabs-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Configuration
          </h2>
          <nav aria-label="Settings sections" className="mt-5 space-y-2">
            {SETTINGS_TAB_DEFINITIONS.map((tab) => {
              const active = tab.id === overview.activeTab;
              const Icon = tabIcons[tab.id];

              return (
                <a
                  key={tab.id}
                  href={settingsTabHref(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex gap-3 rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-admin-accent bg-cream-alt text-forest-900'
                      : 'border-admin-border bg-white text-admin-muted hover:border-admin-accent/50 hover:text-forest-900'
                  }`}
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white text-admin-accent">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{tab.label}</span>
                    <span className="mt-1 block text-xs leading-5">{tab.description}</span>
                  </span>
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="admin-card p-6" aria-labelledby="settings-active-heading">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                Active settings area
              </p>
              <h2 id="settings-active-heading" className="mt-1 font-serif text-3xl text-forest-900">
                {activeDefinition.label}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted">
                {activeDefinition.description}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
              <ShieldCheck aria-hidden="true" className="size-4 text-admin-success" />
              RBAC protected
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Property</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">
                {overview.property.resortName}
              </p>
              <p className="mt-2 text-xs leading-5 text-admin-muted">
                {overview.property.addressLine}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Contact</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">{overview.property.phone}</p>
              <p className="mt-2 text-xs text-admin-muted">{overview.property.email}</p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Booking defaults</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">
                {overview.booking.minimumAge}+ guests
              </p>
              <p className="mt-2 text-xs text-admin-muted">
                {overview.booking.depositRequirementPercent}% deposit |{' '}
                {overview.booking.cancellationWindowDays}-day cancellation window
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Operating setup</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">
                {overview.operating.openYearRound ? 'Open year-round' : 'Seasonal'}
              </p>
              <p className="mt-2 text-xs text-admin-muted">
                {overview.operating.currency} | {overview.operating.dateFormat} |{' '}
                {overview.property.timezone}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Notifications</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">
                {overview.notifications.enabledCount}/{overview.notifications.totalCount} enabled
              </p>
              <p className="mt-2 text-xs text-admin-muted">
                Staff-facing alert toggles are grouped here.
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Staff access</p>
              <p className="mt-2 font-serif text-2xl text-forest-900">
                {overview.staff.activeStaffCount} active staff
              </p>
              <p className="mt-2 text-xs text-admin-muted">
                {overview.staff.roleCount} roles available for assignment.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-admin-border bg-cream-alt/70 p-5">
            <p className="text-sm font-bold text-forest-900">Phase 10 queue</p>
            <p className="mt-2 text-sm leading-6 text-admin-muted">
              This shell establishes the settings navigation and live summaries. The following tasks
              add editable forms for property details, operating season, booking defaults, privacy
              controls, notifications, staff roles, activity log, and MVP payments.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
