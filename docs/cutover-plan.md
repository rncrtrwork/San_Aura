# Cutover plan

This runbook closes the Phase 14 cutover item. Use it after the staff-only soft launch has met exit criteria and the owner approves the public launch window.

## Cutover owner

Assign one person to approve each step and one backup person who can pause the cutover if a Severity 1 issue appears.

## Prerequisites

- Phase 14 PR is merged.
- Production build is deployed and smoke-tested.
- `npm run verify:production` passes on the production host.
- MongoDB Atlas backups are enabled and a restore test has been completed.
- Cloudinary production uploads are working.
- Sentry has received a controlled staging or production test event.
- Staff soft launch has met exit criteria from `docs/soft-launch-plan.md`.
- DNS TTL has been lowered to 300 seconds at least 24 hours before cutover.

## DNS cutover

1. Confirm production host has HTTPS certificates for `sunauraresort.net` and `www.sunauraresort.net`.
2. Export or screenshot current DNS records before changing them.
3. Update apex and `www` records to the production host values.
4. Keep Weebly account and content intact during the monitoring window.
5. Confirm `https://sunauraresort.net/` loads the rebuilt homepage.
6. Confirm `https://www.sunauraresort.net/` redirects or resolves to the canonical production site.

## Post-DNS smoke test

- Public homepage loads.
- Stays & Rates, Events, FAQ, Rules, Policies, Gallery, Resort Map, Contact, and Book pages load.
- Legacy Weebly URLs return permanent redirects to the new pages.
- Booking request can be submitted.
- Staff login works.
- Member login request works.
- Cloudinary upload signatures still work for staff.
- Sentry captures a controlled test issue.

## Retiring paper and Excel

- Stop entering new reservations into the old process after DNS cutover approval.
- Keep historical paper and Excel records read-only for audit reference.
- Reconcile member payments and electric charges for the first three live operating days.
- Store final exported legacy workbook in the owner-approved archive location.

## Rollback criteria

Rollback DNS to the previous Weebly records if any Severity 1 issue blocks:

- public site access;
- booking requests;
- staff login;
- reservation lookup or creation;
- member payment recording;
- electric reading entry;
- member data access controls.

If rollback occurs, keep new data entered during the window, reconcile it manually, fix the issue, and repeat the cutover checklist.

## Monitoring window

Monitor for 72 hours after DNS cutover:

- Sentry issues;
- failed staff actions;
- missing reservation requests;
- payment/electric reconciliation mismatches;
- public contact form or email delivery complaints;
- DNS or HTTPS instability.
