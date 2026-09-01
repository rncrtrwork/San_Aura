import { CONTENT_PAGE_DEFAULTS } from '@/lib/contentManager';
import type { PageSection } from '@/models/Page';

export function historyTimelineSection(): PageSection {
  return {
    key: 'history-timeline',
    type: 'timeline',
    active: true,
    hero: null,
    richText: null,
    timeline: {
      sectionLabel: 'Sun Aura History',
      backgroundColor: 'ivory',
      layout: 'alternating',
      showOnNavigation: true,
      items: [
        {
          year: '1930s',
          title: 'Clothing-optional roots',
          description:
            'Sun Aura traces its resort story back to the 1930s, with a long history as a nudist and clothing-optional destination in Northwest Indiana.',
        },
        {
          year: 'Around 1970',
          title: 'The giant leg becomes a landmark',
          description:
            'The working sundial known as the giant leg became one of the property’s most recognizable roadside landmarks.',
        },
        {
          year: '2015',
          title: 'A landmark restoration',
          description:
            'After new ownership took over, the giant leg was repaired, refinished, and restored in time for Memorial Day weekend.',
        },
        {
          year: '2021',
          title: 'More poolside space',
          description:
            'The resort added a conversation pool, expanding the pool area alongside the established Olympic-sized pool.',
        },
        {
          year: 'Present day',
          title: 'A 300-acre resort community',
          description:
            'Sun Aura continues as an adults-only retreat with camping, cabins, wooded trails, weekend dances, and year-round hospitality.',
        },
      ],
    },
    cta: null,
    gallery: null,
  };
}

export function historyPageSeedMetadata() {
  return {
    slug: 'history',
    title: CONTENT_PAGE_DEFAULTS.history.title,
    navLabel: CONTENT_PAGE_DEFAULTS.history.navLabel,
    navVisibility: true,
    seoTitle: 'Sun Aura Resort History',
    metaDescription: 'Explore the story, landmarks, and milestones of Sun Aura Resort.',
    publishStatus: 'draft' as const,
  };
}
