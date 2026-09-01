import { Bolt } from 'lucide-react';
import { MemberElectricReadingForm } from '@/components/admin/MemberElectricReadingForm';
import { ELECTRIC_BILLING_MODE_LABELS, memberCurrencyLabel } from '@/lib/memberPortal';
import type { ElectricReadingSiteOption } from '@/server/electricBilling/getElectricReadingOptions';
import type { MemberElectricHistory } from '@/server/memberPortal/getMemberElectricHistory';

type MemberElectricPanelProps = {
  memberId: string;
  history: MemberElectricHistory;
  siteOptions: ElectricReadingSiteOption[];
  defaultSiteId: string;
};

export function MemberElectricPanel({
  memberId,
  history,
  siteOptions,
  defaultSiteId,
}: MemberElectricPanelProps) {
  return (
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-forest-900">Electric Readings</h3>
          <p className="mt-1 text-sm text-admin-muted">
            Add meter readings and review the most recent electric usage history.
          </p>
        </div>
        <MemberElectricReadingForm
          memberId={memberId}
          siteOptions={siteOptions}
          defaultSiteId={defaultSiteId}
        />
      </div>

      {history.readings.length === 0 ? (
        <div className="grid justify-items-center py-12 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-cream-alt text-admin-accent">
            <Bolt aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 font-semibold text-forest-900">No electric readings</p>
          <p className="mt-1 text-sm text-admin-muted">
            Meter readings and computed kWh deltas will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-admin-border">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-cream-alt/70 text-xs uppercase tracking-wide text-admin-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Site
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Meter
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  kWh Used
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Mode
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Charge
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {history.readings.map((reading) => (
                <tr key={reading.id}>
                  <td className="px-4 py-3.5 text-admin-muted">
                    {new Date(reading.readingDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-forest-900">{reading.siteCode}</td>
                  <td className="px-4 py-3.5 text-right text-forest-900">
                    {reading.meterValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-forest-900">
                    {reading.kwhUsed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-admin-muted">
                    {ELECTRIC_BILLING_MODE_LABELS[reading.billingMode]}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-admin-danger">
                    {memberCurrencyLabel(reading.resultingCharge)}
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
