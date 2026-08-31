import Image from 'next/image';

type Props = { date: string; title: string; time: string; image: string };

export function EventCard({ date, title, time, image }: Props) {
  const [month, day] = date.replace(',', '').split(' ');

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-[#fbfaf6]">
      <div className="relative aspect-[1.42/1]">
        <div className="absolute inset-0 overflow-hidden rounded-t-lg">
          <Image src={image} alt={title} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 " />
        </div>
        <div className="absolute -bottom-2 left-4 z-10 flex h-[68px] w-[62px] flex-col items-center justify-center rounded-t-md bg-white text-forest-900">
          <span className="text-[15px] font-semibold uppercase tracking-[.08em]">{month}</span>
          <span className="mt-0.5 font-semibold text-[28px] leading-none">{day}</span>
        </div>
      </div>
      <div className="px-5 pb-5 pt-11">
        <h3 className="font-serif text-lg leading-tight text-forest-900">{title}</h3>
        <p className="mt-2 text-xs text-ink-700">{time}</p>
      </div>
    </article>
  );
}
