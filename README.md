# Sun Aura Resort

Modern public website, staff administration system, and member portal for Sun Aura Resort.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- MongoDB instance or MongoDB Atlas cluster
- Cloudinary account
- SMTP account for transactional email

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and provide the required credentials.

3. Seed roles, the initial administrator, and property defaults:

   ```bash
   npm run seed:initial
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` for the public site, `/admin` for staff administration,
   or `/member` for the member portal.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

CI runs lint and typecheck on every push and pull request.

Production hosts should also run `npm run verify:production` after environment variables are
configured.

## Project structure

- `app/(public)` — public resort website routes
- `app/(admin)` — authenticated staff routes
- `app/(member)` — member self-service routes
- `components` — shared and area-specific user interface components
- `lib` — infrastructure clients and shared utilities
- `models` — Mongoose schemas and models
- `server` — server-side services, authorization, and business logic
- `public` — production-safe static assets

## Configuration

All secrets belong in local or hosting-provider environment variables. Never commit `.env` files,
database credentials, Cloudinary secrets, session keys, or SMTP credentials.

The public media policy prohibits identifiable people in published images. Gallery and content
workflows must retain the approval boundary described in `plan.md`.

## Delivery workflow

Work is organized by the phases and task checkboxes in `plan.md`. Each completed task receives a
focused commit after lint, typecheck, and relevant build or test verification. Phase branches are
reviewed through pull requests before being merged into `staging`.
