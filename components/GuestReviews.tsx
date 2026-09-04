import Script from 'next/script';

export function GuestReviews() {
  return (
    <section
      aria-labelledby="guest-reviews-heading"
      className="bg-[linear-gradient(180deg,#f1ecdf,#fbfaf6)] px-6 py-14 md:px-10 md:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-700">
            Guest Reviews
          </p>
          <h2
            id="guest-reviews-heading"
            className="mt-3 font-serif text-[34px] font-normal leading-tight text-forest-900 md:text-[44px]"
          >
            Stories from recent stays.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-700">
            See what guests are saying about their time at Sun Aura Resort.
          </p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-line bg-white/85 p-4 shadow-card md:p-6">
          <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
          <div
            className="elfsight-app-16b3637c-88ca-489b-aad8-6903cf1d01a4"
            data-elfsight-app-lazy=""
          />
        </div>
      </div>
    </section>
  );
}
