import {
  CalendarClock,
  Car,
  House,
  Mail,
  MapPin,
  Phone,
  ShieldPlus,
  UserRound,
} from 'lucide-react';
import { MemberStatusEditor } from '@/components/admin/MemberStatusEditor';
import type { MemberProfile } from '@/server/members/getMemberProfile';

type MemberProfileSummaryProps = {
  member: MemberProfile;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });

function monthName(month: number): string {
  return monthFormatter.format(new Date(Date.UTC(2026, month - 1, 1)));
}

function Detail({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream-alt text-admin-accent">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-forest-900">{value}</p>
      </div>
    </div>
  );
}

export function MemberProfileSummary({ member }: MemberProfileSummaryProps) {
  const primaryVehicle = member.vehicles[0];
  const vehicleLabel = primaryVehicle
    ? [primaryVehicle.year, primaryVehicle.make, primaryVehicle.model].filter(Boolean).join(' ') ||
      primaryVehicle.plate ||
      'Vehicle on file'
    : 'No vehicle on file';

  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby="profile-summary-heading">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-admin-border pb-5">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-admin-sidebar text-white">
            <UserRound aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 id="profile-summary-heading" className="font-serif text-3xl text-forest-900">
              {member.name}
            </h2>
            <p className="mt-1 text-sm text-admin-muted">
              ${member.membershipTier} membership · Joined{' '}
              {new Date(member.joinDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
              member.status === 'active'
                ? 'bg-admin-success/10 text-admin-success'
                : 'bg-cream-alt text-admin-muted'
            }`}
          >
            {member.status}
          </span>
          <MemberStatusEditor
            memberId={member.id}
            initialStatus={member.status}
            initialRenewalMonth={member.renewalMonth}
          />
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Detail icon={Mail} label="Email" value={member.email || 'Not provided'} />
        <Detail icon={Phone} label="Phone" value={member.phone} />
        <Detail icon={MapPin} label="Address" value={member.address || 'Not provided'} />
        <Detail
          icon={CalendarClock}
          label="Renews"
          value={`${monthName(member.renewalMonth)} each year`}
        />
        <Detail icon={Car} label="Primary vehicle" value={vehicleLabel} />
        <Detail icon={House} label="Assigned site" value={member.assignedSite || 'Not assigned'} />
        <Detail
          icon={ShieldPlus}
          label="Emergency contact"
          value={
            member.emergencyContact
              ? `${member.emergencyContact.name} · ${member.emergencyContact.phone}`
              : 'Not provided'
          }
        />
      </div>
    </section>
  );
}
