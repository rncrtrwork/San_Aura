import { faqLinks, firstVisitLinks } from '@/lib/content';
import { InfoColumn } from './InfoColumn';
import { GolfCartRental } from './GolfCartRental';
import { OurStory } from './OurStory';

export function InfoFooterRow() {
  return (
    <section id="visit" className="bg-transparent px-6 pb-14 pt-2 md:px-10 md:pb-16 lg:px-12 lg:pb-6 lg:pt-2">
      <div className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-2 lg:grid-cols-[240px_240px_290px_minmax(0,1fr)]">
        <InfoColumn title="First Visit" links={firstVisitLinks} />
        <InfoColumn title="FAQ & Rules" links={faqLinks} />
        <OurStory />
        <GolfCartRental />
      </div>
    </section>
  );
}
