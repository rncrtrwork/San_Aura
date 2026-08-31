export const PAYMENT_TYPES = ['dues', 'electric', 'day-fee', 'cabin', 'rv', 'addon'] as const;
export const PAYMENT_METHODS = ['cash', 'check', 'paypal-external', 'manual-adjustment'] as const;
export const LEDGER_ENTRY_KINDS = ['charge', 'payment', 'credit'] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type LedgerEntryKind = (typeof LEDGER_ENTRY_KINDS)[number];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  dues: 'Membership dues',
  electric: 'Electric',
  'day-fee': 'Day fee',
  cabin: 'Cabin',
  rv: 'RV site',
  addon: 'Add-on',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  'paypal-external': 'PayPal (external)',
  'manual-adjustment': 'Manual adjustment',
};
