# Fisheries360

The updated visual direction uses a cinematic hero film, a conceptual poster fallback, a detailed farm-layout interface and a dark dashboard demonstration. The owner's four clips are now a 23-second silent loop with desktop and mobile encodes. See `docs/VIDEO.md` for edit, playback and verification details, and `docs/REDESIGN.md` for poster provenance.

A standalone React + TypeScript marketing website, Node/Express backend, SQLite content store and role-controlled team workspace. This project has its own files, database, uploads, sessions and runtime. It does not connect to or modify NekSoft systems.

## Run locally

Requirements: Node.js 22.13+ (Node 24 LTS recommended), npm, and a writable persistent local filesystem. The current Node 22 runtime marks `node:sqlite` experimental.

```powershell
cd "C:\Users\ANIKET SHARMA\Documents\Codex\2026-11-04\build-a-complete-premium-website-for\fisheries360"
npm ci
npm run dev
```

Default preview: http://localhost:4310. Override `PORT` in `.env` or the process environment if occupied. `HOST` defaults to `127.0.0.1`. A `.env.example` is supplied. No production domain is assumed.

For a stable local preview using built assets and local HTTP cookies, run `npm run build` followed by `npm run preview`. This is the mode left running for the delivered preview. `npm run dev` supports source changes and reloads.

## Create an owner or editor

From the project directory, use an interactive terminal:

```powershell
npm run create-user
```

Enter your real email, `owner` or `editor`, and a unique password of 6–256 characters. Password input is hidden and the password is stored as a salted scrypt hash. There are **no default accounts or passwords**. Repeat for editors as needed. Open `/admin` to sign in. Creating users requires local server access; there is no public registration endpoint.

Owners can edit, save drafts, preview, publish, restore content revisions and delete enquiries. Editors can edit, save drafts, preview, upload images and update enquiry status, notes and follow-up dates. Server-side role checks protect publish, restore and delete actions. Follow-up dates are records in the admin panel; they do not send scheduled notifications.

To revoke an account or recover a forgotten password, the server operator must use a controlled maintenance process against this project's SQLite database, revoke its sessions and set a new scrypt hash. No web password-recovery or email service is included.

## Editing workflow

1. Select a page and section in **Pages & content**. Edit its eyebrow, heading, description, image and alt text, plus SEO metadata.
2. The ecosystem, hardware explanations, capability entries, solution workflows and implementation steps have shared component fields. Editing one updates every page that uses that component.
3. Choose an existing library image or use **Choose File**. Supply alt text and source/rights information. A preview appears before upload. JPEG, PNG, WebP and AVIF uploads are decoded, metadata stripped, resized within 2000 × 2000, and saved as WebP. Limits: 8 MB and 40 megapixels. SVG uploads are not accepted.
4. Save the draft, preview it in an authenticated new tab, and have an owner publish it. Publishing changes content on this running website; it does not deploy to hosting or a domain.
5. Restoring a revision creates a draft. Preview and publish separately. The last 100 revision snapshots are listed; the database retains all snapshots.

Navigation labels, destinations, ordering, and primary demo/platform CTA labels and links are editable under **Menus & links**. Global brand identity, diagram geometry, contact field schema, illustrative dashboard values and interface labels remain code-managed. Layout and section identity/order are deliberately fixed; this is a structured CMS, not a free-form page builder.

Optimistic version checks prevent silently overwriting another editor's saved draft. Reload before continuing if a version conflict is reported. Unsaved changes prompt before leaving. Destructive enquiry deletion and draft replacement require explicit confirmation.

## Enquiries and persistence

Both contact forms POST to `/api/enquiries`. The server validates and inserts into SQLite before returning success. Native HTML submission works without JavaScript. The enhanced form provides validation, loading, server error and success states. The team workspace lists only persisted submissions; nothing is seeded.

SQLite lives at `DATA_DIR/fisheries360.sqlite` with WAL files; uploads live at `DATA_DIR/uploads/`. The default is this project's `data/`, which is ignored by source control. Keep this directory private to the server account, backed up and on persistent storage. Do not put it in a public static directory. Public image URLs expose uploaded images, so do not upload confidential documents or private information.

Sessions use random opaque tokens, hashes in SQLite, an 8-hour expiry, HttpOnly/SameSite=Strict cookies, and Secure cookies in production. Admin mutations also require a session-bound CSRF token and matching Origin. Login and form submission are rate-limited. SQL uses prepared statements. Text is escaped by React; CMS content cannot execute HTML. The backend never sends password hashes to the browser.

## Hosting requirements

