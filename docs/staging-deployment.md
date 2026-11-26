# Staging deployment preparation

The reconciled CMS configuration publishes to `staging`. Pushing `staging`
automatically runs the staging workflow and deploys to
`https://staging.mediacollective.events` after its build checks pass.
No commit, push or deployment is authorised by this preparation.

The hosting controls must still be inspected to verify that the SFTP account
used by the staging secrets is restricted to the staging document root and
cannot access production or a parent containing production. Repository paths
alone cannot prove that restriction. The checklist below records required
settings; it does not certify the current IONOS account configuration.

## GitHub settings checklist

- `staging` already exists; reconcile reviewed candidate changes with that branch before promotion.
- Create the GitHub environment `staging`. Restrict its deployment branches to
  `staging` and configure reviewers if wanted.
- Add environment secrets `STAGING_SFTP_USERNAME` and `STAGING_SFTP_PASSWORD`.
  These MUST identify a separate IONOS SFTP account restricted to the staging
  document root. Never copy the production credentials into these secrets.
- Existing production secrets `SFTP_USERNAME` / `SFTP_PASSWORD` and destination
  remain unchanged. Both workflows reject manual runs from the wrong branch.

## IONOS values required

- Existing server: `access-5017155687.webspace-host.com`, SFTP port `22`.
- Confirm the actual production domain/document-root mapping in IONOS first.
  Its absolute filesystem path is not recorded in this repository.
- Provision a separate staging document root and map
  `staging.mediacollective.events` to it. Configure its DNS and HTTPS certificate.
- Create the staging SFTP account with that directory as its restricted root.
  Uploads and SEO cleanup use `.` relative to that account, including `seo-pages/`.
  Confirm the account cannot access production and staging does not inherit
  conflicting production Apache rules.
- Apache must support `mod_headers`: the staging robots directive intentionally
  is not guarded by IfModule, so lack of support cannot silently expose an
  indexable staging site. Verify actual response headers on staging, including
  invalid URLs, before using it. Directory/password protection is separate.

## Delivery and validation

Production: `main` -> existing production build/upload.
Staging: `staging` -> environment `staging` -> isolated staging SFTP account.
Concurrency and artifact names are separate. Neither workflow cancels an upload
in progress. Both retain payload validation after artifact download, hidden-file
inclusion, scoped obsolete SEO-shell cleanup and `.htaccess` activation last.

The normal build remains unchanged. Staging then runs:

```
DEPLOY_TARGET=staging node scripts/prepare-staging-payload.mjs
DEPLOY_TARGET=staging node scripts/check-deploy-payload.mjs
```

Preparation changes only built staging artifacts. It prepends to `dist/.htaccess`:

```
Header always set X-Robots-Tag "noindex, nofollow"
```

It also versions the CMS configuration and preview bundle URLs in built
`dist/admin/index.html` using hashes of their actual contents. Decap's supported
`cms-config-url` link selects the same `/admin/config.yml`, with a new cache key
when its bytes change. The preview bundle gets its own content hash because it
contains snapshots of referenced content. Repeated preparation is idempotent.
This does not change source `public/admin/index.html`, authentication, backend,
branch, collection names, content paths, media paths or field nesting. The
production workflow does not run this staging-only preparation step.

Production validation defaults to `production`; staging validation requires the
exact staging header plus the original generated rules. Missing protection,
unknown targets and cross-target payloads fail validation. Production metadata,
canonicals, sitemap, routes and content remain unchanged. The server header
prevents staging indexing even though its generated page metadata is unchanged.

Staging is not a separate backend: forms still use the live Apps Script service
and verification setup. Use controlled form tests; do not assume test enquiries
or analytics are isolated. Confirm Decap OAuth and any required verification
hostname authorisation before a later CMS switch. Do not submit staging to
Search Console. A noindex header is not access control.

## Promotion (requires separate authorisation)

Decap already targets `staging`; retain that setting. Verify the staging site and
delivery before promotion. Promote reviewed staging commits through a pull
request to `main`; production hotfixes should be merged back into staging.
Keep collection schemas, media paths and the authentication provider unchanged.

## Event Hub rehearsal backend

The only Event Hub backend allowed by the staging artifact is
`https://ioynilkvrfujnmudaped.supabase.co`. The staging deployment environment
variable `EVENT_HUB_REHEARSAL_PUBLISHABLE_KEY` supplies its browser publishable
key. Leave this variable unset until the isolated project's sign-in edge
function, code email template, and staging Auth redirect allowlist are ready.
The Hub shows a holding page until the variable is present, and a production
artifact served on the staging hostname also shows the holding page.

Use synthetic guest records and dedicated rehearsal accounts. The production
Eventbrite scheduler migrations end in `0006` and `0007` and must be omitted in
this project. The `partner-code-request` function uses rehearsal Supabase Auth
and suppresses access-request notification emails when deployed to the rehearsal
project. Walk-in registration stays disabled on staging until it has a separate
backend setup.

## Website invitation intake rehearsal

Apply the website invitation intake and event-update consent migrations to
the Event Hub rehearsal Supabase project. Register the SHA-256 hash of the
staging intake key in `portal_private.website_invitation_key`.

Deploy `website-enquiry` to the rehearsal project with JWT verification disabled
for this function. The function verifies reCAPTCHA and its staging hostname
server-side before writing data. Configure `WEBSITE_ENQUIRY_RECAPTCHA_SECRET`,
`WEBSITE_INVITATION_WRITE_KEY`, and `WEBSITE_INVITATION_PUBLISHABLE_KEY` in
Supabase Edge Function secrets. The function uses the runtime-provided service
role for the private consent audit RPCs.

The staging frontend sends all website enquiries to
`https://ioynilkvrfujnmudaped.supabase.co/functions/v1/website-enquiry`.
Apply `202611260056_staging_website_enquiries.sql` before deploying the revised
function. General contact and commercial interest appear in the owner workspace
under Invitation requests, in a separate enquiry inbox. Attendance requests
continue through the existing invitation intake. The new inbox suppresses
identical requests received within ten minutes.

For a subscription test, provision a separate HubSpot portal, form and subscription type
using `STAGING_HUBSPOT_PORTAL_ID`, `STAGING_HUBSPOT_FORM_ID` and
`STAGING_HUBSPOT_SUBSCRIPTION_ID`. Enable `HUBSPOT_EVENT_UPDATES_ENABLED` for
the controlled test window. Verify the consent record, subscription, opt-in
message and unsubscribe with a test inbox. The staging function rejects
subscriptions when a separate destination is absent.

The enquiry intake stores a receipt and exposes it to the owner. Email
acknowledgements are a separate workflow.
