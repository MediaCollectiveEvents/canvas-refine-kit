# www canonical URL migration

## Status and scope

Prepared on `codex/www-canonical-20261026` from production `c207a00` and approved for production deployment. Local validation is recorded below; confirm live activation against the production workflow and verification matrix. DNS and IONOS account settings remain unchanged.

Preferred origin: **https://www.mediacollective.events**.

## Hosting and DNS evidence — 26 October 2026

The live site uses Apache on IONOS shared web hosting. GitHub Actions builds the Vite application and uploads the production payload by SFTP. No Nginx, Netlify, Vercel or Cloudflare reverse-proxy configuration is used by this deployment; analytics integrations do not establish an edge proxy.

Both names currently serve the application over HTTP and HTTPS with status 200 rather than redirecting. Both HTTPS names have a trusted certificate covering `mediacollective.events` and `*.mediacollective.events`; the inspected certificate expires on 22 January 2027.

IONOS authoritative name servers: `ns1045.ui-dns.biz`, `ns1045.ui-dns.com`, `ns1045.ui-dns.de`, `ns1045.ui-dns.org`.

| Host | Type | Existing value | Required action |
|---|---|---|---|
| `@` | A | `217.160.0.131` | Keep |
| `@` | AAAA | `2001:8d8:100f:f000::200` | Keep |
| `www` | A | `217.160.0.131` | Keep |
| `www` | AAAA | `2001:8d8:100f:f000::200` | Keep |

**No DNS changes are required.** Both hostnames already resolve to the correct service and have working HTTPS. DNS does not implement the HTTP 301.

Optional alternative, only if a CNAME is specifically desired: replace the `www` A and AAAA records with `www CNAME mediacollective.events.` using TTL 3600. Do not add the CNAME alongside conflicting records, do not create an apex CNAME, and do not alter mail, verification, staging or nameserver records. Keep IONOS serving both hostnames from the existing production web root.

IONOS optional CNAME steps: Domains & SSL → mediacollective.events → Manage Subdomains → www → DNS. Review conflicting records, remove only the www A/AAAA records, then add CNAME with hostname `www` and target `mediacollective.events` (no scheme or path). Recheck DNS, web-root mapping and HTTPS afterward. Keeping the current DNS is the smaller change.

## Exact Apache change

The root generator and `public/.htaccess` place the following before all application/asset rewrites. The same block appears before the existing rules in `public/admin/.htaccess`, because that child configuration has its own rewrite engine and does not inherit the root rules automatically.

```apache
# Canonical production hostname and HTTPS before internal route/asset rewrites.
# Excludes staging, localhost and unrelated hosts; query strings are retained.
RewriteCond %{HTTP_HOST} ^(?:www\.)?mediacollective\.events(?::[0-9]+)?$ [NC]
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} !^www\.mediacollective\.events$ [NC]
# Use the original encoded path: REQUEST_URI can be decoded in .htaccess.
RewriteCond %{THE_REQUEST} \s(/[^?\s]*)
RewriteRule ^ https://www.mediacollective.events%1 [R=301,END,NE]
```

The original encoded path comes from `THE_REQUEST`; query strings are retained by mod_rewrite. The redirect destination is fixed, not taken from user-controlled Host values. Apache handles the request before React loads. Root-relative links retain their existing React Router behaviour on the www origin.

This uses Apache's native `%{HTTPS}` signal. The current service is IONOS Apache; if a TLS-terminating proxy is introduced or the hosting does not expose HTTPS as `on`, verify the provider's trusted scheme signal before activation. Do not blindly trust arbitrary `X-Forwarded-Proto` headers. The live four-variant check below must be performed after activation; local verification cannot inspect the hosting provider's internal environment.

## Application and metadata changes

- `src/lib/canonicalRoutes.mjs`: `SITE_ORIGIN = "https://www.mediacollective.events"`.
- All 14 canonical tags, Open Graph URLs, owned relative social-image URLs, Organization/Event JSON-LD IDs and URLs, and event calendar/share URLs use that shared origin.
- `public/sitemap.xml` regenerated with all 14 www entries.
- `public/robots.txt` points to `https://www.mediacollective.events/sitemap.xml`.
- Existing internal navigation remains root-relative (`/events/6`, `/community`, etc.); it resolves on www without cross-host links or changes to React routing.
- Existing titles, descriptions, artwork, event data, IDs, schemas and CMS backend branch remain unchanged.
- The deployment payload validator reads the same origin when checking robots.txt.
- Social metadata examples and URL assertions are updated to www.
- Staging receives its existing noindex protection and is excluded by the production hostname guard.

## Verification completed locally

