import Image from 'next/image';

export function GolfCartRental() {
  return (
    <article className="grid h-full overflow-hidden rounded-lg bg-[#f2eee5] md:grid-cols-[1fr_1fr]">
      <button type="button" className="flex min-h-[230px] flex-col items-center justify-center px-4 py-5" aria-label="Golf cart rentals">
        <span className="relative block aspect-square w-full max-w-[210px]">
          <Image src="/images/golf-cart-tire.png" alt="Just an Old Cart LLC tire emblem" fill sizes="210px" className="object-contain mix-blend-multiply" />
        </span>
        <span className="mt-1 text-xs text-ink-700">Golf cart rentals</span>
      </button>
      <div className="flex flex-col justify-center px-6 py-6 text-center text-[13px] leading-6 text-ink-700">
        <p>If you&apos;d like to rent a golf cart while visiting our resort, just click on the tire or call our partner,</p>
        <p className="mt-3">Just an Old Cart at <span className="whitespace-nowrap">219-613-4633</span></p>
        <p className="mt-6">They adjoin our property and will be glad to rent you a great cart for your stay.</p>
      </div>
    </article>
  );
}
