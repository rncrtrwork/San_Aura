import { ExploreResort } from '@/components/ExploreResort';
import { GalleryStrip } from '@/components/GalleryStrip';
import { Hero } from '@/components/Hero';
import { StayYourWay } from '@/components/StayYourWay';
import { TrustStrip } from '@/components/TrustStrip';
import { UpcomingEvents } from '@/components/UpcomingEvents';

export default function Home() {
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
