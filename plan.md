# Sun Aura Resort — Platform Rebuild

## MVP Development Plan

---

## 1. Executive Summary

Sun Aura Resort currently runs on a Weebly-hosted brochure site (`sunauraresort.net`) with an external Checkfront-style booking link, no member portal, and all membership/billing/electric-metering data kept on paper and in Excel. The goal of this project is to replace that with a purpose-built platform consisting of:

1. **A public marketing website** (reservations info, events, FAQ/rules, history, gallery, contact) — replacing the Weebly site with a CMS-driven site the client can edit herself.
2. **An admin back office** (already designed — see Section 5) for staff to manage reservations, the site/calendar, rates, events, gallery, FAQ/rules content, and settings.
3. **A member self-service portal** where yearly members can view their balance, payment history, electric billing, on-file documents/status, and renewal date — without staff involvement.

This is an **MVP**, not the full feature set of an enterprise campground PMS. Payment processing, smart-meter integration, and guest self-upload are explicitly deferred (Section 8). The focus is digitizing the paper/Excel workflow the client described and giving the client a CMS she can run herself, on the design she has already approved.

---

## 2. Current State Assessment (sunauraresort.net audit)

- Built on Weebly; content, nav, and images are hard-coded into individual pages — no structured data, no search, no member records.
- Pages: Home, Event Schedule, Book Online (external link to a third-party Checkfront-hosted reservation system), This Weekend, FAQ, Map, Camp Out Week, Rules & Safety, About, Fees & Rates, Image Gallery.
- Rates, member tiers, and rules are described in prose paragraphs, not structured data — hard to keep in sync, no way to compute a member's actual balance from the site.
- No member accounts of any kind — everything (dues, electric bills, meter readings, IDs, waivers, pet records) lives on paper and in spreadsheets, per the client.
- No activity/audit trail for staff actions.
- No image-approval workflow — the client has a strict "no identifiable people in photos" policy that the current site has no way to enforce systematically.
- Booking currently routes off-site entirely, so the resort has no first-party reservation or guest data.

**Implication for rebuild:** the CMS and admin tooling need to fully replace Weebly's editing role, and the reservation/member/electric-billing data needs to move into a proper database with relationships (member ↔ reservations ↔ payments ↔ electric readings ↔ documents), which is the core of this plan.

---

## 3. Competitive Research Summary

Reviewed the leading campground/RV-park management platforms (Campspot, ResNexus, CampLife, WebRezPro, K2/KOA) to validate the feature set:

- **Interactive site/map view with live status** (available/occupied/maintenance/blocked) is now table-stakes — matches the client-approved Resort Map mockup.
- **Recurring/seasonal billing and metered utility billing** are common in RV-heavy parks; ResNexus specifically calls out utility/electric billing as a common pain point, confirming the client's ask to move electric readings into the system and have them feed billing.
- **Guest/member self-service portals** (view balance, documents, reservation status) are a differentiator ResNexus offers via a no-app-required guest portal — this directly matches what the client asked for.
- **Role-based staff access and activity logging** are standard in every product surveyed — matches the client's request for 8 staff accounts with different permission levels and a detailed activity log.
- **Commission-based booking fees are common** (Campspot charges per booking); since the client is not doing payment integration yet and wants to avoid PCI scope entirely, the MVP will not adopt a commission model — all payment recording is manual/manual-reconciliation via off-platform PayPal links, consistent with "Ryan's note" in the brief.
- Dynamic pricing, OTA syndication, and native mobile apps are common in mature products but are overkill for an MVP replacing paper/Excel — deferred to Phase 2 (Section 8).

**Conclusion:** the client's own requirements already line up closely with industry-standard campground PMS feature sets; the admin mockups she supplied (Overview, Reservations, Calendar, Events, Stays & Rates, Resort Map, Gallery, FAQ & Rules, Content, Settings) map cleanly onto that feature set, so this plan builds directly on those screens rather than inventing new IA.

---

## 4. Scope

### In scope for MVP

