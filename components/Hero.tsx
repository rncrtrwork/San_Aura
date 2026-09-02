import Image from 'next/image';
import { BookingSearchCard } from './BookingSearchCard';

export function Hero() {
  return (
    <section
      id="top"
      className="relative -mt-[75px] min-h-[795px] bg-forest-900 md:min-h-[765px] lg:h-[755px] lg:min-h-0"
    >
      <Image
        src="/images/hero-resort.png"
        alt="Sunlit woodland lodge and tranquil reflecting pool"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[48%_center]"
      />
      <div className="absolute inset-0" />
      <div className="relative mx-auto flex h-full min-h-[795px] max-w-[1280px] flex-col justify-center px-6 pb-6 pt-[83px] md:min-h-[765px] md:px-10 lg:min-h-0 lg:px-12 lg:pb-0">
        <div className="mx-auto w-full max-w-[950px] pt-2 text-white md:pt-0 lg:translate-y-8">
          <div className="lg:pl-[210px]">
            <h1 className="max-w-[720px] font-serif text-[42px] font-normal leading-[1.08] tracking-[-.02em] md:text-[58px] lg:text-[64px]">
              Room to breathe.
              <br />
              Space to belong.
            </h1>
            <p className="mt-5 text-base font-light md:text-[19px]">
              A private 300-acre retreat in Northwest Indiana.
            </p>
          </div>
          <div id="booking" className="mt-10 lg:mt-28">
            <BookingSearchCard />
          </div>
        </div>
      </div>
    </section>
  );
}
