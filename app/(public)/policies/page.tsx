import { PublicManagedContentPage } from '@/components/public/PublicManagedContentPage';
import { getPublicManagedContentPage } from '@/server/public/getPublicManagedContentPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Policies | Sun Aura Resort',
  description: 'Review Sun Aura Resort privacy, reservation, pet, and guest policies.',
};

export default async function PoliciesPage() {
  const page = await getPublicManagedContentPage('policies');

  return (
    <PublicManagedContentPage
      eyebrow="Policies"
      title="Privacy, reservations, pets, and resort policy details."
      intro="Published policies give guests a plain-language place to review expectations before submitting a reservation request."
      emptyTitle="Policies are coming soon"
      page={page}
    />
  );
}