This app needs a **Node server with a persistent disk**, such as a VPS, a container with a persistent volume, or managed Node hosting that preserves local storage. Static-only hosting, edge Workers and ephemeral serverless filesystems cannot run this backend unchanged. Hosting has not been selected or deployed.

```powershell
npm ci
npm run build
# Set the exact confirmed origins in .env:
# SITE_URL=https://the-confirmed-host
# APP_ORIGIN=https://the-confirmed-host
npm start
```

Put an HTTPS reverse proxy in front of the Node process. Use the default loopback binding when the proxy is on the same host; configure `HOST=0.0.0.0` only if the chosen container platform requires it. Configure `TRUST_PROXY=1` only behind one trusted reverse proxy. Set `APP_ORIGIN` to the exact public origin so Origin checks work behind TLS termination. Production cookies require HTTPS. Do not use `npm start` over plain HTTP for admin access; use `npm run dev` for local HTTP development.

Set `SITE_URL` only after the domain is confirmed. Canonical tags and `/sitemap.xml` then use that origin. Without it, canonical tags are omitted and sitemap returns 503 with a setup message. `/robots.txt` excludes admin. Authenticated draft previews and admin pages use noindex and no-store. `/api/health` checks database availability. Supervise the process and back up SQLite with its supported online backup mechanism or stop writes before copying the database plus WAL state. Restore-test backups before operating publicly.

Email delivery, CRM integration, IoT ingestion, live alerts, analytics and external deployment are **not configured**. The monitoring interface is a clearly labelled illustrative demonstration. This is a marketing website and CMS, not the operational Fisheries360 application itself.

## Pages and references

- `/`: full product ecosystem, interactive CageNode, capabilities, illustrative dashboard, use cases, implementation, NekSoft relationship and enquiry form.
- `/platform`: business-management modules, sample views, record chain and mobile workflow.
- `/cagenode`: hardware concept, selectable components, proposed/optional inputs and engagement scope.
- `/solutions`: four practical workflow narratives and implementation.
- `/about`: product positioning and only the supplied company relationship/information.
- `/contact`: enquiry form and what happens next.
- `/admin`: login and team workspace.

Primary business source: the owner-supplied four-page Fisheries360 brochure, read visually because its pages contain image-based text. It supports ponds/leases, stock, feed, expenses, activities, fish health, harvest, sales, payments, profitability, mobile access and reminders. The brochure does not verify CageNode specifications. The supplied CageNode screenshot is used only as a hardware concept reference. No meeting participants, faces or call UI are reproduced. No IP rating, battery life, radio range, accuracy, certification, customer adoption, pricing or production-availability claim is made.

Aquaculture photo: **Jebulon**, edited by **Bammesk**, [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Fish_farm_Amarynthos_Euboea_Greece_-_edit1.jpg), CC0. Cropped/compressed locally as WebP. It depicts an aquaculture site in Greece and is contextual imagery, not a Fisheries360 installation. Credits appear in the footer and admin library. CageNode: original SVG illustration inspired by the supplied concept. Font: Manrope under the SIL Open Font License, included at `public/fonts/OFL.txt`; assets are self-hosted and no font network request is needed.

## Verification

```powershell
npm run build
npm test
npm audit --omit=dev
```

`npm test` starts an isolated production server on a free port, creates randomly credentialed temporary test users in a temporary database, exercises real HTTP routes and persistence, then removes the test state. It never seeds the preview database or ships credentials.

The integration test covers SSR routes, navigation targets/assets, unique metadata, 404s, form validation and save, native form redirect, Origin and CSRF checks, role permissions, drafts and stale-write conflicts, authenticated preview, publish, restore, image upload/validation, enquiry notes/status/follow-up/delete and logout. See the delivered verification report for actual browser checks and remaining limits.

Public content is server-rendered, native details disclosures work without JavaScript, and no-JS navigation and component descriptions remain available. Interactive tabs/hotspots and the admin workspace need JavaScript. GSAP is loaded after hydration and skipped for reduced-motion users; CSS also disables motion. Mobile skips parallax, and below-fold images use lazy loading. Further production security review, backup operations, hosting verification and real-device testing remain the hosting operator's responsibility.

## Dashboard demo controls

The public dashboard is an interactive illustrative experience with seven operational/business views. Pond filters scope sample metrics and records. The period selector changes the illustrative chart, not the sample-cycle financial records. Search, activity-status filters and CSV exports operate on local sample records. The chart provides a keyboard range selector as well as pointer inspection. Selecting the first cell in a record opens its detail panel. Review-queue buttons switch to the relevant demo view. These controls never modify actual farm records or send alerts.

