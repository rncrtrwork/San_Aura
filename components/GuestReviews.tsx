import Script from 'next/script';

export function GuestReviews() {
  return (
    <section
      aria-labelledby="guest-reviews-heading"
      className="px-6 py-6 md:px-10 md:py-8 lg:px-8 bg-[#f5e9d7]"
    >
      <div className="mx-auto max-w-[1360px]">
        <div>
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
