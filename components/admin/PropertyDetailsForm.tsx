'use client';

import { FileUp, ImageIcon, LoaderCircle, Save } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { CloudinarySignatureResponse, CloudinaryWidgetConfig } from '@/lib/cloudinaryUpload';
import type {
  PropertySettingsMutationRequest,
  PropertySettingsMutationResponse,
  SettingsOverview,
} from '@/lib/settingsManager';

type PropertyDetailsFormProps = {
  property: SettingsOverview['property'];
  booking: SettingsOverview['booking'];
};

const inputClass =
  'mt-1.5 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900 placeholder:text-admin-muted';

function fieldValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function PropertyDetailsForm({ property, booking }: PropertyDetailsFormProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(property.logoUrl);
  const [logoPublicId, setLogoPublicId] = useState(property.logoPublicId);
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function buildPayload(form: FormData): PropertySettingsMutationRequest {
    return {
      resortName: fieldValue(form, 'resortName'),
      logoUrl,
      logoPublicId,
      address: {
        street: fieldValue(form, 'street'),
        city: fieldValue(form, 'city'),
        state: fieldValue(form, 'state'),
        postalCode: fieldValue(form, 'postalCode'),
        country: fieldValue(form, 'country'),
      },
      phone: fieldValue(form, 'phone'),
      email: fieldValue(form, 'email'),
      timezone: fieldValue(form, 'timezone'),
      checkInTime: fieldValue(form, 'checkInTime'),
      checkOutTime: fieldValue(form, 'checkOutTime'),
      keyReturnTime: fieldValue(form, 'keyReturnTime'),
    };
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/settings/property', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(new FormData(formEvent.currentTarget))),
      });
      const result = (await response.json()) as PropertySettingsMutationResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to save property details.');
        return;
      }

      setMessage(result.message ?? 'Property details saved.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  async function openUploadWidget() {
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const configResponse = await fetch('/api/admin/settings/logo-upload-signature');
      const config = (await configResponse.json()) as CloudinaryWidgetConfig;
      if (!configResponse.ok || !config.cloudName || !config.apiKey) {
        throw new Error(config.message ?? 'Logo uploads are unavailable.');
      }
      if (!window.cloudinary) {
        throw new Error('The upload service is still loading.');
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: config.cloudName,
          apiKey: config.apiKey,
          uploadSignature: (callback, paramsToSign) => {
            void fetch('/api/admin/settings/logo-upload-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paramsToSign }),
            })
              .then((response) => response.json())
              .then((result: CloudinarySignatureResponse) => {
                if (!result.signature) {
                  throw new Error(result.message ?? 'Unable to authorize the upload.');
                }
                callback(result.signature);
              })
              .catch(() => {
                setError('Unable to authorize the upload.');
                setUploading(false);
                widget.close();
              });
          },
          folder: 'sun-aura/settings',
          tags: ['settings', 'logo'],
          context: { usage: 'property_logo' },
          sources: ['local'],
          resourceType: 'auto',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'],
          maxFileSize: 5_000_000,
          multiple: false,
        },
        (widgetError, result) => {
          if (widgetError) {
            setError('The logo upload could not be completed.');
            setUploading(false);
            return;
          }
          if (result.event === 'close' || result.event === 'abort') {
            setUploading(false);
          }
          if (result.event === 'success' && result.info) {
            setLogoUrl(result.info.secure_url);
            setLogoPublicId(result.info.public_id);
            setMessage('Logo uploaded. Save property details to keep it.');
            setUploading(false);
            widget.destroy();
          }
        },
      );
      widget.open();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Logo uploads are unavailable.',
      );
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-admin-border bg-white p-5"
    >
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Property details
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">Identity and contact</h3>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save Details
        </button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <div>
          <div
            className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-admin-border bg-cream-alt bg-cover bg-center text-admin-muted"
            style={logoUrl ? { backgroundImage: `url("${logoUrl}")` } : undefined}
          >
            {!logoUrl ? <ImageIcon aria-hidden="true" className="size-12" /> : null}
          </div>
          <button
            type="button"
            onClick={openUploadWidget}
            disabled={!widgetReady || uploading}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-admin-accent px-4 text-sm font-bold text-admin-accent hover:bg-admin-accent hover:text-white disabled:opacity-60"
          >
            {uploading ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <FileUp aria-hidden="true" className="size-4" />
            )}
            {widgetReady ? 'Upload Logo' : 'Loading Uploader'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-forest-900">
            Resort name
            <input
              name="resortName"
              required
              maxLength={160}
              defaultValue={property.resortName}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Timezone
            <input
              name="timezone"
              required
              maxLength={100}
              defaultValue={property.timezone}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Phone
            <input
              name="phone"
              required
              maxLength={30}
              defaultValue={property.phone}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              defaultValue={property.email}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900 md:col-span-2">
            Street address
            <input
              name="street"
              required
              maxLength={200}
              defaultValue={property.address.street}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            City
            <input
              name="city"
              required
              maxLength={100}
              defaultValue={property.address.city}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            State
            <input
              name="state"
              required
              maxLength={100}
              defaultValue={property.address.state}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Postal code
            <input
              name="postalCode"
              required
              maxLength={20}
              defaultValue={property.address.postalCode}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Country
            <input
              name="country"
              required
              maxLength={100}
              defaultValue={property.address.country}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Check-in time
            <input
              name="checkInTime"
              type="time"
              required
              defaultValue={booking.checkInTime}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Checkout time
            <input
              name="checkOutTime"
              type="time"
              required
              defaultValue={booking.checkOutTime}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold text-forest-900">
            Key return time
            <input
              name="keyReturnTime"
              type="time"
              required
              defaultValue={booking.keyReturnTime}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {message ? (
        <p role="status" className="mt-4 text-sm font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
