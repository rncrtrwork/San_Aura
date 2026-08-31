import { ChevronRight } from './icons';

type Props = { title: string; links: string[] };

export function InfoColumn({ title, links }: Props) {
  return (
    <div className="rounded-lg bg-[#f2eee5] p-6 md:p-7">
      <h3 className="font-serif text-[21px] text-forest-900">{title}</h3>
      <ul className="mt-5">
        {links.map((link) => (
          <li key={link} className="border-b border-line last:border-0">
            <button
              type="button"
              className="group flex w-full items-center justify-between gap-3 py-3 text-left text-xs text-ink-700 hover:text-forest-900"
            >
              {link}
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
