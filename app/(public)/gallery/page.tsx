import { getPublicGalleryPage } from '@/server/public/getPublicGalleryPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery | Sun Aura Resort',
  description: 'Browse approved Sun Aura Resort media grouped by album.',
};

export default async function GalleryPage() {
  const albumGroups = await getPublicGalleryPage();
  const hasAssets = albumGroups.some((group) => group.assets.length > 0);

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">Gallery</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Approved views of the resort, grouped by album.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Public media only appears here after staff approval, website publishing, and no-people
            privacy confirmation.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-12">
          {hasAssets ? (
            albumGroups.map((group) => (
              <section key={group.albumLabel} aria-labelledby={`${group.albumLabel}-heading`}>
                <h2
                  id={`${group.albumLabel}-heading`}
                  className="font-serif text-4xl text-forest-900"
                >
                  {group.albumLabel}
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.assets.map((asset) => (
                    <figure
                      key={asset.id}
                      className="overflow-hidden rounded-[1.5rem] border border-line bg-[#fbfaf6] shadow-card"
                    >
                      {asset.mediaType === 'video' ? (
                        <video
                          controls
                          className="aspect-[4/3] w-full bg-forest-900 object-cover"
                          aria-label={asset.altText}
                        >
                          <source src={asset.url} />
                        </video>
                      ) : (
                        <div
                          className="aspect-[4/3] bg-cover"
                          role="img"
                          aria-label={asset.altText}
                          style={{
                            backgroundImage: `url("${asset.url}")`,
                            backgroundPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%`,
                          }}
                        />
                      )}
                      {asset.caption ? (
                        <figcaption className="px-5 py-4 text-sm leading-6 text-ink-700">
                          {asset.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-10 text-center">
              <h2 className="font-serif text-3xl text-forest-900">Gallery media is coming soon</h2>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                Approved website-ready media will appear here after staff publishes it.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
