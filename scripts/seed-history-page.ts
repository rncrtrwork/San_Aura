import { connectToDatabase } from '@/lib/db';
import { Page } from '@/models/Page';
import { historyPageSeedMetadata, historyTimelineSection } from '@/server/content/historyPageSeed';

export async function seedHistoryPage(): Promise<void> {
  await connectToDatabase();

  const metadata = historyPageSeedMetadata();
  const timeline = historyTimelineSection();
  const existingPage = await Page.findOne({ slug: metadata.slug }).select(
    'slug title navLabel navVisibility seoTitle metaDescription publishStatus sections lastEditedAt',
  );
  const now = new Date();

  if (!existingPage) {
    await Page.create({
      ...metadata,
      sections: [timeline],
      lastEditedAt: now,
    });
    return;
  }

  let changed = false;
  if (!existingPage.title) {
    existingPage.title = metadata.title;
    changed = true;
  }
  if (!existingPage.navLabel) {
    existingPage.navLabel = metadata.navLabel;
    changed = true;
  }
  if (!existingPage.seoTitle) {
    existingPage.seoTitle = metadata.seoTitle;
    changed = true;
  }
  if (!existingPage.metaDescription) {
    existingPage.metaDescription = metadata.metaDescription;
    changed = true;
  }
  if (!existingPage.navVisibility) {
    existingPage.navVisibility = metadata.navVisibility;
    changed = true;
  }
  if (!existingPage.sections.some((section) => section.key === timeline.key)) {
    existingPage.sections.push(timeline);
    existingPage.publishStatus = 'draft';
    changed = true;
  }

  if (changed) {
    existingPage.lastEditedAt = now;
    await existingPage.save();
  }
}

if (require.main === module) {
  seedHistoryPage()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((error: Error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
