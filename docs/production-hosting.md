# Production hosting and environment setup

This runbook closes the Phase 14 production hosting and environment item. The final host can be Vercel, Render, Railway, or another Node.js 20.9+ provider that supports Next.js 16, persistent environment variables, HTTPS, and outbound access to MongoDB Atlas and Cloudinary.

## Runtime

- Node.js: `20.9.0` or newer.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Start command: `npm run start`.
- Production branch: `staging` after the Phase 14 PR is merged, then the final release branch when the client approves cutover.

## Required environment variables

Set these in the production host, not in the repository:

```txt
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://sunauraresort.net
MONGODB_URI=mongodb+srv://sun-aura-app:<password>@<cluster-host>/sun-aura-resort?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=<production-cloud-name>
CLOUDINARY_API_KEY=<production-api-key>
CLOUDINARY_API_SECRET=<production-api-secret>
SESSION_SECRET=<random-32-plus-character-secret>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM_EMAIL=<verified-from-address>
```

## Deployment verification

After setting environment variables, run:

```bash
npm run verify:production
npm run test
npm run lint
npm run typecheck
npm run build
```

Then smoke-test:

- Public homepage, stays and rates, events, FAQ, gallery, resort map, booking request, and contact pages.
- Staff login and dashboard.
- Member login request and member portal landing.
- Cloudinary upload signature endpoints from staff workflows.
- Reservation confirmation email path with the production SMTP account.

## DNS preparation

- Keep Weebly live until the soft-launch trial is accepted.
- Lower DNS TTL to 300 seconds at least 24 hours before cutover.
- Confirm the production host has both `sunauraresort.net` and `www.sunauraresort.net` configured with HTTPS certificates.
- Do not remove Weebly records until the cutover checklist is complete.
