export type PublicSeoSource = {
  title: string;
  seoTitle: string;
  metaDescription: string;
};

export type PublicSeoFallback = {
  title: string;
  description: string;
};

export function publicSeoFields(
  source: PublicSeoSource | null,
  fallback: PublicSeoFallback,
): PublicSeoFallback {
  return {
    title: source?.seoTitle.trim() || source?.title.trim() || fallback.title,
    description: source?.metaDescription.trim() || fallback.description,
  };
}
