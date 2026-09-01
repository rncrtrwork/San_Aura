import type { ActivitySnapshot } from '@/models/ActivityLog';
import type { PagePublishStatus, PageSectionType } from '@/models/Page';

export type PublishSnapshotPage = {
  slug: string;
  title: string;
  publishStatus: PagePublishStatus;
  lastEditedAt: Date;
  sections: { key: string; type: PageSectionType; active: boolean }[];
};

export function contentPagePublishSnapshot(page: PublishSnapshotPage): ActivitySnapshot {
  const activeSections = page.sections.filter((section) => section.active);

  return {
    slug: page.slug,
    title: page.title,
    publishStatus: page.publishStatus,
    lastEditedAt: page.lastEditedAt,
    sectionCount: page.sections.length,
    activeSectionCount: activeSections.length,
    sectionTypes: page.sections.map((section) => section.type),
    activeSectionKeys: activeSections.map((section) => section.key),
  };
}
