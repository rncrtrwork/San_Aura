import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from '@/lib/paymentOptions';
import { memberCurrencyLabel, memberDateLabel } from '@/lib/memberPortal';
import type { MemberPaymentHistory } from '@/server/members/getMemberPayments';

type MemberPaymentHistoryTabProps = {
  paymentHistory: MemberPaymentHistory;
};

export function MemberPaymentHistoryTab({ paymentHistory }: MemberPaymentHistoryTabProps) {
  return (
    <section className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
            Payment history
          </p>
          <h2 className="mt-2 font-serif text-3xl text-forest-900">Member ledger</h2>
        </div>
        <p className="rounded-full bg-cream-alt px-4 py-2 text-sm font-bold text-forest-900">
          {paymentHistory.payments.length} entries
        </p>
      </div>
      {paymentHistory.payments.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-ink-700">
              <tr>
                <th className="border-b border-line px-3 py-3">Date</th>
                <th className="border-b border-line px-3 py-3">Type</th>
                <th className="border-b border-line px-3 py-3">Method</th>
                <th className="border-b border-line px-3 py-3">Kind</th>
                <th className="border-b border-line px-3 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-4 font-semibold text-forest-900">
                    {memberDateLabel(payment.date)}
                  </td>
                  <td className="px-3 py-4 text-ink-700">{PAYMENT_TYPE_LABELS[payment.type]}</td>
                  <td className="px-3 py-4 text-ink-700">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </td>
                  <td className="px-3 py-4 text-ink-700 capitalize">{payment.entryKind}</td>
                  <td className="px-3 py-4 text-right font-bold text-forest-900">
                    {memberCurrencyLabel(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-[1.25rem] bg-cream-alt p-5 text-sm leading-6 text-ink-700">
          No member payments or charges are on file yet.
        </p>
      )}
    </section>
  );
}
