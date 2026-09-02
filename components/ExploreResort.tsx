import Image from 'next/image';
import { ArrowRight } from './icons';

function PrivacyWarning() {
  return (
    <aside
      className="flex overflow-hidden rounded-[9px] border border-[#e36e68] bg-white text-center text-ink-700 shadow-[0_1px_6px_rgba(151,27,22,.08)] lg:h-full lg:self-stretch"
      aria-label="Privacy notice"
    >
      <div className="flex w-full flex-col">
        <h3 className="bg-[#b31a19] px-3 py-[14px] text-[17px] font-bold uppercase tracking-[.025em] text-white">
          No Photos or Video
        </h3>
        <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
          <div className="relative mx-auto h-[72px] w-full max-w-[178px] overflow-hidden bg-white">
            <Image
              src="/images/privacy-icons.png"
              alt="Photography and video recording are prohibited"
              fill
              sizes="178px"
              className="object-contain"
            />
          </div>
          <p className="mx-auto mt-3 max-w-[220px] text-[12px] font-medium leading-[1.5]">
            For everyone&apos;s privacy and comfort, photos and video are not allowed anywhere on
            the property, <br />
            no exceptions.
          </p>
          <button
            type="button"
            className="mx-auto mt-auto inline-flex items-center gap-2 whitespace-nowrap pt-3 text-[10px] font-bold uppercase tracking-[.015em] text-[#b91d18]"
          >
            <span className="underline decoration-1 underline-offset-3">
              Learn More About Our Privacy
            </span>
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ExploreResort() {
  return (
    <section
      id="explore"
      className="bg-cream-alt px-6 py-14 md:px-10 md:py-20 lg:px-12 lg:py-[18px]"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-8 lg:grid-cols-[240px_minmax(0,1fr)_250px] lg:items-stretch lg:gap-7 xl:grid-cols-[280px_minmax(0,1fr)_260px] xl:gap-8">
        <div className="self-center">
          <h2 className="font-serif text-[27px] leading-tight text-forest-900 md:text-[32px]">
            Explore the Resort
          </h2>
          <p className="mt-5 max-w-[250px] text-[15px] leading-6 text-bold">
            Discover amenities, trails, and gathering spaces across 300 acres of natural beauty.
          </p>
          <button
            type="button"
            className="mt-6 rounded bg-forest-900 px-8 py-4 text-[10px] font-semibold uppercase tracking-[.06em] text-white transition-colors hover:bg-forest-800"
          >
            View Resort Map
          </button>
        </div>
        <div className="relative aspect-[2.7/1] min-h-[190px] overflow-hidden rounded-lg shadow-sm">
          <Image
            src="/images/resort-map.jpg"
            alt="Illustrated map of Sun Aura Resort"
            fill
            sizes="(min-width: 1024px) 75vw, 100vw"
            className="object-cover"
          />
        </div>
        <PrivacyWarning />
      </div>
    </section>
  );
}
