import { ResortExploreExperience } from '@/components/public/ResortExploreExperience';
import { getPublicBookingOptions } from '@/server/public/getPublicBookingOptions';
import { getPublicResortMap } from '@/server/public/getPublicResortMap';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resort Explore | Sun Aura Resort',
  description:
    'Explore Sun Aura Resort sites on the map, compare stays, and submit a reservation request.',
};

export default async function ResortExplorePage() {
  const [sites, stayTypes] = await Promise.all([getPublicResortMap(), getPublicBookingOptions()]);

  return <ResortExploreExperience sites={sites} stayTypes={stayTypes} />;
}