- Admin back office implementing all 10 modules shown in the supplied mockups.
- Member management: profile, membership tier, status, renewal month, documents (ID, insurance, pet/rabies records, 2 waiver types, vehicle info, phone, "checked in with" party linking), payment history, electric usage/readings, staff-only notes.
- Guest (non-member) reservation management for cabins/RV/tent stays, tied to the Calendar and Resort Map.
- Manual electric meter reading entry that feeds a billing ledger (flat $25/day, flat $15/day, or $0.25/kWh, resolved per site + membership rules), with support for "paid ahead" balances.
- Stays & Rates management (stay types, seasonal rate calendars, add-ons).
- Events manager (draft/scheduled/published, homepage feature toggle, registration counts).
- Gallery/media manager with an approval workflow and **hard rule: no people/identifiable figures in any published image**.
- FAQ, Resort Rules, and Policies manager.
- Website Content manager (page/section builder) driving the rebuilt public site — including a dedicated **History** page/timeline, per the client's explicit request.
- Settings: property details, booking defaults, privacy/safety toggles, notification toggles, staff & role management.
- Staff accounts (8 initial users) with role-based permissions (Admin, Front Desk, Content Editor, Maintenance, per the Settings mockup) and a system-wide activity log.
- Member self-service portal (balance, payment history, electric billing history, documents on file, waiver status, renewal month, emergency contact, membership type — notes excluded, staff-only).
- Rebuilt public marketing site, content-driven from the CMS.

### Explicitly out of scope for MVP (Section 8 has the deferred roadmap)

- Real payment processing / PCI scope of any kind. No card data is ever stored. Balance and payment status are staff-entered from off-platform PayPal payments.
- Smart meter hardware integration.
- Guest self-upload of documents (ID/insurance/waivers) — staff-mediated upload only for MVP.
- Native mobile apps.
- Dynamic/yield pricing, OTA channel syndication, loyalty programs.

---

## 5. Admin UI Reference (already designed by client)

The client-supplied mockups define the target UI for the following modules — this plan's admin build tasks map 1:1 to these:

| #   | Screen                    | Core entities involved                                        |
| --- | ------------------------- | ------------------------------------------------------------- |
| 1   | Overview / Dashboard      | Reservations, Occupancy, Tasks, Activity Log                  |
| 2   | Reservations Manager      | Reservation, Guest/Member, Site, Payment                      |
| 3   | Calendar & Availability   | Reservation, Site, Waitlist                                   |
| 4   | Events Manager            | Event, Registration                                           |
| 5   | Stays & Rates             | StayType, RatePlan, Season, Add-on                            |
| 6   | Resort Map / Inventory    | Site, SiteStatus, Maintenance note                            |
| 7   | Gallery / Media Manager   | MediaAsset, Album, Approval status                            |
| 8   | FAQ & Rules Manager       | FAQItem, ResortRule, Policy, Revision history                 |
| 9   | Website Content & History | Page, Section (hero/rich text/timeline/CTA), History timeline |
| 10  | Settings & Administration | PropertySettings, StaffRole, Permissions                      |

---

## 6. Tech Stack

- **Frontend (admin + public site):** Next.js (React) — one codebase, two route groups (`/admin/*` behind auth, public marketing routes). Server-rendered public pages for SEO; client-rendered admin.
- **Backend:** Next.js API routes / route handlers (Node.js), or a separate Express API if the team prefers a clean split — either way, a single Node/TypeScript service layer.
- **Database:** MongoDB (per client decision), accessed via Mongoose for schema validation and relationships.
- **File storage:** Cloudinary (per client decision) for all uploaded media — gallery images, member documents (ID/insurance/waiver/pet-record scans), resort logo. Client will supply Cloudinary credentials via `.env`.
- **Auth:** Session/JWT-based staff auth with role-based access control (RBAC) middleware; separate, lighter-weight auth for the member self-service portal (magic-link or email+password).
- **Env/config:** All secrets (Mongo URI, Cloudinary keys, session secret, SMTP for notifications) via `.env`, never committed — `.env.example` provided in repo.
- **Hosting target:** any Node-friendly host (Vercel/Render/Railway) + MongoDB Atlas — left to client's existing hosting relationship (currently Hostgator) to confirm; flagged as an open question, not blocking development.

