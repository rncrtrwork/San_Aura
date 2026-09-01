import { PublicManagedContentPage } from '@/components/public/PublicManagedContentPage';
import { getPublicManagedContentPage } from '@/server/public/getPublicManagedContentPage';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const page = await getPublicManagedContentPage('rules');

  return (
    <PublicManagedContentPage
      eyebrow="Resort rules"
      title="Shared expectations for a respectful stay."
      intro="Published resort rules appear here by category, giving guests a clear reference before they book and arrive."
      emptyTitle="Resort rules are coming soon"
      page={page}
    />
  );
}
