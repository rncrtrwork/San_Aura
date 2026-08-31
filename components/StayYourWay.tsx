import { stayOptions } from '@/lib/content';
import { SectionHeading } from './SectionHeading';
import { StayCard } from './StayCard';

export function StayYourWay() {
  return (
    <section id="stay" className="bg-cream px-6 py-14 md:px-10 md:py-20 lg:px-12 lg:pb-12 lg:pt-6">
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Stay Your Way" centered />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stayOptions.map((option) => <StayCard key={option.title} {...option} />)}
        </div>
      </div>
    </section>
  );
}
