# Accessibility QA pass

Completed for Phase 14 launch hardening.

Scope reviewed:

- Public brochure pages and booking/member entry flows.
- Staff admin shell, dashboard navigation, member detail tabs, calendar, resort map, settings, and media workflows.
- Member portal tabs for dashboard, payments, electric billing, documents, membership info, and update requests.

Checks completed:

- Added a global skip link that targets the active page's `main-content` landmark.
- Confirmed public, staff admin, staff login, member login, and member portal surfaces expose a main landmark target.
- Confirmed primary navigation, footer navigation, admin navigation, settings tabs, member tabs, calendar views, and resort map controls have accessible labels or visible text.
- Confirmed form controls in the newly added member portal and electric billing workflows use labels, status messages, and alert messages.
- Confirmed decorative icons are hidden with `aria-hidden` and informational images/maps provide alt text or labeled image roles.
- Confirmed reduced-motion preferences are respected globally.

Remaining manual browser checks before cutover:

- Keyboard-tab through the production build after real content and media are loaded.
- Run a screen-reader smoke test on booking, admin login, member login, member detail, and resort map pages.
- Re-check contrast if brand colors are changed by the client.
