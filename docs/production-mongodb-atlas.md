# MongoDB Atlas production setup

This runbook closes the Phase 14 MongoDB production readiness item. The actual cluster must be created inside the client-owned MongoDB Atlas organization so billing, backups, and access stay under the resort's control.

## Cluster

- Create a dedicated production project named `Sun Aura Resort Production`.
- Use a paid dedicated tier or serverless tier with automated backups enabled before launch.
- Region should match the application host region as closely as possible.
- Name the database `sun-aura-resort`.
- Create a database user named `sun-aura-app` with read/write access only to the `sun-aura-resort` database.
- Use Atlas IP access controls for the production host. Avoid broad `0.0.0.0/0` access after the initial connection test.

## Backups

- Enable scheduled automated backups before staff import real membership, payment, document, and electric billing records.
- Retain daily snapshots for at least 14 days during soft launch.
- Retain monthly snapshots for at least one year after cutover.
- Test one restore into a temporary database before DNS cutover.

## Connection string

Use the Atlas driver connection string with an explicit database name:

```txt
MONGODB_URI=mongodb+srv://sun-aura-app:<password>@<cluster-host>/sun-aura-resort?retryWrites=true&w=majority
```

Production must not use the local development URI from `.env.example`.

## Launch verification

Before launch, run the production readiness tests and confirm the production environment passes:

```bash
npm run test
npm run typecheck
npm run build
```

The codebase includes MongoDB readiness checks that fail local or database-less production connection strings.
