import { ExploreResort } from '@/components/ExploreResort';
import { GalleryStrip } from '@/components/GalleryStrip';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { InfoFooterRow } from '@/components/InfoFooterRow';
import { SiteFooter } from '@/components/SiteFooter';
import { StayYourWay } from '@/components/StayYourWay';
import { TrustStrip } from '@/components/TrustStrip';
import { UpcomingEvents } from '@/components/UpcomingEvents';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <UpcomingEvents />
        <StayYourWay />
        <ExploreResort />
        <GalleryStrip />
      </main>
      <div
        className="bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/footer-bg.png')",
          backgroundPosition: 'center 100%',
        }}
      >
        <InfoFooterRow />
        <SiteFooter />
      </div>
    </>
  );
}
