import type { PagePublishStatus } from '@/models/Page';

export type PublicNavigationItem = {
  slug: string;
  label: string;
  href: string;
};

export type PublicNavigationPage = {
  slug: string;
  title: string;
  navLabel: string;
  navVisibility: boolean;
  publishStatus: PagePublishStatus;
};

const PUBLIC_NAVIGATION_ORDER = [
  'home',
  'stays-and-rates',
  'events',
  'resort-map',
  'gallery',
  'our-story',
  'history',
  'first-visit',
  'faq',
  'rules',
  'policies',
  'contact',
  'book',
] as const;

export const PUBLIC_DEFAULT_NAVIGATION: PublicNavigationItem[] = [
  { slug: 'home', label: 'Home', href: '/' },
  { slug: 'stays-and-rates', label: 'Stays & Rates', href: '/stays-and-rates' },
  { slug: 'events', label: 'Events', href: '/events' },
  { slug: 'resort-map', label: 'Resort Map', href: '/resort-map' },
  { slug: 'gallery', label: 'Gallery', href: '/gallery' },
  { slug: 'our-story', label: 'Our Story', href: '/our-story' },
  { slug: 'first-visit', label: 'First Visit', href: '/first-visit' },
  { slug: 'faq', label: 'FAQ', href: '/faq' },
  { slug: 'contact', label: 'Contact', href: '/contact' },
];

function navigationRank(slug: string): number {
  const rank = PUBLIC_NAVIGATION_ORDER.findIndex((entry) => entry === slug);
  return rank === -1 ? PUBLIC_NAVIGATION_ORDER.length : rank;
}

export function publicPageHref(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`;
}

export function publicNavigationItems(pages: PublicNavigationPage[]): PublicNavigationItem[] {
  const visiblePages = pages
    .filter(
      (page) =>
        page.navVisibility &&
        page.publishStatus === 'published' &&
        page.slug !== 'footer' &&
        page.slug.length > 0,
    )
    .sort((left, right) => {
      const rankDifference = navigationRank(left.slug) - navigationRank(right.slug);
      if (rankDifference !== 0) return rankDifference;
      return left.title.localeCompare(right.title);
    });

  if (visiblePages.length === 0) return PUBLIC_DEFAULT_NAVIGATION;

  return visiblePages.map((page) => ({
    slug: page.slug,
    label: page.navLabel.trim() || page.title,
    href: publicPageHref(page.slug),
  }));
}
