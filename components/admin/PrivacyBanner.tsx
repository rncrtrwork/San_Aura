import { CameraOff, ShieldCheck } from 'lucide-react';

type PrivacyBannerProps = {
  compact?: boolean;
};

export function PrivacyBanner({ compact = false }: PrivacyBannerProps) {
  return (
    <aside
      aria-label="Property photography policy"
      className={`mb-6 flex items-center gap-3 rounded-lg border border-admin-accent/25 bg-[#FFF7E8] text-forest-900 ${
        compact ? 'px-4 py-3' : 'px-5 py-4'
      }`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-accent text-white">
        <CameraOff aria-hidden="true" className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Privacy First</p>
        <p className="mt-0.5 text-xs leading-relaxed text-admin-muted sm:text-sm">
          Photography and video recording are not permitted on the property.
        </p>
      </div>
      <ShieldCheck
        aria-hidden="true"
        className="hidden size-5 shrink-0 text-admin-success sm:block"
      />
    </aside>
  );
}
