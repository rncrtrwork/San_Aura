import {
  groupedPublicManagedContentItems,
  type PublicManagedContentItem,
  type PublicManagedContentPage,
} from '@/lib/publicManagedContent';
import { connectToDatabase } from '@/lib/db';
import { Policy } from '@/models/Policy';
import { ResortRule } from '@/models/ResortRule';
import { sanitizeRichTextPreviewHtml } from '@/server/content/richTextPreview';

export type PublicManagedContentKind = 'rules' | 'policies';

type PublicManagedContentLean = {
  _id: { toString(): string };
  category: string;
  title: string;
  body: string;
  relatedLinks?: { label: string; url: string }[];
  displayOrder: number;
};

function serializeItem(item: PublicManagedContentLean): PublicManagedContentItem {
  return {
    id: item._id.toString(),
    category: item.category,
    title: item.title,
    body: sanitizeRichTextPreviewHtml(item.body),
    relatedLinks: item.relatedLinks ?? [],
    displayOrder: item.displayOrder,
  };
}

export async function getPublicManagedContentPage(
  kind: PublicManagedContentKind,
): Promise<PublicManagedContentPage> {
  try {
    await connectToDatabase();
    const model = kind === 'rules' ? ResortRule : Policy;
    const items = await model
      .find({ status: 'published' })
      .select('category title body relatedLinks displayOrder')
      .sort({ displayOrder: 1, category: 1, title: 1 })
      .lean<PublicManagedContentLean[]>();

    return groupedPublicManagedContentItems(items.map(serializeItem));
  } catch {
    return groupedPublicManagedContentItems([]);
  }
}
