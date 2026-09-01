import {
  ELECTRIC_BILLING_MODE_LABELS,
  memberCurrencyLabel,
  memberDateLabel,
} from '@/lib/memberPortal';
import type { MemberElectricHistory } from '@/server/electricBilling/getMemberElectricHistory';

type MemberElectricBillingTabProps = {
  history: MemberElectricHistory;
};

function periodLabel(start: string | null, end: string | null): string {
  if (!start || !end) return 'Period unavailable';
  return `${memberDateLabel(start)} – ${memberDateLabel(end)}`;
}

export function MemberElectricBillingTab({ history }: MemberElectricBillingTabProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
          Electric readings
        </p>
        <h2 className="mt-2 font-serif text-3xl text-forest-900">Usage history</h2>
        {history.readings.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-ink-700">
                <tr>
                  <th className="border-b border-line px-3 py-3">Date</th>
                  <th className="border-b border-line px-3 py-3">Site</th>
                  <th className="border-b border-line px-3 py-3 text-right">Meter</th>
                  <th className="border-b border-line px-3 py-3 text-right">kWh</th>
                  <th className="border-b border-line px-3 py-3 text-right">Charge</th>
                </tr>
              </thead>
              <tbody>
                {history.readings.map((reading) => (
                  <tr key={reading.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-4 font-semibold text-forest-900">
                      {memberDateLabel(reading.readingDate)}
                    </td>
                    <td className="px-3 py-4 text-ink-700">{reading.siteCode}</td>
                    <td className="px-3 py-4 text-right text-ink-700">
                      {reading.meterValue.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-right text-ink-700">
                      {reading.kwhUsed.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-forest-900">
                      {memberCurrencyLabel(reading.resultingCharge)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 rounded-[1.25rem] bg-cream-alt p-5 text-sm leading-6 text-ink-700">
            No electric readings are on file yet.
          </p>
        )}
      </div>

      <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
          Electric charges
        </p>
        <h2 className="mt-2 font-serif text-3xl text-forest-900">Resulting charges</h2>
        {history.charges.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {history.charges.map((charge) => (
              <article
                key={charge.id}
                className="rounded-[1.25rem] border border-line bg-white p-4"
              >
                <p className="text-sm font-bold text-forest-900">
                  {memberCurrencyLabel(charge.amount)}
                </p>
                <p className="mt-1 text-xs text-ink-700">{memberDateLabel(charge.date)}</p>
                <p className="mt-2 text-xs font-semibold text-ink-700">
                  {periodLabel(charge.periodStart, charge.periodEnd)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-[1.25rem] bg-cream-alt p-5 text-sm leading-6 text-ink-700">
            No electric charges are on file yet.
          </p>
        )}
        <p className="mt-6 text-xs leading-5 text-ink-700">
          Billing modes: {Object.values(ELECTRIC_BILLING_MODE_LABELS).join(', ')}.
        </p>
      </div>
    </section>
  );
}
