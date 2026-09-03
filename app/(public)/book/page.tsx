import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Resort Explore | Sun Aura Resort',
  description: 'Explore resort sites and submit a reservation request for Sun Aura Resort.',
};

export default function BookPage() {
  redirect('/resort-explore');
}
