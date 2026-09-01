import {
  CalendarClock,
  Car,
  HeartHandshake,
  House,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TIER_LABELS,
  memberDateLabel,
  memberRenewalMonthLabel,
} from '@/lib/memberPortal';
import type { MemberProfile } from '@/server/members/getMemberProfile';

type MemberInfoTabProps = {
  profile: MemberProfile;
};

type DetailProps = {
  icon: typeof Mail;
  label: string;
  value: string;
};

function Detail({ icon: Icon, label, value }: DetailProps) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-white p-5">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-alt text-gold-700">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-700">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-forest-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function vehicleLabel(vehicle: MemberProfile['vehicles'][number]): string {
  const description = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  const registration = [vehicle.plate, vehicle.state].filter(Boolean).join(' · ');
  return [description, registration].filter(Boolean).join(' — ') || 'Vehicle on file';
}

export function MemberInfoTab({ profile }: MemberInfoTabProps) {
  const emergencyContact = profile.emergencyContact
    ? `${profile.emergencyContact.name} · ${profile.emergencyContact.relationship || 'Contact'} · ${
        profile.emergencyContact.phone
      }`
    : 'Not provided';

  return (
    <section className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
            Membership info
          </p>
          <h2 className="mt-2 font-serif text-3xl text-forest-900">Your resort record</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700">
            This is the official information Sun Aura Resort has on file. Contact staff if anything
            needs to be updated.
          </p>
        </div>
        <span className="rounded-full bg-cream-alt px-4 py-2 text-sm font-bold text-forest-900">
          {MEMBER_STATUS_LABELS[profile.status]}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Detail icon={Mail} label="Email" value={profile.email || 'Not provided'} />
        <Detail icon={Phone} label="Phone" value={profile.phone || 'Not provided'} />
        <Detail icon={MapPin} label="Address" value={profile.address || 'Not provided'} />
        <Detail
          icon={HeartHandshake}
          label="Membership"
          value={MEMBER_TIER_LABELS[profile.membershipTier]}
        />
        <Detail icon={CalendarClock} label="Joined" value={memberDateLabel(profile.joinDate)} />
        <Detail
          icon={CalendarClock}
          label="Renewal"
          value={`${memberRenewalMonthLabel(profile.renewalMonth)} each year`}
        />
        <Detail icon={House} label="Assigned site" value={profile.assignedSite || 'Not assigned'} />
        <Detail icon={Users} label="Emergency contact" value={emergencyContact} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-cream-alt text-gold-700">
              <Car aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-700">
                Vehicles
              </p>
              <h3 className="font-serif text-2xl text-forest-900">Vehicles on file</h3>
            </div>
          </div>
          {profile.vehicles.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm font-semibold text-forest-900">
              {profile.vehicles.map((vehicle) => (
                <li
                  key={`${vehicle.plate}-${vehicle.make}-${vehicle.model}`}
                  className="rounded-xl bg-cream-alt p-3"
                >
                  {vehicleLabel(vehicle)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-cream-alt p-3 text-sm text-ink-700">
              No vehicles are currently listed on this record.
            </p>
          )}
        </article>

        <article className="rounded-[1.25rem] border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-cream-alt text-gold-700">
              <Users aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-700">
                Staying with
              </p>
              <h3 className="font-serif text-2xl text-forest-900">Linked party</h3>
            </div>
          </div>
          {profile.partyLinks.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm font-semibold text-forest-900">
              {profile.partyLinks.map((link) => (
                <li
                  key={`${link.entityType}-${link.entityId}`}
                  className="rounded-xl bg-cream-alt p-3"
                >
                  {link.name}
                  <span className="mt-1 block text-xs font-medium text-ink-700">
                    {link.subtitle}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-cream-alt p-3 text-sm text-ink-700">
              No linked guests or members are currently listed.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
