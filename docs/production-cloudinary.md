# Cloudinary production setup

This runbook closes the Phase 14 Cloudinary production readiness item. The production Cloudinary account must be owned by the client so media, documents, billing, and access controls remain under resort control.

## Environment

Create or select the production Cloudinary cloud and copy these values into the production host:

```txt
CLOUDINARY_CLOUD_NAME=<production-cloud-name>
CLOUDINARY_API_KEY=<production-api-key>
CLOUDINARY_API_SECRET=<production-api-secret>
```

Use separate development and production clouds. Do not reuse sandbox credentials after staff uploads real documents or public gallery assets.

## Folder structure

The application centralizes the Cloudinary folder map in code and validates public IDs against these folders:

| Folder                      | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `sun-aura/media`            | CMS hero images, public gallery assets, stay/rate media, map assets     |
| `sun-aura/events`           | Event-specific images uploaded from the Events module                   |
| `sun-aura/member-documents` | Staff-uploaded member ID, insurance, waiver, pet, and vehicle documents |
| `sun-aura/settings`         | Resort logo and property-level assets                                   |

## Naming convention

- Keep the `sun-aura/<area>/` prefix intact.
- Use lowercase descriptive names when manually renaming assets.
- Include the staff workflow area in tags: `media-library`, `content-hero`, `event`, `member-document`, or `settings`.
- Keep identifiable-people checks inside the app workflow before publishing gallery or CMS media.

## Access controls

- Limit Cloudinary dashboard access to the owner and one backup admin.
- Rotate the API secret after initial contractor handoff.
- Use signed uploads only; the app rejects upload signatures targeting folders outside the production map.

## Launch verification

Run the app gate before final media migration:

```bash
npm run test
npm run typecheck
npm run build
```

The production readiness tests validate Cloudinary env values and the shared folder map.
