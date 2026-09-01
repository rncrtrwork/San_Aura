import type { Metadata } from 'next';
import { publicSeoFields, type PublicSeoFallback } from '@/lib/publicSeo';
import { connectToDatabase } from '@/lib/db';
import { Page } from '@/models/Page';

type PublicSeoLean = {
  title: string;
  seoTitle: string;
  metaDescription: string;
};

export async function getPublicSeoMetadata(
  slug: string,
  fallback: PublicSeoFallback,
): Promise<Metadata> {
  try {
    await connectToDatabase();
    const page = await Page.findOne({ slug, publishStatus: 'published' })
      .select('title seoTitle metaDescription')
      .lean<PublicSeoLean | null>();

    return publicSeoFields(page, fallback);
  } catch {
    return fallback;
  }
}
