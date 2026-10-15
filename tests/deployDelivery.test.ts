import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { checkDeployPayload } from "../scripts/check-deploy-payload.mjs";

// Build independent fixtures from tracked inputs; tests do not need a prior build.
import { generateApacheRouting } from "../scripts/generate-apache-routing.mjs";
import { generateSitemap } from "../scripts/generate-sitemap.mjs";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
import events from "../src/content/events.json";

test("deployment payload fails closed for missing routing/shells or stale inventory/sitemap", () => {
  const root = mkdtempSync(join(tmpdir(), "seo-payload-test-"));
  try {
    for (const dir of ["src/content", "dist/seo-pages", "dist/admin"]) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, "src/content/events.json"), JSON.stringify(events));
    const routes = getCanonicalRoutes(events);
    const manifest = { routes, error: { file: ERROR_SHELL_FILE } };
    const put = (file: string, content: string) => writeFileSync(join(root, "dist", file), content);
    put("seo-pages/manifest.json", JSON.stringify(manifest));
    put(".htaccess", generateApacheRouting(events));
    put("sitemap.xml", generateSitemap(events));
    put("robots.txt", "Sitemap: https://mediacollective.events/sitemap.xml");
    put("admin/index.html", "CMS"); put("admin/cms.bundle.js", "CMS");
    for (const route of routes) put(route.file, `<link rel="canonical" href="${route.url}"><div id="root"></div>`);
    put(ERROR_SHELL_FILE, '<meta name="robots" content="noindex, follow">');
    assert.doesNotThrow(() => checkDeployPayload(root));
    unlinkSync(join(root, "dist/.htaccess"));
    assert.throws(() => checkDeployPayload(root));
    put(".htaccess", generateApacheRouting(events));
    unlinkSync(join(root, "dist", routes[0].file));
    assert.throws(() => checkDeployPayload(root), /Missing or obsolete/);
    put(routes[0].file, `<link href="${routes[0].url}"><div id="root"></div>`);
    put("seo-pages/manifest.json", JSON.stringify({ ...manifest, routes: routes.slice(1) }));
    assert.throws(() => checkDeployPayload(root), /inventory is stale/);
    put("seo-pages/manifest.json", JSON.stringify(manifest));
    put("sitemap.xml", generateSitemap(events).replace("/events/8", "/events/999"));
    assert.throws(() => checkDeployPayload(root), /Sitemap is stale/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("workflow includes hidden routing and activates it after payload upload and scoped cleanup", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  assert.match(workflow, /include-hidden-files: true/);
  assert.equal((workflow.match(/node scripts\/check-deploy-payload.mjs/g) || []).length, 2);
  assert.ok(workflow.indexOf("Deploy payload via SFTP") < workflow.indexOf("python3 scripts/clean-stale-seo-shells.py"));
  assert.ok(workflow.indexOf("python3 scripts/clean-stale-seo-shells.py") < workflow.indexOf("Activate Apache routing last"));
  assert.match(workflow, /local_path: \$\{\{ env.BUILD_DIR \}\}\/\*/);
  assert.match(workflow, /local_path: \$\{\{ env.BUILD_DIR \}\}\/\.htaccess/);
  assert.doesNotMatch(workflow, /delete_remote_files: true|rm -rf/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test("remote cleanup targets only obsolete generated shells and refuses incomplete/unexpected listings", () => {
  const result = spawnSync("python3", ["-c", `
import runpy
helper = runpy.run_path('scripts/clean-stale-seo-shells.py')['obsolete_shells']
expected = {'home.html', '404.html'}
listing = 'sftp> ls -1 seo-pages/\\nseo-pages/home.html\\nseo-pages/404.html\\nseo-pages/manifest.json\\nseo-pages/event-999.html\\n'
assert helper(listing, expected) == ['event-999.html']
assert helper(listing.replace('seo-pages/event-999.html\\n', ''), expected) == []
for invalid in [listing.replace('seo-pages/home.html\\n', ''), listing+'seo-pages/../../outside.html\\n', listing+'unexpected-output\\n', listing+'seo-pages/keep.txt\\n']:
    try: helper(invalid, expected)
    except ValueError: pass
    else: raise AssertionError('Unsafe listing accepted')
`], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
