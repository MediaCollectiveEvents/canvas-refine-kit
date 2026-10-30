import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getAllEvents, getEventIssues, normalizeEvents } from "../src/lib/events";
import { getEventParticipants, getEventParticipantIssues } from "../src/lib/eventParticipants";
import { getOrganisations } from "../src/lib/organisations";
import { getContributors } from "../src/lib/contributors";
import EventParticipants from "../src/components/shared/EventParticipants";
import EventsPreview from "../src/cms/previews/EventsPreview";
import type { PreviewEntry } from "../src/cms/previews/previewData";

const sources = {
  organisations: getOrganisations({ logos: [{ id: "confirmed-sponsor", name: "Confirmed Sponsor", src: "/uploads/sponsor.png", website: "https://example.com", relatedEventIds: [99] }] }),
  contributors: getContributors({ contributors: [
    { id: "speaker-one", displayName: "Speaker One", role: "Editor", organisation: "Media Company", biography: "A short biography.", image: "/uploads/speaker.png" },
    { id: "moderator-one", displayName: "Moderator One" },
  ] }),
};
const event = (extra: Record<string, unknown> = {}) => normalizeEvents([{ id: 99, title: "Future event", date: "2099-01-01", ...extra }])[0];
const render = (value: ReturnType<typeof event>, customSources = sources) => renderToStaticMarkup(createElement(EventParticipants, { event: value, sources: customSources }));

test("new event fields are optional and existing events infer no sponsors, speakers or panels", () => {
  for (const value of [...getAllEvents(), event({ partners: [{ name: "Existing partner" }] })]) {
    assert.equal(render(value), "");
  }
  assert.equal(render(event()), "", "reverse organisation event links do not imply sponsorship");
});

test("normalisation keeps event-owned references, panel order and optional copy without changing the source", () => {
  const input = { sponsorIds: ["confirmed-sponsor", "confirmed-sponsor", 2, "bad id"], speakerIds: ["speaker-one"], panels: [
    { title: "First panel", time: "10:00", moderatorId: "moderator-one", speakerIds: ["speaker-one", "speaker-one"], description: "Panel copy" },
    { title: "  " }, null, { title: "Second panel" },
  ] };
  const before = JSON.stringify(input), value = event(input);
  assert.deepEqual(value.sponsorIds, ["confirmed-sponsor"]);
  assert.deepEqual(value.panels?.map(panel => panel.title), ["First panel", "Second panel"]);
  assert.deepEqual(value.panels?.[0].speakerIds, ["speaker-one"]);
  assert.equal(value.panels?.[0].moderatorId, "moderator-one");
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(event({ sponsorIds: {}, speakerIds: "speaker-one", panels: {} }).panels, []);
});

test("shared-directory sponsors, speaker profiles and panel participants render with distinct roles", () => {
  const value = event({ sponsorIds: ["confirmed-sponsor"], speakerIds: ["speaker-one"], panels: [
    { title: "Industry discussion", time: "10:00", description: "What changes next?", moderatorId: "moderator-one", speakerIds: ["speaker-one"] },
  ] });
  const html = render(value);
  for (const text of ["Sponsors", "Speakers", "Panels", "Confirmed Sponsor", "Speaker One", "Moderator One", "Moderator", "Industry discussion", "10:00", "What changes next?", "A short biography."]) assert(html.includes(text), text);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.deepEqual(getEventParticipantIssues(value, sources), []);
});

test("unknown and duplicate directory identities stay hidden and create editorial diagnostics", () => {
  const value = event({ sponsorIds: ["missing"], speakerIds: ["missing"], panels: [{ title: "Discussion", moderatorId: "missing" }] });
  assert.equal(getEventParticipants(value, sources).sponsors.length, 0);
  assert.equal(getEventParticipants(value, sources).speakers.length, 0);
  assert.equal(getEventParticipantIssues(value, sources).length, 2);
  assert.doesNotMatch(render(value), /<h2[^>]*>Sponsors|<h2[^>]*>Speakers/);
  assert.match(render(value), /Discussion/, "a titled panel may be announced before participants");
  const duplicateSources = { organisations: [...sources.organisations, ...sources.organisations], contributors: [...sources.contributors, ...sources.contributors] };
  assert.equal(render(event({ sponsorIds: ["confirmed-sponsor"], speakerIds: ["speaker-one"] }), duplicateSources), "");
});

test("malformed references and panel data are diagnosed without affecting event identities", () => {
  const issues = getEventIssues([{ id: 99, sponsorIds: ["x", "x", 3], speakerIds: {}, panels: [{ title: "", moderatorId: 5 }] }]);
  assert(issues.some(issue => issue.includes("repeats x")));
  assert(issues.some(issue => issue.includes("invalid stable ID")));
  assert(issues.some(issue => issue.includes("speakers must be a list")));
  assert(issues.some(issue => issue.includes("needs a title")));
});

test("participant copy is escaped and unsafe images/websites are never rendered", () => {
  const unsafe = { organisations: [{ id: "sponsor", name: "<script>Sponsor</script>", src: "javascript:alert(1)", website: "javascript:alert(1)" }], contributors: [{ id: "speaker", displayName: "<script>Speaker</script>", image: "//evil.example/image.png", biography: "<img onerror=alert(1)>" }] };
  const html = render(event({ sponsorIds: ["sponsor"], speakerIds: ["speaker"], panels: [{ title: "<script>Panel</script>" }] }), unsafe);
  assert.doesNotMatch(html, /src="javascript|href="javascript|src="\/\/evil|<script>/);
  assert.match(html, /&lt;script&gt;Speaker/);
  assert.match(html, /&lt;script&gt;Panel/);
});

test("CMS detail preview uses the draft event and shared template without mutating canonical events", () => {
  const before = JSON.stringify(getAllEvents());
  const draft = { events: [{ id: 99, title: "Draft event", description: "Draft body", date: "2099-01-01", panels: [{ title: "Draft-only panel", description: "Draft-only description" }] }] };
  const entry: PreviewEntry = { getIn: () => ({ toJS: () => draft }) };
  const html = renderToStaticMarkup(createElement(EventsPreview, { entry, initialEventId: 99 }));
  assert.match(html, /Draft-only panel/); assert.match(html, /Draft-only description/);
  assert.match(html, /About This Event/); assert.match(html, /aria-label="Event preview"/);
  assert.equal(JSON.stringify(getAllEvents()), before);
});
