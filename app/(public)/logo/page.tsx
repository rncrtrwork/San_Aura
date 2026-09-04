import Link from 'next/link';
import { getPublicLogo } from '@/server/public/getPublicLogo';
import { getPublicSeoMetadata } from '@/server/public/getPublicSeoMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPublicSeoMetadata('logo', {
    title: 'Logo | Sun Aura Resort',
    description: 'View the Sun Aura Resort logo.',
  });
}

export default async function LogoPage() {
  const logo = await getPublicLogo();

  return (
    <section className="bg-cream px-6 py-20 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-line bg-white/85 p-8 text-center shadow-card md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-700">Logo</p>
        <h1 className="mt-3 font-serif text-4xl text-forest-900 md:text-5xl">{logo.resortName}</h1>
        <div
          role="img"
          aria-label={`${logo.resortName} logo`}
          className="mx-auto mt-10 aspect-[1.5/1] w-full max-w-md rounded-[2rem] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${logo.logoUrl}")` }}
        />
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-forest-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
