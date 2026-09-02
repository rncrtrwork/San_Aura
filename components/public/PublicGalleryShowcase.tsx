'use client';

import { ArrowLeft, ArrowRight, Images, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PublicGalleryAlbumGroup, PublicGalleryAsset } from '@/lib/publicGallery';

type PublicGalleryShowcaseProps = {
  albumGroups: PublicGalleryAlbumGroup[];
};

type GalleryImage = PublicGalleryAsset & {
  albumLabel: string;
};

function galleryImages(albumGroups: PublicGalleryAlbumGroup[]): GalleryImage[] {
  return albumGroups.flatMap((group) =>
    group.assets
      .filter((asset) => asset.mediaType === 'image')
      .map((asset) => ({ ...asset, albumLabel: group.albumLabel })),
  );
}

export function PublicGalleryShowcase({ albumGroups }: PublicGalleryShowcaseProps) {
  const images = useMemo(() => galleryImages(albumGroups), [albumGroups]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const selectedImage = selectedImageId
    ? (images.find((image) => image.id === selectedImageId) ?? null)
    : null;
  const selectedIndex = selectedImage
    ? images.findIndex((image) => image.id === selectedImage.id)
    : -1;

  function selectRelativeImage(direction: 'previous' | 'next') {
    if (selectedIndex < 0 || images.length === 0) return;
    const offset = direction === 'previous' ? -1 : 1;
    const nextIndex = (selectedIndex + offset + images.length) % images.length;
    setSelectedImageId(images[nextIndex]?.id ?? null);
  }

  if (images.length === 0) {
    return (
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[960px] rounded-[2rem] border border-line bg-[#fbfaf6] p-10 text-center shadow-card">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-cream-alt text-gold-700">
            <Images aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-5 font-serif text-3xl text-forest-900">Gallery photos are coming soon</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-700">
            Photos uploaded from the admin Gallery page will appear here automatically.
          </p>
        </div>
      </section>
    );
  }

  const heroImage = images[0];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-900 px-6 py-24 text-white md:px-10 md:py-28 lg:px-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-45"
          style={{
            backgroundImage: `url("${heroImage.url}")`,
            backgroundPosition: `${heroImage.focalPoint.x}% ${heroImage.focalPoint.y}%`,
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-900 via-forest-900/75 to-forest-900/20" />
        <div className="mx-auto max-w-[1360px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Gallery
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl lg:text-7xl">
            A closer look at the resort.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Browse public gallery photos selected by the Sun Aura team — from wooded paths and
            cabins to poolside days and quiet golden-hour views.
          </p>
        </div>
      </section>

      <section className="bg-cream px-6 py-14 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid auto-rows-[12rem] gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image, index) => {
              const largeTile = index % 7 === 0;
              const tallTile = index % 7 === 3;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  className={`group relative overflow-hidden rounded-[1.5rem] bg-forest-900 text-left shadow-card ${
                    largeTile ? 'sm:col-span-2 sm:row-span-2' : ''
                  } ${tallTile ? 'lg:row-span-2' : ''}`}
                >
                  <span
                    role="img"
                    aria-label={image.altText}
                    className="absolute inset-0 bg-cover transition duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url("${image.url}")`,
                      backgroundPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
                    }}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/10 to-transparent opacity-80 transition group-hover:opacity-95" />
                  <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur">
                      {image.albumLabel}
                    </span>
                    <span className="mt-3 block font-serif text-2xl leading-tight">
                      {image.caption || image.altText}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-[100] bg-forest-900/92 px-4 py-6 text-white backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.altText}
        >
          <div className="mx-auto flex h-full max-w-[1280px] flex-col">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
                  {selectedImage.albumLabel}
                </p>
                <p className="mt-1 text-sm text-cream">
                  {selectedIndex + 1} of {images.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageId(null)}
                className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Close gallery photo"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-black">
              <div
                role="img"
                aria-label={selectedImage.altText}
                className="h-full w-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${selectedImage.url}")` }}
              />
              <button
                type="button"
                onClick={() => selectRelativeImage('previous')}
                className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                aria-label="Previous gallery photo"
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => selectRelativeImage('next')}
                className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                aria-label="Next gallery photo"
              >
                <ArrowRight aria-hidden="true" className="size-5" />
              </button>
            </div>
            <p className="mt-4 text-center text-lg leading-7 text-cream">
              {selectedImage.caption || selectedImage.altText}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
