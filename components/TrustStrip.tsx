import { Leaf, Lock, Pin, Sun } from './icons';

const items = [
  { label: '21+ Resort', icon: Leaf },
  { label: 'Open Year-Round', icon: Sun },
  { label: '75 Miles from Chicago', icon: Pin },
  { label: 'Privacy First', icon: Lock },
];

export function TrustStrip() {
  return (
    <div className="border-b border-line bg-cream">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(2,minmax(0,1fr))] px-4 py-7 sm:px-6 md:grid-cols-[repeat(4,minmax(0,1fr))] md:px-10 lg:px-12">
        {items.map(({ label, icon: Icon }, index) => (
          <div key={label} className={`flex min-w-0 items-center justify-center gap-2 px-1 py-3 text-center text-[8px] font-semibold uppercase tracking-[.05em] text-forest-900 sm:gap-3 sm:px-3 sm:text-[10px] md:text-xs ${index % 2 ? 'border-l border-line' : ''} ${index > 0 ? 'md:border-l' : ''}`}>
            <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" /><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
