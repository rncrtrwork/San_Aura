import Image from 'next/image';
import { ArrowRight } from './icons';

type StayCardProps = {
  title: string;
  description: string;
  image: string;
  icon: 'home' | 'rv' | 'tent';
};

const icons = {
  home: '/images/stay-icon-cabin.svg',
  rv: '/images/stay-icon-rv.svg',
  tent: '/images/stay-icon-tent.svg',
};

export function StayCard({ title, description, image, icon }: StayCardProps) {
  const iconImage = icons[icon];
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-[#fbfaf6] transition duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[1.48/1] overflow-hidden">
        <Image src={image} alt={`${title} at Sun Aura Resort`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="relative min-h-[142px] px-6 pb-6 pt-8">
        <span className="absolute -top-12 left-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#d8d9d3] bg-white shadow-[0_3px_12px_rgba(28,43,30,0.10)]">
          <Image src={iconImage} alt="" width={40} height={40} aria-hidden="true" className="h-12 w-12 object-contain" />
        </span>
        <h3 className="font-serif text-[22px] leading-tight text-forest-900">{title}</h3>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="max-w-[220px] text-[13px] leading-5 text-ink-700">{description}</p>
          <button type="button" aria-label={`Explore ${title}`} className="mb-1 shrink-0 text-forest-900"><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></button>
        </div>
      </div>
    </article>
  );
}
