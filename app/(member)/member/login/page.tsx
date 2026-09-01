import Link from 'next/link';
import { MemberLoginForm } from '@/components/member/MemberLoginForm';

export const metadata = {
  title: 'Member Login | Sun Aura Resort',
  description: 'Request secure access to the Sun Aura Resort member portal.',
};

export default function MemberLoginPage() {
  return (
    <main id="main-content" className="min-h-screen bg-cream px-6 py-12 text-forest-900">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.14em] text-gold-700">
            Sun Aura Resort
          </Link>
          <h1 className="mt-6 font-serif text-5xl leading-tight">Member portal access</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-700">
            Request a secure sign-in link using the email on your active membership record. Member
            sessions are separate from staff admin sessions.
          </p>
        </section>
        <section className="rounded-[2rem] border border-line bg-[#fbfaf6] p-8 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
            Magic link sign-in
          </p>
          <MemberLoginForm />
        </section>
      </div>
    </main>
  );
}
