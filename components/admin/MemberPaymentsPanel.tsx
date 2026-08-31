import { CircleDollarSign, ReceiptText } from 'lucide-react';
import { MemberPaymentForm } from '@/components/admin/MemberPaymentForm';
import type { MemberPaymentItem } from '@/server/members/getMemberPayments';

type MemberPaymentsPanelProps = {
  memberId: string;
  payments: MemberPaymentItem[];
  balance: number;
};

const typeLabels: Record<MemberPaymentItem['type'], string> = {
  dues: 'Membership dues',
  electric: 'Electric',
  'day-fee': 'Day fee',
  cabin: 'Cabin',
  rv: 'RV site',
  addon: 'Add-on',
};

const methodLabels: Record<MemberPaymentItem['method'], string> = {
  cash: 'Cash',
  check: 'Check',
  'paypal-external': 'PayPal (external)',
  'manual-adjustment': 'Manual adjustment',
};

export function MemberPaymentsPanel({ memberId, payments, balance }: MemberPaymentsPanelProps) {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-forest-900">Payment History</h3>
          <p className="mt-1 text-sm text-admin-muted">Up to 100 most recent ledger entries.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-cream-alt px-4 py-3">
          <CircleDollarSign aria-hidden="true" className="size-5 text-admin-accent" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">
              Current balance
            </p>
            <p className={`font-bold ${balance > 0 ? 'text-admin-danger' : 'text-admin-success'}`}>
              {currency.format(Math.abs(balance))}{' '}
              {balance > 0 ? 'due' : balance < 0 ? 'credit' : 'settled'}
            </p>
          </div>
        </div>
      </div>
      <MemberPaymentForm memberId={memberId} />

      {payments.length === 0 ? (
        <div className="grid justify-items-center py-12 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-cream-alt text-admin-accent">
            <ReceiptText aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 font-semibold text-forest-900">No payment history</p>
          <p className="mt-1 text-sm text-admin-muted">Ledger entries will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-admin-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream-alt/70 text-xs uppercase tracking-wide text-admin-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Method / Period
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3.5 text-admin-muted">
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-forest-900">{typeLabels[payment.type]}</p>
                    <p className="mt-0.5 text-xs capitalize text-admin-muted">
                      {payment.entryKind}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-forest-900">{methodLabels[payment.method]}</p>
                    {payment.periodStart && payment.periodEnd ? (
                      <p className="mt-0.5 text-xs text-admin-muted">
                        {new Date(payment.periodStart).toLocaleDateString('en-US')} –{' '}
                        {new Date(payment.periodEnd).toLocaleDateString('en-US')}
                      </p>
                    ) : payment.externalReference ? (
                      <p className="mt-0.5 text-xs text-admin-muted">
                        Ref: {payment.externalReference}
                      </p>
                    ) : null}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-bold ${
                      payment.entryKind === 'charge' ? 'text-admin-danger' : 'text-admin-success'
                    }`}
                  >
                    {payment.entryKind === 'charge' ? '+' : '−'}
                    {currency.format(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
