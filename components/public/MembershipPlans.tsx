import { Check } from 'lucide-react';
import Link from 'next/link';

type MembershipPlan = {
  name: string;
  description: string;
  price: number;
  popular: boolean;
  features: string[];
};

const membershipPlans: MembershipPlan[] = [
  {
    name: 'Explorer',
    description: 'Perfect for weekend getaways and short stays.',
    price: 99,
    popular: false,
    features: [
      '10% off all stays',
      'Priority booking 3 days early',
      'Member perks and offers',
      'Earn resort credits',
    ],
  },
  {
    name: 'Adventurer',
    description: 'Our most popular plan for frequent travelers.',
    price: 199,
    popular: true,
    features: [
      '15% off all stays',
      'Priority booking 7 days early',
      'Member perks and offers',
      'Earn resort credits',
      'Bring guests at member rates',
      'Access to member events',
    ],
  },
  {
    name: 'Explorer Plus',
    description: 'The ultimate experience with maximum benefits.',
    price: 299,
    popular: false,
    features: [
      '20% off all stays',
      'Priority booking 14 days early',
      'Member perks and offers',
      'Earn resort credits',
      'Bring guests at member rates',
      'Access to member events',
      'Free late checkout when available',
    ],
  },
];

export function MembershipPlans() {
  return (
    <section className="bg-cream px-6 py-16 text-forest-900 md:px-10 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1180px] text-center">
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">Choose Your Membership</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-ink-700">
          Pick the plan that fits your lifestyle and start enjoying Sun Aura benefits.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {membershipPlans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex min-h-full flex-col rounded-lg border bg-[#fbfaf6] text-center shadow-card ${
                plan.popular ? 'border-forest-900 lg:-mt-4' : 'border-line'
              }`}
            >
              {plan.popular ? (
                <p className="rounded-t-lg bg-forest-900 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Most Popular
                </p>
              ) : null}
              <div className="flex flex-1 flex-col p-8">
                <h2 className="font-serif text-2xl uppercase tracking-[0.08em] text-forest-900">
                  {plan.name}
                </h2>
                <p className="mx-auto mt-3 max-w-64 text-sm leading-6 text-ink-700">
                  {plan.description}
                </p>
                <p className="mt-6 font-serif text-4xl text-forest-900">
                  ${plan.price}
                  <span className="ml-1 font-sans text-sm text-ink-700">/ year</span>
                </p>
                <ul className="mx-auto mt-8 grid max-w-72 gap-4 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-forest-900">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-900" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/contact?membership=${encodeURIComponent(plan.name)}`}
                  className={`mt-auto inline-flex h-12 items-center justify-center rounded border px-5 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                    plan.popular
                      ? 'border-forest-900 bg-forest-900 text-white hover:bg-forest-800'
                      : 'border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-white'
                  }`}
                >
                  Select Plan
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