---

## 7. Core Data Model (MongoDB collections)

- **User** (staff): name, email, passwordHash, role ref, active flag, lastLogin.
- **Role**: name (Admin/Front Desk/Content Editor/Maintenance), permission list.
- **ActivityLog**: actorId, action, entityType, entityId, beforeSnapshot/afterSnapshot summary, timestamp — written by a shared service, not ad hoc per route.
- **Member**: name, contact info, phone, vehicle info, membershipTier (`2850`/`2000`/`1250`/`500`), status (active/probationary/hiatus/inactive), renewalMonth, joinDate, emergencyContact, electricBillingMode (flat25/flat15/kwh/weekly — resolved from tier + site, but overridable per client's note that "some $2000 members pay flat"), assignedSiteId (for permanent-space tiers), partyLinks (other member/guest IDs they typically check in with), staffNotes (staff-only, never exposed to member portal).
- **Document** (polymorphic, owner = Member or Guest): type (photoId/insurance/petRabies/waiverGeneral/waiverPet/vehicleProof), Cloudinary URL, uploadedBy, uploadedAt, expiresAt (for rabies/insurance renewal tracking).
- **Guest** (non-member visitor): name, contact, vehicle info, phone, partyLinks, linked reservation(s).
- **Site**: code (e.g. "Cabin 04", "RV 118"), type (cabin/RV/tent), area (Cabin Area/RV Area/Tent Area), amenities, status (available/occupied/maintenance/blocked), maintenanceNote, length (RV), hookups.
- **Reservation**: guestOrMemberRef, siteRef, stayType, checkIn/checkOut, guestsCount, totalAmount, paymentStatus (paid/deposit-due/deposit-paid/unpaid), paymentMethodNote (manual/PayPal-link, no card data), source, internalNotes, status (pending/confirmed/checked-in/completed/cancelled).
- **Payment**: reservationRef or memberRef, amount, type (dues/electric/day-fee/cabin/RV/addon), method (manual entry — cash/check/PayPal-external), recordedBy, date, appliesToPeriod (for prepaid electric).
- **ElectricReading**: siteRef or memberRef, meterValue, readingDate, kwhUsed (computed delta), enteredBy, billingMode snapshot, resultingCharge.
- **StayType**: name (Cabin/RV/Tent), baseRate, weekendRate, extraGuestFee, minimumStay, cleaningFee, active.
- **Season**: name, dateRange, rate overrides.
- **Addon**: name, description, type (optional/external-partner), price, active.
- **Event**: title, date range, location, capacity, registrationRequired, description, image, status (draft/scheduled/published/past), featureOnHomepage, sendReminder.
- **EventRegistration**: eventRef, guestOrMemberRef, registeredAt.
- **MediaAsset**: filename, Cloudinary URL/publicId, altText, caption, album, usage[] (homepage/stayType/event/mapAsset), approvalStatus, publishToWebsite, focalPoint, dimensions, uploadedBy, uploadedAt. **Enforced rule: nothing goes to `publishToWebsite: true` without passing the no-people check (Section 9).**
- **Album**: name, parent grouping (Stay Types/Events/Map Assets/Homepage Gallery).
- **FAQItem**: category, question, answer (rich text), relatedLinks, displayOrder, status (draft/published), revisionHistory[].
- **ResortRule**, **Policy**: same shape as FAQItem, separate collections for the three tabs shown in the mockup.
- **Page**: slug, title, sections[] (ordered, each section has a type: hero/richText/timeline/CTA/gallery, its own fields, and an active toggle), navVisibility, lastEditedAt, publishStatus (draft/published).
- **TimelineItem** (embedded in a Page's Timeline section): year, title, description.
- **PropertySettings** (singleton): resort name/logo, address, phone, email, timezone, check-in/out times, cancellation window, deposit requirement, minimum age, default minimum stay, tax rate, currency, date format, privacy toggles (photography/video prohibited, show privacy notice at booking), notification toggles.
- **Waitlist**: requested dates, stayType, siteCount, contact, status.

---

## 8. Deferred to Phase 2 (explicitly out of MVP)

- PayPal (or other) payment **integration** — MVP only supports staff manually recording that a PayPal payment (or cash/check) was received; a plain PayPal.me-style link can be shown to guests/members from Settings, but no webhook/API integration, no stored card data, no PCI scope whatsoever.
- Guest/member self-upload of ID, insurance, pet, and waiver documents (staff-mediated upload only in MVP).
- Smart meter / automated electric reading ingestion.
- SMS notifications, automated dunning/late-fee logic.
- Multi-language site content.
- Native mobile apps / offline mode.

---

## 9. Cross-Cutting Requirements

- **No people in imagery:** every image used in the rebuilt public site and every uploaded gallery asset must not depict identifiable people, matching the client's explicit instruction and the resort's own "no photography of guests" policy already reflected in the Settings/Gallery mockups. The Gallery module's approval workflow (Approved/Draft + "Publish to website" toggle) is the enforcement point — nothing publishes without explicit approval, and the admin UI carries a persistent "Privacy First" reminder banner (already in the mockup) reinforcing this at both Gallery and FAQ&Rules screens.
- **Activity logging:** every create/update/delete on Member, Reservation, Payment, ElectricReading, Event, MediaAsset, FAQ/Rule/Policy, Page, and Settings writes an ActivityLog entry via one shared service function, not per-route ad hoc code, so the Overview dashboard's "Recent Activity" feed and a future full activity log page stay complete and consistent.
- **RBAC:** every admin API route is wrapped by a permission-check middleware keyed to the acting user's Role, matching the Staff & Roles table in Settings (Admin/Front Desk/Content Editor/Maintenance with distinct permission counts).
- **Member-portal data boundary:** the member self-service read API must explicitly exclude `staffNotes` and any other staff-only fields at the query/serialization layer (not just hidden in the UI), since this is a security boundary, not a display preference.
- **Electric billing correctness:** billing-mode resolution (flat $25/day, flat $15/day, $0.25/kWh, weekly rate TBD with client) must be a single shared calculation function, unit-tested, since it directly drives what members are charged.

---

## 10. Phased Roadmap (summary)

| Phase | Theme                                  | Depends on                      |
| ----- | -------------------------------------- | ------------------------------- |
| 0     | Project scaffolding, env, CI           | —                               |
| 1     | Data models, auth, RBAC                | 0                               |
| 2     | Admin shell/layout, Overview dashboard | 1                               |
| 3     | Members module                         | 1, 2                            |
| 4     | Reservations, Calendar, Resort Map     | 1, 2, 3                         |
| 5     | Stays & Rates                          | 1, 2                            |
| 6     | Events                                 | 1, 2                            |
| 7     | Gallery/Media (Cloudinary)             | 1, 2                            |
| 8     | FAQ & Rules                            | 1, 2                            |
| 9     | Website Content Manager                | 1, 2, 7                         |
| 10    | Settings, Staff & Roles, Activity Log  | 1, 2                            |
| 11    | Public website rebuild                 | 9, 5, 6, 7, 8                   |
| 12    | Member self-service portal             | 3, 4, and electric billing (13) |
| 13    | Electric billing / ledger              | 3, 4                            |
| 14    | QA, hardening, deployment, launch      | all                             |

---

## 11. Detailed To-Do List

Every task below is scoped to be completable in a single, focused commit. Checkboxes are for tracking progress in the repo.

### Phase 0 — Project Scaffolding

- [x] Initialize Next.js + TypeScript project, add ESLint/Prettier config
- [x] Set up folder structure (`/app/(public)`, `/app/(admin)`, `/app/(member)`, `/lib`, `/models`, `/server`)
- [x] Add MongoDB connection helper with cached connection for serverless (`/lib/db.ts`)
- [x] Add Cloudinary SDK config helper (`/lib/cloudinary.ts`), reading keys from env
- [x] Create `.env.example` listing `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`, `SESSION_SECRET`, `SMTP_*`
- [x] Add base UI theme (colors/typography) matching approved admin design (dark green sidebar, gold accent, ivory background)
- [x] Set up shared layout components: sidebar nav, topbar with search + notifications bell + "View Website" button, matching mockups
- [x] Add basic CI workflow (lint + typecheck on push)
- [x] Write project README with setup instructions

### Phase 1 — Data Models, Auth, RBAC

- [x] Define `Role` schema + seed script for Admin/Front Desk/Content Editor/Maintenance
- [x] Define `User` (staff) schema with password hashing (bcrypt)
- [x] Build staff login page + session/JWT issuance
- [x] Build auth middleware for `/admin/*` routes (redirect unauthenticated to login)
- [x] Build RBAC permission-check middleware/helper (`requirePermission('members.write')`)
- [x] Define `ActivityLog` schema + shared `logActivity()` service
- [x] Define `Member` schema
- [x] Define `Guest` schema
- [x] Define `Document` schema (polymorphic owner)
- [x] Define `Site` schema
- [x] Define `Reservation` schema
- [x] Define `Payment` schema
- [x] Define `ElectricReading` schema
- [x] Define `StayType`, `Season`, `Addon` schemas
- [x] Define `Event`, `EventRegistration` schemas
- [x] Define `MediaAsset`, `Album` schemas
- [x] Define `FAQItem`, `ResortRule`, `Policy` schemas
- [x] Define `Page`, section sub-schemas (hero/richText/timeline/CTA/gallery)
- [x] Define `PropertySettings` singleton schema
- [x] Define `Waitlist` schema
- [x] Write seed script for initial Admin user + default PropertySettings

### Phase 2 — Admin Shell & Overview Dashboard

- [x] Build admin sidebar nav (Overview/Reservations/Calendar/Events/Stays & Rates/Resort Map/Gallery/FAQ & Rules/Content/Settings) with active-state highlighting
- [x] Build topbar global search input (wire to Members/Reservations/Sites search endpoint stub)
- [x] Build notifications bell UI (static list first, wired in Phase 10)
- [x] Build Overview KPI cards: Occupancy %, Arrivals Today, Departures Today, Revenue This Week (data-driven from Reservation/Payment)
- [x] Build 14-Day Occupancy chart (Cabins/RV/Tent lines) fed by Reservation date-range query
- [x] Build "Today's Tasks" list (static checklist model first — housekeeping/inspection/event/review tasks)
- [x] Build "Upcoming Arrivals" table on Overview (next N reservations by check-in date)
- [x] Build "Recent Activity" feed on Overview reading from ActivityLog
- [x] Add persistent "Privacy First — Photography is not permitted on the property" banner component (reused across Overview/Gallery/FAQ)

### Phase 3 — Members Module

- [x] Build Members list page (search/filter by tier/status/renewal month)
- [x] Build Member creation form (name, contact, phone, vehicle, tier, status, renewal month, emergency contact)
- [x] Build Member detail view: profile summary + tabs (Documents/Payments/Electric/Notes)
- [x] Build Document upload UI (Cloudinary upload widget) tagged by type (ID/insurance/pet rabies/waiver general/waiver pet/vehicle proof)
- [x] Build Document expiry tracking (insurance/rabies) with "renews on" indicator
- [x] Build Member payment history table (reads Payment collection filtered by member)
- [x] Build "Add Payment" manual-entry form (amount/type/method/date/appliesToPeriod)
- [x] Build Member status/renewal-month editor with ActivityLog entry on change
- [x] Build staff-only Notes tab (visibly marked "Staff Only", excluded from any member-portal serializer)
- [x] Build party-linking UI ("checked in with") — search + link other Member/Guest records
- [x] Wire membership tier rules (permanent space assignment for 2850/2000/500, day-fee exemption for 1250) into a shared `getTierRules()` helper
- [x] Add Members API route tests for tier-rule resolution

### Phase 4 — Reservations, Calendar, Resort Map

- [x] Build Reservations list page with status tabs (All/Pending/Confirmed/Checked In/Completed/Cancelled)
- [x] Build Reservations filters (stay type, arrival date, payment status) + search
- [x] Build New Reservation form (guest/member lookup-or-create, stay type, site, dates, guest count)
- [x] Build Reservation detail side panel (Booking Summary/Stay Details/Payment Summary/Internal Notes)
- [x] Wire "Send Confirmation" action (email stub using SMTP config)
- [x] Wire "Check In" action (updates status, enforces check-in time from PropertySettings)
- [x] Enforce checkout-by-noon / key-return-by-11am rule as a display reminder on checkout-day reservations
- [x] Build Calendar page (Month view) rendering Reservation bars by site/date range
- [x] Build Calendar Week and Timeline view toggles
- [x] Build day-cell popover (Arrivals/Departures/Occupancy quick view + "View Day" link)
- [x] Build Availability Summary sidebar widget (available counts by site type)
- [x] Build Occupancy donut widget on Calendar page
- [x] Build Waitlist sidebar list + "Review Waitlist" flow
- [x] Build "Block Dates" action (creates a maintenance/blocked Site-date range)
- [x] Build Resort Map page: static base map with clickable site markers
- [x] Wire site marker color state to `Site.status` (available/occupied/maintenance/blocked)
- [x] Build site detail side panel (status, stay dates if occupied, amenities, length, next availability, maintenance note)
- [x] Build "Block Site" and "View Reservation" actions from the map panel
- [x] Build Site Summary counts widget (Available/Occupied/Maintenance/Blocked) on Resort Map
- [x] Build "Edit Map" mode for repositioning/adding site markers (admin-only)

### Phase 5 — Stays & Rates

- [x] Build Stays & Rates page shell with tabs (Stay Types/Rate Plans/Availability Rules/Add-ons)
- [x] Build Stay Type cards (Cabins/RV/Tent) showing unit count, amenities, minimum stay, active toggle
- [x] Build "Add Stay Type" and "Edit" forms
- [x] Build Rate editor panel (base rate, weekend rate, extra guest fee, minimum stay, cleaning fee)
- [x] Build monthly Rate Calendar grid with weekday/weekend rate coloring
- [x] Build "Manage Seasons" flow (create/edit named date-range rate overrides)
- [x] Build Add-ons table (name/description/type/price/status) with add/edit/deactivate
- [x] Wire "Save Rates" to persist Season/StayType changes + ActivityLog entry

### Phase 6 — Events

- [x] Build Events list page with status tabs (All/Drafts/Scheduled/Published/Past) and date-range filter
- [x] Build "Create Event" form (title, date/time, location, capacity, registration required, description, image)
- [x] Build Event edit panel matching mockup (image header with "Change Image", details form, mini calendar date picker)
- [x] Wire Cloudinary upload for event image
- [x] Build "Feature on homepage" and "Send reminder" toggles
- [x] Build Registrations count widget + progress bar on event edit panel
- [x] Build "Save Draft" vs "Publish Changes" flow with distinct status values
- [x] Build public-facing event registration capture (creates `EventRegistration`, decrements capacity)

### Phase 7 — Gallery / Media Manager

- [x] Build Gallery grid page with filters (Media Type/Album/Usage/Approval Status) and search
- [x] Wire Cloudinary upload widget for "Upload Media" (multi-file)
- [x] Build media detail side panel (Alt Text, Caption, Album, Focal Point picker, Usage list, File Details)
- [x] Build bulk-select toolbar (Approve/Unapprove/Add to Album/Archive/Delete)
- [x] Build Approval Status + "Publish to website" toggle logic — enforce that publish requires `approved: true`
- [x] Add manual "no people" confirmation checkbox required at upload/approval time as a lightweight enforcement step for the privacy policy
- [x] Build Album management (Create Album, assign media, nested albums e.g. "Stay Types > Cabins")
- [x] Build "Archived" and tab views (All Media/Homepage Gallery/Stay Types/Events/Map Assets/Archived)
- [x] Wire persistent Privacy First banner on Gallery page

### Phase 8 — FAQ & Rules Manager

- [x] Build FAQ & Rules page shell with tabs (FAQ/Resort Rules/Policies) and item counts
- [x] Build left-side category tree (Reservations/Arrival & Check-in/During Your Stay/Privacy/Pets/etc.) with drag-reorder
- [x] Build "Add FAQ Item" flow (question, category, slug, rich-text answer, related links, display order)
- [x] Build rich text editor toolbar for the Answer field
- [x] Build Publishing panel (status draft/published, SEO title + char counter, meta description + char counter, Featured FAQ toggle)
- [x] Build Revision History list + "View all revisions" (reads a lightweight version array on FAQItem)
- [x] Repeat item CRUD + publishing panel for Resort Rules tab
- [x] Repeat item CRUD + publishing panel for Policies tab
- [x] Wire persistent Privacy First banner (photography/video prohibited) on this page

### Phase 9 — Website Content Manager

- [x] Build Content page shell: left Pages list (Home/Our Story/History/First Visit/Contact/Footer) with last-edited timestamps
- [x] Build page section list (draggable order) with per-section active toggle, edit, duplicate, delete
- [x] Build Hero section editor (image upload, H1 text)
- [x] Build Rich Text section editor
- [x] Build Timeline section editor: Section Label + repeatable Year/Title/Description items with Add Item
- [x] Build Timeline layout controls (Background color, Layout alternating/stacked, Show on navigation)
- [x] Build CTA section editor
- [x] Build "Add Section" picker (choose section type to append to a page)
- [x] Build "Add Page" flow (creates new `Page` doc with slug)
- [x] Build autosave-draft behavior + "Draft changes" indicator in header
- [x] Build Preview Website action (renders draft content in an isolated preview route)
- [x] Build Publish action (flips `publishStatus` to published, snapshots to ActivityLog)
- [x] Seed the dedicated **History** page with the Timeline section per the client's explicit request

### Phase 10 — Settings, Staff & Roles, Activity Log

- [x] Build Settings page shell with tabs (Property/Booking/Payments/Notifications/Staff & Roles/Integrations)
- [x] Build Property Details form (name, logo upload via Cloudinary, address, timezone, phone, email, check-in/out time)
- [x] Build Operating Season section (open year-round toggle, tax rate, currency, date format)
- [x] Build Booking Defaults form (cancellation window, deposit requirement, minimum age, default minimum stay)
- [x] Build Privacy & Safety toggles (photography prohibited, video prohibited, show privacy notice at booking) + live Privacy Policy Summary preview text
- [x] Build Notifications toggle list (New Reservation/Cancellation/Payment Failed/Arrival Reminder) — flag Payment Failed as N/A copy until Phase-2 payments exist, or repurpose as "Payment Recorded"
- [x] Build Staff Access summary table (Role/Permission count) linking to "Manage Roles"
- [x] Build Manage Roles modal/page: permission checklist editor per role
- [x] Build Staff user management (invite/deactivate staff, assign role) — likely under Staff & Roles tab
- [x] Build full Activity Log page (searchable/filterable list, beyond the Overview widget) reading `ActivityLog`
- [x] Build Payments tab placeholder explaining PayPal-link-only flow for MVP (no processor keys) with a field for the resort's PayPal.me link to surface to guests/members

### Phase 11 — Public Website Rebuild

- [x] Build public layout (header nav, footer) driven by `Page.navVisibility` from CMS
- [x] Build Home page rendering CMS sections (hero, rich text, CTA, etc.)
- [x] Build Our Story / History page rendering the Timeline section
- [x] Build First Visit / Reservations info page
- [x] Build Events public page (list of published, non-past events; registration form wired to Phase 6 API)
- [x] Build FAQ public page (grouped by category, Featured FAQs pinned to top)
- [x] Build Resort Rules & Policies public pages
- [x] Build Resort Map public page (read-only version of the Site status map, no admin actions)
- [x] Build Gallery public page (approved + `publishToWebsite: true` media only, grouped by album)
- [x] Build Stays & Rates public page (stay type cards + starting rates pulled from `StayType`)
- [x] Build Contact page (property info from `PropertySettings`)
- [x] Build "Book a Stay" public flow: date/site-type search → availability check against `Site`/`Reservation` → reservation request submission (no payment capture — creates a `pending` Reservation for staff to confirm)
- [x] Wire SEO metadata (title/meta description) per page from CMS fields
- [x] Add responsive/mobile QA pass across all public pages
- [x] Retire/redirect old Weebly URLs to new equivalents (301 map)

### Phase 12 — Member Self-Service Portal

- [x] Build member auth (email + password or magic link) separate from staff auth
- [x] Build member dashboard: current balance, membership type, status, renewal month
- [ ] Build member "Payment History" tab (Payments filtered to that member, no staff notes)
- [ ] Build member "Electric Billing" tab (ElectricReading + resulting charges history)
- [ ] Build member "Documents on File" tab (list of Document types with status/expiry, read-only — no upload in MVP)
- [ ] Build member "Emergency Contact" and "Membership Info" read-only display
- [ ] Enforce field-level exclusion of `staffNotes` in the member-portal API serializer + add a regression test
- [ ] Build "Request update" contact-staff action (simple message/ticket to admin, no self-edit of official records in MVP)

### Phase 13 — Electric Billing / Ledger

- [ ] Build shared `resolveBillingMode(member, site)` helper implementing flat $25/day, flat $15/day, $0.25/kWh, and per-tier overrides described by the client
- [ ] Unit-test `resolveBillingMode()` against all four membership tiers and stated exceptions
- [ ] Build admin "Add Meter Reading" form (site/member, meter value, date) computing kWh delta from prior reading
- [ ] Build charge computation on reading save (writes a `Payment`/ledger entry of type `electric`)
- [ ] Build "Prepaid / paid ahead" balance handling (member pays ahead, charges draw down the prepaid balance instead of creating new due amounts)
- [ ] Build electric usage history view on Member detail (Phase 3) and Member Portal (Phase 12) reusing the same query
- [ ] Follow up with client to confirm the still-unspecified weekly electric rate before finalizing `resolveBillingMode()` and the fourth membership tier amount ("I feel like I'm forgetting one")

### Phase 14 — QA, Hardening, Deployment, Launch

- [ ] Write integration tests for auth/RBAC boundaries (staff routes, member-portal data boundary)
- [ ] Load-test the Calendar/Resort Map queries against realistic data volume (187 sites × season)
- [ ] Accessibility pass (labels, contrast, keyboard nav) on public site and admin
- [ ] Set up MongoDB Atlas production cluster + backups
- [ ] Configure Cloudinary production environment + folder structure/naming convention
- [ ] Set up production hosting + environment variables (client to supply Mongo/Cloudinary URLs into `.env` per their note)
- [ ] Set up error monitoring/logging (e.g., Sentry) for production
- [ ] Data migration: import existing Excel membership/payment/electric records into MongoDB via a one-time import script
- [ ] Staff training walkthrough / admin user guide (short doc covering each of the 10 modules)
- [ ] Soft-launch: staff-only use in parallel with paper process for a defined trial window
- [ ] Cut over: retire paper/Excel process, DNS cutover from Weebly to new site
- [ ] Post-launch bug-fix buffer sprint

---

## 12. Open Questions for Client (do not block starting Phase 0–2)

- Confirm the possible **5th membership tier** she suspects she's forgetting, and the exact **weekly electric rate** for $2000-tier members who pay by the week.
- Confirm hosting preference (stay with Hostgator-adjacent hosting vs. move to Vercel/Render + MongoDB Atlas).
- Confirm whether the "Payment Failed" notification toggle in Settings should simply be relabeled (since no payment processor exists yet in MVP) or hidden until Phase 2.
- Confirm SMTP/email provider for confirmation and reminder emails.
- Confirm which of the 8 staff members map to which of the 4 roles (Admin/Front Desk/Content Editor/Maintenance) for seed data.
