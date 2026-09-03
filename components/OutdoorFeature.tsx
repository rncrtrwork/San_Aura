import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from './icons';

export function OutdoorFeature() {
  return (
    <section className="relative isolate min-h-[420px] overflow-hidden bg-forest-900 px-6 py-16 text-white md:px-10 md:py-20 lg:px-12">
      <Image
        src="/images/567.png"
        alt="Aerial view of Sun Aura Resort surrounded by forest"
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/50 to-forest-900/0"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1360px]">
        <div className="max-w-xl">
          <p className="font-serif text-4xl italic leading-none text-cream md:text-5xl">
            we ♡ outdoors at 
          </p>
          <h2 className="mt-1 text-5xl font-black uppercase leading-[0.88] tracking-[0.08em] text-cream md:text-6xl lg:text-7xl">
            Sun Aura
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm font-black uppercase tracking-[0.08em] text-white">
            <span>Sun Aura Resort</span>
            <span className="text-2xl text-gold-600" aria-hidden="true">
              +
            </span>
            <span>300 acres of nature</span>
          </div>
          <h3 className="mt-10 text-2xl font-bold text-white md:text-3xl">
            A private retreat made for fresh air, forest trails, and slow mornings.
          </h3>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/85">
            From wooded campsites to quiet gathering spaces, Sun Aura gives guests room to unplug,
            reconnect, and enjoy the outdoors at their own pace.
          </p>
          <Link
            href="#explore"
            className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:text-gold-600"
          >
            Explore More
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
