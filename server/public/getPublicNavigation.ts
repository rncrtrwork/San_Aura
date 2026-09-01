import { connectToDatabase } from '@/lib/db';
import { publicNavigationItems, type PublicNavigationItem } from '@/lib/publicWebsite';
import { Page } from '@/models/Page';

type PublicNavigationLean = {
  slug: string;
  title: string;
  navLabel: string;
  navVisibility: boolean;
  publishStatus: 'draft' | 'published';
};

export async function getPublicNavigation(): Promise<PublicNavigationItem[]> {
  try {
    await connectToDatabase();

    const pages = await Page.find({ navVisibility: true, publishStatus: 'published' })
      .select('slug title navLabel navVisibility publishStatus')
      .lean<PublicNavigationLean[]>();

    return publicNavigationItems(pages);
  } catch {
    return publicNavigationItems([]);
  }
}
