import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import yaml from "js-yaml";
import { deployTarget, routingForTarget, prepareStagingPayload, stagingCmsHtml } from "../scripts/prepare-staging-payload.mjs";
import { generateApacheRouting } from "../scripts/generate-apache-routing.mjs";
import { checkDeployPayload } from "../scripts/check-deploy-payload.mjs";
import { generateSitemap } from "../scripts/generate-sitemap.mjs";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
import events from "../src/content/events.json";

const production = yaml.load(readFileSync(".github/workflows/deploy.yml", "utf8")) as any;
const stagingText = readFileSync(".github/workflows/deploy-staging.yml", "utf8");
const staging = yaml.load(stagingText) as any;

test("production and staging triggers, manual runs, credentials and concurrency remain separated", () => {
  for (const [workflow, branch, target] of [[production, "main", "production"], [staging, "staging", "staging"]]) {
    assert.deepEqual(workflow.on.push.branches, [branch]);
    assert.ok(Object.hasOwn(workflow.on, "workflow_dispatch"));
    assert.equal(workflow.env.DEPLOY_TARGET, target);
    for (const job of Object.values(workflow.jobs) as any[]) assert.equal(job.if, `github.ref == 'refs/heads/${branch}'`);
    assert.equal(workflow.concurrency['cancel-in-progress'], false);
  }
  assert.notEqual(production.concurrency.group, staging.concurrency.group);
  assert.equal(staging.jobs.deploy.environment.name, "staging");
  assert.equal(staging.jobs.deploy.environment.url, "https://staging.mediacollective.events");
  assert.equal(staging.permissions.contents, "read");
  const uploads = (workflow: any) => workflow.jobs.deploy.steps.filter((s: any) => s.uses?.startsWith("wlixcc/"));
  assert.equal(uploads(production).length, 2);
  assert.equal(uploads(staging).length, 2);
  for (const step of uploads(production)) {
    assert.equal(step.with.username, "${{ secrets.SFTP_USERNAME }}");
    assert.equal(step.with.password, "${{ secrets.SFTP_PASSWORD }}");
    assert.equal(step.with.remote_path, ".");
    assert.equal(step.with.server, "access-5017155687.webspace-host.com");
  }
  for (const step of uploads(staging)) {
    assert.equal(step.uses, "wlixcc/SFTP-Deploy-Action@a5ccb9c6211a94cc59404f0fdb2a9936a6dfee64",
      "Both staging uploads must use the pinned release with the quoted password-mode check");
    assert.equal(step.with.sftp_only, true);
    assert.notEqual(step.with.delete_remote_files, true);
    assert.ok(!step.with.rsyncArgs, "Keep the direct SFTP path; do not enable rsync filtering");
    assert.equal(step.with.username, "${{ secrets.STAGING_SFTP_USERNAME }}");
    assert.equal(step.with.password, "${{ secrets.STAGING_SFTP_PASSWORD }}");
    assert.equal(step.with.remote_path, ".");
    assert.equal(step.with.server, "access-5017155687.webspace-host.com");
  }
  assert.doesNotMatch(stagingText, /secrets\.SFTP_USERNAME|secrets\.SFTP_PASSWORD/);
  const required = staging.jobs.deploy.steps.find((s: any) => s.name === "Require dedicated staging credentials");
  assert.match(required.run, /test -n "\$SFTP_USERNAME"/);
  assert.match(required.run, /test -n "\$SFTP_PASSWORD"/);
});

test("staging keeps validated hidden-file delivery, scoped cleanup and routing activation last", () => {
  const build = staging.jobs.build.steps;
  const deploy = staging.jobs.deploy.steps;
  const position = (steps: any[], name: string) => steps.findIndex(s => s.name === name);
  assert.ok(position(build, "Build Vite site") < position(build, "Add staging-only indexing protection"));
  assert.ok(position(build, "Add staging-only indexing protection") < position(build, "Validate deployment payload"));
  assert.equal(build.find((s: any) => s.name === "Add staging-only indexing protection").run, "node scripts/prepare-staging-payload.mjs");
  assert.equal(build.find((s: any) => s.name === "Upload build artifact").with['include-hidden-files'], true);
  assert.equal(build.find((s: any) => s.name === "Upload build artifact").with.name, "staging-site-dist");
  assert.equal(deploy.find((s: any) => s.name === "Download build artifact").with.name, "staging-site-dist");
  const validations = [...build, ...deploy].filter((s: any) => s.run === "node scripts/check-deploy-payload.mjs");
  assert.equal(validations.length, 2);
  assert.ok(position(deploy, "Require dedicated staging credentials") < position(deploy, "Deploy payload via SFTP"));
  assert.ok(position(deploy, "Deploy payload via SFTP") < position(deploy, "Verify remote shells and remove obsolete generated HTML"));
  assert.ok(position(deploy, "Verify remote shells and remove obsolete generated HTML") < position(deploy, "Activate Apache routing last"));
  const cleanup = deploy.find((s: any) => s.name === "Verify remote shells and remove obsolete generated HTML");
  assert.equal(cleanup.env.SFTP_USERNAME, "${{ secrets.STAGING_SFTP_USERNAME }}");
  assert.equal(cleanup.env.SFTP_PASSWORD, "${{ secrets.STAGING_SFTP_PASSWORD }}");
  assert.doesNotMatch(stagingText, /delete_remote_files: true|rm -rf/);
  const cms = yaml.load(readFileSync("public/admin/config.yml", "utf8")) as any;
  assert.equal(cms.backend.branch, "staging", "CMS publishes reviewed content to staging before production promotion");
});

