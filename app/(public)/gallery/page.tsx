import { PublicGalleryShowcase } from '@/components/public/PublicGalleryShowcase';
import { getPublicGalleryPage } from '@/server/public/getPublicGalleryPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery | Sun Aura Resort',
  description: 'Browse Sun Aura Resort gallery photos selected for the public website.',
};

export default async function GalleryPage() {
  const albumGroups = await getPublicGalleryPage();

  return <PublicGalleryShowcase albumGroups={albumGroups} />;
}
