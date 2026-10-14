import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { matchRoutes } from "react-router-dom";

test("App temporarily redirects Calendar while event listings and details remain public", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]);
  assert.ok(app.includes('<Route path="/events/calendar" element={<Navigate to="/" replace />} />'));
  assert.ok(app.includes('<Route path="/events" element={<Events />} />'));
  const settings = JSON.parse(readFileSync("src/content/settings.json", "utf8"));
  assert.equal(settings.nav.find((item: { url?: string }) => item.url === "/events/calendar"), undefined);
  assert.ok(!readFileSync("src/components/sections/EventDiscoverySection.tsx", "utf8").includes('to="/events/calendar"'));
  assert.ok(!settings.nav.some((item: { type?: string }) => item.type === "blog"));
  assert.ok(app.includes('<Route path="/blog" element={<Navigate to="/" replace />} />'));
  assert.ok(paths.indexOf("/events/calendar") > -1);
  assert.ok(paths.indexOf("/events/calendar") < paths.indexOf("/events/:id"));
  const routes = paths.map(path => ({ path }));
  assert.equal(matchRoutes(routes, "/events/calendar")?.at(-1)?.route.path, "/events/calendar");
  for (const id of [1, 2, 3, 4]) {
    const match = matchRoutes(routes, `/events/${id}`)?.at(-1);
    assert.equal(match?.route.path, "/events/:id");
    assert.equal(match?.params.id, String(id));
  }
});