An isolated Apache 2.4.62 fixture served the actual built payload over HTTP and verified TLS using a temporary local certificate. It exercised 54 scenarios, including 33 redirect chains, all completing in one hop with no loops. Coverage included root, Community, event detail, query strings, percent-encoded spaces/hash characters, real assets, CMS config, unknown routes, staging/localhost/unrelated hosts, host casing and explicit ports.

| Incoming URL | Expected response |
|---|---|
| `http://mediacollective.events/path?x=1` | 301 → `https://www.mediacollective.events/path?x=1` |
| `http://www.mediacollective.events/path?x=1` | Same one-hop 301 |
| `https://mediacollective.events/path?x=1` | Same one-hop 301 |
| `https://www.mediacollective.events/path?x=1` | 200 for an existing route, no redirect |
| Unknown path on a noncanonical variant | One 301, then a 404 on www |
| `staging.mediacollective.events` | No production-host redirect |

No HSTS `includeSubDomains` or preload directive is added: the redirect enforces HTTPS without imposing a new policy on other subdomains. HSTS can be a separate hardening step after successful live verification of all affected services.

## Rebuild and review

```sh
node scripts/generate-apache-routing.mjs
node scripts/generate-sitemap.mjs
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.node.json
npm run build
node scripts/check-deploy-payload.mjs
git diff --check
```

Run the full existing test suite using the project test harness. Inspect generated `dist/.htaccess`, `dist/admin/.htaccess`, `dist/sitemap.xml`, `dist/robots.txt`, and all route-specific heads under `dist/seo-pages/`. Both Apache source files are covered by the redirect regression test; the admin block must stay in sync when the canonical origin changes.

To validate a staging artifact separately, use a fresh build and then:

```sh
DEPLOY_TARGET=staging node scripts/prepare-staging-payload.mjs
DEPLOY_TARGET=staging node scripts/check-deploy-payload.mjs
```

Do not upload this staging-prepared artifact to production; create a fresh production build for release.

## Deployment steps — when authorized

1. Review the local diff and preserve a backup/reference to release `c207a00`.
2. Keep DNS unchanged. Verify both hostnames remain attached to the same IONOS production web root and the valid certificate remains enabled.
3. Commit the reviewed migration on its branch and merge/promote it to `main` only when deployment is authorized.
4. The existing production workflow `.github/workflows/deploy.yml` builds and validates the payload, uploads assets and route shells, verifies the remote shell inventory, and activates root `.htaccess` last. The CMS child `.htaccess` is included in the normal payload.
5. Confirm the production workflow succeeds. Check both IPv4 and IPv6 from a network with those protocols available.
6. Test every variant below. The first three must show exactly one redirect; canonical HTTPS www must show zero redirects. No response may redirect back to non-www or HTTP.

```sh
curl -sS -L --max-redirs 5 -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' 'http://mediacollective.events/events/6?audit=www'
curl -sS -L --max-redirs 5 -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' 'http://www.mediacollective.events/events/6?audit=www'
curl -sS -L --max-redirs 5 -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' 'https://mediacollective.events/events/6?audit=www'
curl -sS -L --max-redirs 5 -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' 'https://www.mediacollective.events/events/6?audit=www'
curl -sS -I 'https://staging.mediacollective.events/events/6'
curl -sS -I 'https://www.mediacollective.events/uploads/Venue%20tiles/RAI.png'
curl -sS -I 'https://mediacollective.events/admin/config.yml'
```

7. Repeat for `/`, `/community`, `/events`, `/partners`, `/faq`, `/privacy-policy`, event IDs 1–8, `/admin/`, real assets and a nonexistent route. Canonical unknown routes must retain status 404. Confirm staging remains isolated and noindex; production must not acquire staging noindex headers.
8. Inspect View Source for one www canonical per public route, matching `og:url`, www owned image URLs and parseable JSON-LD. Check both sitemap.xml and robots.txt use www. Verify navigation, event forms, favicon and social card.
9. Add/verify the www URL-prefix property where needed in Search Console and Bing Webmaster Tools; domain properties cover the hostname variants. Submit `https://www.mediacollective.events/sitemap.xml` and request representative recrawls. Retain existing verification properties and redirects long-term.

## Rollback

Revert this migration and redeploy the prior release's Apache rules, metadata, sitemap and robots together. No DNS rollback is needed if the recommended unchanged DNS is used. 301s may be cached by browsers; verify rollback with fresh curl requests. Coordinate rollback if separate IONOS control-panel redirects or a proxy are introduced later.

## Primary references

- Apache canonical hostnames / HTTPS: https://httpd.apache.org/docs/2.4/rewrite/remapping.html
- Google canonical signals: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- IONOS CNAME setup: https://www.ionos.co.uk/help/domains/configuring-cname-records-for-subdomains/configuring-a-cname-record-for-a-subdomain/
- IONOS DNS conflicts: https://www.ionos.com/help/domains/general-information-about-dns-settings/avoiding-dns-conflicts/
