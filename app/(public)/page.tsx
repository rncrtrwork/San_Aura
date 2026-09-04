import { ExploreResort } from '@/components/ExploreResort';
import { GalleryStrip } from '@/components/GalleryStrip';
import { GuestReviews } from '@/components/GuestReviews';
import { Hero } from '@/components/Hero';
import { HomeVisitTracker } from '@/components/HomeVisitTracker';
import { OutdoorFeature } from '@/components/OutdoorFeature';
import { StayYourWay } from '@/components/StayYourWay';
import { TrustStrip } from '@/components/TrustStrip';
import { UpcomingEvents } from '@/components/UpcomingEvents';
import { PublicCmsSections } from '@/components/public/PublicCmsSections';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';
import { getPublicSeoMetadata } from '@/server/public/getPublicSeoMetadata';

export async function generateMetadata() {
  return getPublicSeoMetadata('home', {
    title: 'Sun Aura Resort | Northwest Indiana',
    description: 'A private 300-acre retreat in Northwest Indiana.',
  });
}

export default async function Home() {
  const cmsPage = await getPublicContentPage('home');
  if (cmsPage) {
    return (
      <>
        <HomeVisitTracker />
        <PublicCmsSections page={cmsPage} />
        <GuestReviews />
      </>
    );
  }

  return (
    <>
      <HomeVisitTracker />
      <Hero />
      <TrustStrip />
      <UpcomingEvents />
      <StayYourWay />
      <OutdoorFeature />
      <ExploreResort />
      <GalleryStrip />
      <GuestReviews />
    </>
  );
}
