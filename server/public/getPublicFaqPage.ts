import { groupedPublicFaqItems, type PublicFaqItem, type PublicFaqPage } from '@/lib/publicFaq';
import { connectToDatabase } from '@/lib/db';
import { FAQItem } from '@/models/FAQItem';
import { sanitizeRichTextPreviewHtml } from '@/server/content/richTextPreview';

type PublicFaqLean = {
  _id: { toString(): string };
  category: string;
  question: string;
  answer: string;
  relatedLinks?: { label: string; url: string }[];
  displayOrder: number;
  featured: boolean;
};

function serializeFaqItem(item: PublicFaqLean): PublicFaqItem {
  return {
    id: item._id.toString(),
    category: item.category,
    question: item.question,
    answer: sanitizeRichTextPreviewHtml(item.answer),
    relatedLinks: item.relatedLinks ?? [],
    displayOrder: item.displayOrder,
    featured: item.featured,
  };
}

export async function getPublicFaqPage(): Promise<PublicFaqPage> {
  try {
    await connectToDatabase();
    const items = await FAQItem.find({ status: 'published' })
      .select('category question answer relatedLinks displayOrder featured')
      .sort({ displayOrder: 1, category: 1, question: 1 })
      .lean<PublicFaqLean[]>();

    return groupedPublicFaqItems(items.map(serializeFaqItem));
  } catch {
    return groupedPublicFaqItems([]);
  }
}
