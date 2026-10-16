# Staging deployment preparation

CMS publishing remains on `main`. This preparation does not provision a branch,
GitHub environment, secrets, DNS, TLS or hosting, and does not deploy anything.

## GitHub settings required before enabling staging

- Create `staging` from clean, current production `main`, excluding local pending work.
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

Preparation changes only built `dist/.htaccess`, prepending:

```
Header always set X-Robots-Tag "noindex, nofollow"
```

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

## Later cutover (not included here)

Verify the staging site and delivery first. Only then approve changing Decap's
publishing branch and site links. Promote reviewed staging commits through a
pull request to `main`; production hotfixes should be merged back into staging.
Keep collection schemas, media paths and the authentication provider unchanged.
