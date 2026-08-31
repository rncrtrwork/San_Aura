import Image from 'next/image';
import { gallery } from '@/lib/content';
import { SectionHeading } from './SectionHeading';

export function GalleryStrip() {
  return (
    <section className="bg-[linear-gradient(0deg,#fbf0e4,#f1ecdf)] px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:pb-5 lg:pt-8">
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Gallery" linkLabel="View Full Gallery" />
        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 md:-mx-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
          {gallery.map((image, index) => (
            <div key={image.src} className="relative aspect-[1.25/1] min-w-[78vw] snap-center overflow-hidden rounded-md sm:min-w-[46vw] lg:min-w-0">
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 20vw, 78vw" className="object-cover transition duration-500 hover:scale-[1.03]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
