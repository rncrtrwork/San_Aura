import type { PaymentSettingsMutationRequest } from '@/lib/settingsManager';

export type PaymentSettingsValidationResult =
  | { valid: true; data: PaymentSettingsMutationRequest }
  | { valid: false; message: string };

type PaymentSettingsInput = Partial<PaymentSettingsMutationRequest>;

export function validatePaymentSettings(
  input: PaymentSettingsInput | null,
): PaymentSettingsValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Payment settings are required.' };
  }

  const paypalMeUrl = typeof input.paypalMeUrl === 'string' ? input.paypalMeUrl.trim() : '';
  if (!paypalMeUrl) {
    return { valid: true, data: { paypalMeUrl: '' } };
  }

  let url: URL;
  try {
    url = new URL(paypalMeUrl);
  } catch {
    return { valid: false, message: 'Enter a valid PayPal.me URL.' };
  }

  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || (hostname !== 'paypal.me' && hostname !== 'www.paypal.me')) {
    return { valid: false, message: 'Payments MVP only accepts a PayPal.me HTTPS link.' };
  }
  if (url.pathname.replace(/\//g, '').length === 0) {
    return { valid: false, message: 'PayPal.me link must include the resort profile name.' };
  }

  return { valid: true, data: { paypalMeUrl: url.toString() } };
}
