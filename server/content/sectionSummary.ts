import type { ContentSectionSummary } from '@/lib/contentManager';
import type { PageSection } from '@/models/Page';

type SummarySection = Pick<
  PageSection,
  'key' | 'type' | 'active' | 'hero' | 'richText' | 'timeline' | 'cta' | 'gallery'
>;

function textPreview(value: string): string {
  const preview = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return preview.length > 70 ? `${preview.slice(0, 67)}...` : preview;
}

export function contentSectionSummary(section: SummarySection): ContentSectionSummary {
  let label = 'Gallery section';
  if (section.type === 'hero') label = section.hero?.heading || 'Hero section';
  if (section.type === 'richText') {
    label = textPreview(section.richText?.body ?? '') || 'Rich text section';
  }
  if (section.type === 'timeline') label = section.timeline?.sectionLabel || 'Timeline section';
  if (section.type === 'cta') label = section.cta?.heading || 'CTA section';
  if (section.type === 'gallery') label = section.gallery?.heading || 'Gallery section';

  return {
    key: section.key,
    type: section.type,
    active: section.active,
    label,
  };
}