test("staging robots header is always applied while production Apache output is byte-identical", () => {
  const base = generateApacheRouting(events);
  assert.equal(routingForTarget(base, "production"), base);
  assert.doesNotMatch(base, /X-Robots-Tag/);
  const stagingRules = routingForTarget(base, "staging");
  assert.match(stagingRules, /^# Staging only:[^\n]+\nHeader always set X-Robots-Tag "noindex, nofollow"/);
  assert.equal((stagingRules.match(/Header always set X-Robots-Tag/g) || []).length, 1);
  assert.ok(stagingRules.endsWith(base), "canonical route rewrites and error handling stay unchanged");
  assert.throws(() => routingForTarget(stagingRules, "production"), /target-specific/);
  for (const bad of ["", "preview", "prod", "../production"]) {
    assert.throws(() => deployTarget(bad), /Unsupported/);
    assert.throws(() => routingForTarget(base, bad), /Unsupported/);
  }
});

test("payload preparation and validation reject cross-target uploads and missing staging noindex", () => {
  const root = mkdtempSync(join(tmpdir(), "staging-payload-test-"));
  try {
    for (const dir of ["src/content", "dist/seo-pages", "dist/admin"]) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, "src/content/events.json"), JSON.stringify(events));
    const put = (file: string, value: string) => writeFileSync(join(root, "dist", file), value);
    const routes = getCanonicalRoutes(events), base = generateApacheRouting(events);
    put(".htaccess", base);
    put("seo-pages/manifest.json", JSON.stringify({ routes, error: { file: ERROR_SHELL_FILE } }));
    put("sitemap.xml", generateSitemap(events));
    put("robots.txt", "Sitemap: https://mediacollective.events/sitemap.xml");
    put("admin/index.html", '<head>\n</head><script src="/admin/cms.bundle.js"></script>'); put("admin/cms.bundle.js", "CMS"); put("admin/config.yml", "backend:\n  branch: staging\n");
    for (const route of routes) put(route.file, `<link rel="canonical" href="${route.url}"><div id="root"></div>`);
    put(ERROR_SHELL_FILE, '<meta name="robots" content="noindex, follow">');
    assert.doesNotThrow(() => checkDeployPayload(root, "dist", "production"));
    assert.throws(() => checkDeployPayload(root, "dist", "staging"), /staging root/);
    assert.throws(() => prepareStagingPayload(root, "dist", "production"), /requires DEPLOY_TARGET/);
    assert.equal(readFileSync(join(root, "dist/.htaccess"), "utf8"), base);
    prepareStagingPayload(root, "dist", "staging");
    const prepared = readFileSync(join(root, "dist/.htaccess"), "utf8");
    assert.doesNotThrow(() => checkDeployPayload(root, "dist", "staging"));
    assert.throws(() => checkDeployPayload(root, "dist", "production"), /production root/);
    prepareStagingPayload(root, "dist", "staging");
    assert.equal(readFileSync(join(root, "dist/.htaccess"), "utf8"), prepared);
    put(".htaccess", prepared.replace('"noindex, nofollow"', '"index, follow"'));
    assert.throws(() => checkDeployPayload(root, "dist", "staging"), /staging root/);
    assert.throws(() => prepareStagingPayload(root, "dist", "staging"), /Unexpected Apache/);
    assert.throws(() => checkDeployPayload(root, "dist", "other"), /Unsupported/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});


test("staging CMS launcher versions config and preview bytes without changing source or backend", () => {
  const source = readFileSync("public/admin/index.html", "utf8");
  const config = readFileSync("public/admin/config.yml", "utf8");
  const built = stagingCmsHtml(source, config, "preview one");
  assert.match(built, /rel="cms-config-url" type="text\/yaml" href="\/admin\/config.yml\?v=[a-f0-9]{16}"/);
  assert.match(built, /src="\/admin\/cms.bundle.js\?v=[a-f0-9]{16}"/);
  assert.equal(stagingCmsHtml(built, config, "preview one"), built, "Preparation is idempotent");
  const changedConfig = stagingCmsHtml(source, config + "\n", "preview one");
  const changedPreview = stagingCmsHtml(source, config, "preview two");
  const href = (html: string) => html.match(/href="(\/admin\/config.yml[^"]*)"/)![1];
  const src = (html: string) => html.match(/src="(\/admin\/cms.bundle.js[^"]*)"/)![1];
  assert.notEqual(href(changedConfig), href(built));
  assert.equal(src(changedConfig), src(built));
  assert.notEqual(src(changedPreview), src(built));
  assert.equal(href(changedPreview), href(built));
  assert.equal(readFileSync("public/admin/index.html", "utf8"), source);
  assert.doesNotMatch(source, /cms-config-url|cms.bundle.js\?v=/, "Production launcher stays unchanged");
  assert.throws(() => stagingCmsHtml("unexpected launcher", config, "preview"), /Unexpected CMS launcher/);
});
