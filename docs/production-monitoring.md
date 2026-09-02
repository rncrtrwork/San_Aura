# Production error monitoring

This runbook closes the Phase 14 error monitoring and logging item. The application is wired for Sentry through the official Next.js SDK and captures server, edge, client, and App Router request errors.

## Sentry project

- Create a Sentry organization or use the client's existing organization.
- Create a production project named `resort-platform`.
- Configure alert routing for new high-severity issues and repeated reservation/member/admin failures.
- Add the production release environment as `production`.

## Environment variables

Set these in the production host:

```txt
SENTRY_DSN=<sentry-production-dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry-production-dsn>
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05
SENTRY_ORG=<sentry-org-slug>
SENTRY_PROJECT=<sentry-project-slug>
SENTRY_AUTH_TOKEN=<sentry-token-with-source-map-upload-access>
```

## What is captured

- Server runtime errors through `sentry.server.config.ts`.
- Edge runtime errors through `sentry.edge.config.ts`.
- Browser errors through `instrumentation-client.ts`.
- App Router request errors through `instrumentation.ts`.
- Render-level failures through `app/global-error.tsx`.

## Launch verification

After production env vars are present:

```bash
npm run verify:production
npm run build
```

Then trigger a controlled test error in a non-public staging deployment and confirm it appears in the Sentry project before cutover.
