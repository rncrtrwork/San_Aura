import Link from 'next/link';
import { MembershipPlans } from '@/components/public/MembershipPlans';

export const metadata = {
  title: 'Join Us | Sun Aura Resort',
  description: 'Compare Sun Aura Resort membership plans and request membership information.',
};

export default function JoinUsPage() {
  return (
    <>
      <MembershipPlans />
      <section className="bg-cream-alt px-6 py-14 text-center md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-[#fbfaf6] p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
            Already a member?
          </p>
          <h2 className="mt-3 font-serif text-3xl text-forest-900">Access your member portal</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-700">
            Active members can request a secure magic link to view membership, payments, documents,
            and billing details.
          </p>
          <Link
            href="/member/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-forest-900 px-6 text-sm font-bold text-white hover:bg-forest-800"
          >
            Member Login
          </Link>
        </div>
      </section>
    </>
  );
}
