'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { MemberCreateRequest, MemberCreateResponse } from '@/lib/memberForms';
import { MEMBERSHIP_TIERS, MEMBER_STATUSES } from '@/lib/memberOptions';

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function MemberCreateForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const yearValue = Number(fieldValue(form, 'vehicleYear'));
    const payload: MemberCreateRequest = {
      name: fieldValue(form, 'name'),
      email: fieldValue(form, 'email'),
      phone: fieldValue(form, 'phone'),
      address: fieldValue(form, 'address'),
      membershipTier: fieldValue(form, 'membershipTier') as MemberCreateRequest['membershipTier'],
      status: fieldValue(form, 'status') as MemberCreateRequest['status'],
      renewalMonth: Number(fieldValue(form, 'renewalMonth')),
      vehicle: {
        make: fieldValue(form, 'vehicleMake'),
        model: fieldValue(form, 'vehicleModel'),
        year: yearValue > 0 ? yearValue : null,
        plate: fieldValue(form, 'vehiclePlate').toUpperCase(),
        state: fieldValue(form, 'vehicleState').toUpperCase(),
      },
      emergencyContact: {
        name: fieldValue(form, 'emergencyName'),
        relationship: fieldValue(form, 'emergencyRelationship'),
        phone: fieldValue(form, 'emergencyPhone'),
      },
    };

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MemberCreateResponse;

      if (!response.ok || !result.id) {
        setError(result.message ?? 'Unable to create the member.');
        return;
      }

      router.push(`/admin/members/${result.id}`);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="admin-card p-5 sm:p-6" aria-labelledby="member-contact-heading">
        <h2 id="member-contact-heading" className="font-serif text-2xl text-forest-900">
          Contact & Membership
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-forest-900">
            Full name
            <input
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Email
            <input
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Phone
            <input name="phone" required maxLength={30} autoComplete="tel" className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Address
            <input
              name="address"
              maxLength={300}
              autoComplete="street-address"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Membership tier
            <select name="membershipTier" required defaultValue="1250" className={inputClass}>
              {MEMBERSHIP_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  ${tier}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Status
            <select name="status" required defaultValue="active" className={inputClass}>
              {MEMBER_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-forest-900 md:max-w-xs">
            Renewal month
            <select name="renewalMonth" required defaultValue="1" className={inputClass}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(
                    new Date(Date.UTC(2026, index, 1)),
                  )}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-card p-5 sm:p-6" aria-labelledby="vehicle-heading">
        <h2 id="vehicle-heading" className="font-serif text-2xl text-forest-900">
          Vehicle
        </h2>
        <p className="mt-1 text-sm text-admin-muted">Optional primary vehicle information.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['vehicleMake', 'Make'],
            ['vehicleModel', 'Model'],
            ['vehicleYear', 'Year'],
            ['vehiclePlate', 'Plate'],
            ['vehicleState', 'State'],
          ].map(([name, label]) => (
            <label key={name} className="text-sm font-semibold text-forest-900">
              {label}
              <input
                name={name}
                type={name === 'vehicleYear' ? 'number' : 'text'}
                min={name === 'vehicleYear' ? 1900 : undefined}
                max={name === 'vehicleYear' ? 2200 : undefined}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card p-5 sm:p-6" aria-labelledby="emergency-heading">
        <h2 id="emergency-heading" className="font-serif text-2xl text-forest-900">
          Emergency Contact
        </h2>
        <p className="mt-1 text-sm text-admin-muted">
          Optional, but name and phone must be paired.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-forest-900">
            Name
            <input name="emergencyName" maxLength={120} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Relationship
            <input name="emergencyRelationship" maxLength={80} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Phone
            <input name="emergencyPhone" maxLength={30} className={inputClass} />
          </label>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-admin-danger/30 bg-red-50 px-4 py-3 text-sm text-admin-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-5 text-sm font-bold text-white transition-colors hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {submitting ? 'Creating…' : 'Create Member'}
        </button>
      </div>
    </form>
  );
}
