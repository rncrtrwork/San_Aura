import Link from 'next/link';
import { ArrowRight } from './icons';

type Props = { title: string; linkLabel?: string; href?: string; centered?: boolean };

export function SectionHeading({ title, linkLabel, href = '#', centered = false }: Props) {
  return (
    <div
      className={`mb-7 flex items-end gap-5 ${centered ? 'justify-center text-center' : 'justify-between'}`}
    >
      <h2 className="font-serif text-[27px] font-normal leading-tight text-forest-900 md:text-[32px]">
        {title}
      </h2>
      {linkLabel && (
        <Link
          href={href}
          className="group mb-1 flex shrink-0 items-center gap-3 text-[10px] font-semibold uppercase tracking-[.08em] text-forest-900"
        >
          <span className="hidden sm:inline">{linkLabel}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
