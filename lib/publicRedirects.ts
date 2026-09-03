export type PublicRedirect = {
  source: string;
  destination: string;
  statusCode: 301;
};

export const PUBLIC_WEBSITE_REDIRECTS: PublicRedirect[] = [
  { source: '/index.html', destination: '/', statusCode: 301 },
  {
    source: '/book-your-reservations-online.html',
    destination: '/resort-explore',
    statusCode: 301,
  },
  { source: '/frequently-asked-questions.html', destination: '/faq', statusCode: 301 },
  { source: '/rules-and-safety-information.html', destination: '/rules', statusCode: 301 },
  { source: '/map-of-sun-aura-resort.html', destination: '/resort-explore', statusCode: 301 },
  { source: '/images-of-sun-aura.html', destination: '/gallery', statusCode: 301 },
  {
    source: '/camping-fees-and-rental-prices.html',
    destination: '/resort-explore',
    statusCode: 301,
  },
  { source: '/about-sun-aura.html', destination: '/our-story', statusCode: 301 },
  { source: '/untitled.html', destination: '/events', statusCode: 301 },
  { source: '/this-weekend-at-sun-aura.html', destination: '/events', statusCode: 301 },
  { source: '/camp-out-week-2026.html', destination: '/events', statusCode: 301 },
  { source: '/queen-bees-honey-trap.html', destination: '/events', statusCode: 301 },
  { source: '/november-2019.html', destination: '/events', statusCode: 301 },
  { source: '/december-2019.html', destination: '/events', statusCode: 301 },
  { source: '/august-2019.html', destination: '/events', statusCode: 301 },
  { source: '/june-2019.html', destination: '/events', statusCode: 301 },
  { source: '/our-giant-leg-restored.html', destination: '/history', statusCode: 301 },
  { source: '/new-page.html', destination: '/', statusCode: 301 },
];
