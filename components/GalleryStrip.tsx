import { getPublicGalleryPage } from '@/server/public/getPublicGalleryPage';
import { SectionHeading } from './SectionHeading';

export async function GalleryStrip() {
  const albumGroups = await getPublicGalleryPage();
  const images = albumGroups
    .flatMap((group) => group.assets)
    .filter((asset) => asset.mediaType === 'image')
    .slice(0, 5);

  return (
    <section className="bg-[linear-gradient(0deg,#fbf0e4,#f1ecdf)] px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:pb-5 lg:pt-8">
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Gallery" linkLabel="View Full Gallery" href="/gallery" />
        {images.length > 0 ? (
          <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 md:-mx-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
            {images.map((image) => (
              <div
                key={image.id}
                role="img"
                aria-label={image.altText}
                className="relative aspect-[1.25/1] min-w-[78vw] snap-center overflow-hidden rounded-md bg-cover transition duration-500 hover:scale-[1.03] sm:min-w-[46vw] lg:min-w-0"
                style={{
                  backgroundImage: `url("${image.url}")`,
                  backgroundPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-[#fbfaf6] p-8 text-center">
            <p className="font-serif text-2xl text-forest-900">Gallery media is coming soon</p>
            <p className="mt-2 text-sm text-ink-700">
              Approved gallery images published from admin will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
