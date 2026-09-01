import { ExploreResort } from '@/components/ExploreResort';
import { GalleryStrip } from '@/components/GalleryStrip';
import { Hero } from '@/components/Hero';
import { StayYourWay } from '@/components/StayYourWay';
import { TrustStrip } from '@/components/TrustStrip';
import { UpcomingEvents } from '@/components/UpcomingEvents';
import { PublicCmsSections } from '@/components/public/PublicCmsSections';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';

export default async function Home() {
  const cmsPage = await getPublicContentPage('home');
  if (cmsPage) return <PublicCmsSections page={cmsPage} />;

  return (
    <>
      <Hero />
      <TrustStrip />
      <UpcomingEvents />
      <StayYourWay />
      <ExploreResort />
      <GalleryStrip />
    </>
  );
}
