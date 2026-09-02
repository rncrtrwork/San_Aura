# Soft-launch plan

This runbook closes the Phase 14 staff-only soft-launch item. The goal is to run the new platform in parallel with the existing paper and Excel process long enough to prove staff workflows before DNS cutover.

## Trial window

- Recommended duration: 10 business days or two active resort weekends, whichever gives staff more real transactions.
- Audience: staff only.
- Public DNS remains on the current Weebly site during the trial.
- Member portal access is limited to test members and selected staff-controlled pilot accounts.

## Entry criteria

- Phase 14 production readiness checks pass.
- MongoDB Atlas backups are enabled.
- Cloudinary production folders are configured.
- Sentry production monitoring receives a controlled test event.
- Staff accounts and roles are created.
- Existing member, payment, and electric records have passed the legacy import dry run.

## Daily staff workflow

- Enter every new reservation into the platform and the current paper process.
- Record member payments in the platform and the current Excel ledger.
- Enter electric readings in the platform and compare charges against the current spreadsheet calculation.
- Use Calendar and Resort Map before confirming each stay.
- Upload only production-safe media after no-people confirmation.
- Review Activity Log at the end of each day for unexpected changes.

## Daily reconciliation

Track these totals at close of business:

- Pending, confirmed, checked-in, completed, and cancelled reservations.
- Member payments by type and method.
- Electric readings entered and total resulting charge.
- Member document expirations due within 30 days.
- Waitlist entries and blocked sites.

## Issue triage

- Severity 1: blocks reservation creation, member records, payment recording, electric billing, auth, or staff access.
- Severity 2: incorrect public content, reporting mismatch, upload issue, or member portal display issue.
- Severity 3: copy, layout, convenience, or training issue.

Severity 1 issues pause cutover until fixed and verified.

## Exit criteria

- Staff complete the trial window without unresolved Severity 1 issues.
- Payment and electric totals match the legacy Excel process for three consecutive operating days.
- Reservation counts match paper records for three consecutive operating days.
- Staff can complete the 10-module training checklist in `docs/admin-user-guide.md`.
- Owner approves cutover timing and DNS plan.
