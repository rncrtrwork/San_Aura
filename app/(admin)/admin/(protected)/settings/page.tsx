import {
  Activity,
  Bell,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Database,
  ImageUp,
  MailCheck,
  PlugZap,
  Settings2,
  ShieldCheck,
  ServerCog,
  UsersRound,
} from 'lucide-react';
import { BookingDefaultsForm } from '@/components/admin/BookingDefaultsForm';
import { NotificationsSettingsForm } from '@/components/admin/NotificationsSettingsForm';
import { OperatingSeasonForm } from '@/components/admin/OperatingSeasonForm';
import { PaymentsSettingsForm } from '@/components/admin/PaymentsSettingsForm';
import { PropertyDetailsForm } from '@/components/admin/PropertyDetailsForm';
import { PrivacySafetyForm } from '@/components/admin/PrivacySafetyForm';
import { RolePermissionsManager } from '@/components/admin/RolePermissionsManager';
import { StaffAccessSummary } from '@/components/admin/StaffAccessSummary';
import { StaffUserManagement } from '@/components/admin/StaffUserManagement';
import { SETTINGS_TAB_DEFINITIONS, settingsTabHref, type SettingsTab } from '@/lib/settingsManager';
import { getCloudinaryCredentials } from '@/lib/cloudinary';
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

type IntegrationCard = {
  name: string;
  description: string;
  configured: boolean;
  configuredLabel: string;
  missingLabel: string;
  Icon: typeof Settings2;
};

function integrationCards(): IntegrationCard[] {
  const cloudinaryConfigured = Boolean(getCloudinaryCredentials());

  return [
    {
      name: 'MongoDB Atlas',
      description: 'Stores members, reservations, media records, events, settings, and audit logs.',
      configured: Boolean(process.env.MONGODB_URI),
      configuredLabel: 'Database URI configured',
      missingLabel: 'Add MONGODB_URI',
      Icon: Database,
    },
    {
      name: 'Cloudinary',
      description: 'Handles gallery images, event images, site card photos, documents, and logos.',
      configured: cloudinaryConfigured,
      configuredLabel: 'Media storage configured',
      missingLabel: 'Add Cloudinary credentials',
      Icon: ImageUp,
    },
    {
      name: 'Email delivery',
      description: 'Used for reservation confirmations and staff-facing notification workflows.',
      configured: Boolean(
        process.env.SMTP_HOST &&
          process.env.SMTP_PORT &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASSWORD &&
          process.env.SMTP_FROM_EMAIL,
      ),
      configuredLabel: 'SMTP credentials configured',
      missingLabel: 'Add SMTP settings',
      Icon: MailCheck,
    },
    {
      name: 'Error monitoring',
      description: 'Captures production errors so staff can investigate launch issues quickly.',
      configured: Boolean(
        process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN,
      ),
      configuredLabel: 'Monitoring configured',
      missingLabel: 'Add monitoring settings',
      Icon: Activity,
    },
    {
      name: 'Production hosting',
      description:
        'Provides the public site, admin workspace, API routes, and server-side rendering.',
      configured: Boolean(
        process.env.PRODUCTION_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL,
      ),
      configuredLabel: 'Hosting URL detected',
      missingLabel: 'Set production site URL',
      Icon: ServerCog,
    },
  ];
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  await requirePagePermission('settings.read');
  const params = await searchParams;
  const overview = await getSettingsOverview(params);
  const integrations = integrationCards();
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
          Configure resort identity, operating rules, staff access, notifications, integrations, and
          payment guidance from one controlled workspace.
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

          {overview.activeTab === 'property' ? (
            <>
              <PropertyDetailsForm property={overview.property} booking={overview.booking} />
              <OperatingSeasonForm operating={overview.operating} />
            </>
          ) : overview.activeTab === 'booking' ? (
            <>
              <BookingDefaultsForm booking={overview.booking} />
              <PrivacySafetyForm privacy={overview.privacy} />
            </>
          ) : overview.activeTab === 'notifications' ? (
            <NotificationsSettingsForm notifications={overview.notifications} />
          ) : overview.activeTab === 'payments' ? (
            <PaymentsSettingsForm payments={overview.payments} />
          ) : overview.activeTab === 'staff-roles' ? (
            <>
              <StaffAccessSummary staff={overview.staff} />
              <RolePermissionsManager roles={overview.staff.roles} />
              <StaffUserManagement staff={overview.staff} />
            </>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {integrations.map((integration) => {
                const StatusIcon = integration.configured ? CircleCheck : CircleAlert;
                const Icon = integration.Icon;

                return (
                  <article
                    key={integration.name}
                    className="rounded-xl border border-admin-border bg-white p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream-alt text-admin-accent">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-serif text-2xl text-forest-900">{integration.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-admin-muted">
                          {integration.description}
                        </p>
                        <p
                          className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                            integration.configured
                              ? 'bg-admin-success/10 text-admin-success'
                              : 'bg-admin-warning/15 text-admin-warning'
                          }`}
                        >
                          <StatusIcon aria-hidden="true" className="size-4" />
                          {integration.configured
                            ? integration.configuredLabel
                            : integration.missingLabel}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
