import Image from 'next/image';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-admin-canvas px-5 py-12">
      <section className="admin-card w-full max-w-md p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo-enhanced.png"
            alt="Sun Aura Resort"
            width={96}
            height={96}
            priority
            className="h-24 w-auto object-contain"
          />
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-admin-accent">
            Staff Administration
          </p>
          <h1 className="mt-2 font-serif text-4xl text-forest-900">Welcome back</h1>
          <p className="mt-2 text-sm text-admin-muted">Sign in with your staff account.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
