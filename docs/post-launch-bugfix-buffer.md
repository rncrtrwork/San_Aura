# Post-launch bug-fix buffer sprint

This runbook closes the Phase 14 post-launch bug-fix buffer item. Schedule this buffer immediately after DNS cutover so staff have a protected window for fast fixes while real guests and members begin using the platform.

## Duration

- Recommended length: 5 business days after cutover.
- Extend to 10 business days if launch happens during a high-traffic event weekend.
- Reserve daily owner check-ins during the first 72 hours.

## Intake channels

- Staff-reported issues from the admin guide workflow.
- Owner-reported public site or content issues.
- Member portal issues reported by pilot members.
- Sentry production issues.
- Email delivery or booking request delivery complaints.

## Severity levels

- Severity 1: production access, auth, reservation creation, payment recording, electric billing, member data privacy, or public site availability is broken.
- Severity 2: workflow works but creates confusion, incorrect display data, failed uploads, reporting mismatch, or staff workaround.
- Severity 3: copy, visual polish, spacing, minor usability, or training clarification.

Severity 1 issues are patched immediately and verified with a focused production smoke test. Severity 2 issues are grouped into same-day or next-day patches. Severity 3 issues are batched unless they are embarrassing on a public page.

## Daily cadence

1. Review Sentry issues and staff reports.
2. Classify each issue by severity.
3. Patch Severity 1 items first.
4. Run the local gate before each deploy candidate.
5. Smoke-test the affected workflow in production after deployment.
6. Reconcile member, payment, reservation, and electric totals at close of business.

## Required gate before each patch release

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Run `npm run verify:production` after production environment changes.

## Exit criteria

- No unresolved Severity 1 issues for 72 hours.
- Staff can complete reservations, member updates, payments, electric readings, media approval, content publishing, and settings updates without reverting to the old process.
- Public booking requests and member portal support requests reach staff reliably.
- Owner signs off that remaining Severity 3 items can move to the normal backlog.

## Handoff

At the end of the buffer sprint, archive:

- final production environment checklist;
- imported legacy workbook exports;
- Sentry project link and alert routing owner;
- admin user guide;
- unresolved backlog items with severity and owner notes.
