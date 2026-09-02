import { withSentryConfig } from '@sentry/nextjs/config';

const legacyPublicRedirects = [
  { source: '/index.html', destination: '/', statusCode: 301 },
  { source: '/book-your-reservations-online.html', destination: '/book', statusCode: 301 },
  { source: '/frequently-asked-questions.html', destination: '/faq', statusCode: 301 },
  { source: '/rules-and-safety-information.html', destination: '/rules', statusCode: 301 },
  { source: '/map-of-sun-aura-resort.html', destination: '/resort-map', statusCode: 301 },
  { source: '/images-of-sun-aura.html', destination: '/gallery', statusCode: 301 },
  {
    source: '/camping-fees-and-rental-prices.html',
    destination: '/stays-and-rates',
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

const nextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return legacyPublicRedirects;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
