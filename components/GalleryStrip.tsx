import { getPublicHomeGalleryImages } from '@/server/public/getPublicGalleryPage';
import { SectionHeading } from './SectionHeading';

export async function GalleryStrip() {
  const images = await getPublicHomeGalleryImages();
  const visibleCopies = images.length > 0 ? Math.max(2, Math.ceil(10 / images.length)) : 0;
  const baseFlowImages = Array.from(
    { length: images.length * visibleCopies },
    (_, index) => images[index % images.length],
  );
  const flowImages = [...baseFlowImages, ...baseFlowImages];

  return (
    <section className="overflow-hidden bg-[linear-gradient(0deg,#fbf0e4,#f1ecdf)] px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:pb-5 lg:pt-8">
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Gallery" linkLabel="View Full Gallery" href="/gallery" />
        {images.length > 0 ? (
          <div className="-mx-6 overflow-hidden px-6 pb-2 md:-mx-10 md:px-10 lg:mx-0 lg:px-0">
            <div className="gallery-flow-track flex w-max gap-3">
              {flowImages.map((image, index) => (
                <div
                  key={`${image.id}-${index}`}
                  role={index >= images.length ? 'presentation' : 'img'}
                  aria-hidden={index >= images.length ? true : undefined}
                  aria-label={index >= images.length ? undefined : image.altText}
                  className="relative aspect-[1.25/1] w-[78vw] shrink-0 overflow-hidden rounded-md bg-cover transition duration-500 hover:scale-[1.03] sm:w-[46vw] lg:w-[250px] xl:w-[270px]"
                  style={{
                    backgroundImage: `url("${image.url}")`,
                    backgroundPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-[#fbfaf6] p-8 text-center">
            <p className="font-serif text-2xl text-forest-900">
              Home gallery photos are coming soon
            </p>
            <p className="mt-2 text-sm text-ink-700">
              Select photos for the Home gallery from the admin Gallery page.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
