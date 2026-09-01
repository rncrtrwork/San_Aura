import type { ContentPreviewPage } from '@/lib/contentManager';
import { getContentPreviewPage } from '@/server/content/getContentPreviewPage';

export async function getPublicContentPage(slug: string): Promise<ContentPreviewPage | null> {
  try {
    const page = await getContentPreviewPage(slug);
    if (!page || page.publishStatus !== 'published' || page.sections.length === 0) return null;
    return page;
  } catch {
    return null;
  }
}
