import type { ContentTimelineItem, TimelineSectionMutationRequest } from '@/lib/contentManager';

export type TimelineSectionValidationResult =
  | { valid: true; data: TimelineSectionMutationRequest }
  | { valid: false; message: string };

type TimelineSectionInput = Partial<Omit<TimelineSectionMutationRequest, 'active' | 'items'>> & {
  active?: boolean;
  items?: Partial<ContentTimelineItem>[];
};

function textValue(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function cleanSectionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function timelineItems(
  input: Partial<ContentTimelineItem>[] | undefined,
): ContentTimelineItem[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const items = input
    .map((item) => ({
      year: typeof item.year === 'string' ? textValue(item.year, 20) : '',
      title: typeof item.title === 'string' ? textValue(item.title, 200) : '',
      description: typeof item.description === 'string' ? textValue(item.description, 5000) : '',
    }))
    .filter((item) => item.year || item.title || item.description);

  if (
    items.length === 0 ||
    items.length > 20 ||
    items.some((item) => !item.year || !item.title || !item.description)
  ) {
    return null;
  }

  return items;
}

export function validateTimelineSection(
  input: TimelineSectionInput | null,
): TimelineSectionValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Timeline section details are required.' };
  }

  const sectionKey = typeof input.sectionKey === 'string' ? cleanSectionKey(input.sectionKey) : '';
  const sectionLabel =
    typeof input.sectionLabel === 'string' ? textValue(input.sectionLabel, 120) : 'Our History';
  const backgroundColor =
    typeof input.backgroundColor === 'string' ? textValue(input.backgroundColor, 30) : 'ivory';
  const layout = input.layout === 'stacked' ? 'stacked' : 'alternating';
  const showOnNavigation = input.showOnNavigation !== false;
  const active = input.active === true;
  const parsedItems = timelineItems(input.items);

  if (!sectionLabel) {
    return { valid: false, message: 'Timeline section label is required.' };
  }
  if (!parsedItems) {
    return {
      valid: false,
      message: 'Add at least one complete timeline item with year, title, and description.',
    };
  }

  return {
    valid: true,
    data: {
      sectionKey,
      sectionLabel,
      backgroundColor,
      layout,
      showOnNavigation,
      items: parsedItems,
      active,
    },
  };
}
