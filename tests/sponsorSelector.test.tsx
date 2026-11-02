import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { registerReferenceWidgets, type ReferenceControlProps } from "../src/cms/controls/ReferenceRelationControl";
import { getOrganisations } from "../src/lib/organisations";
import { getEventParticipants } from "../src/lib/eventParticipants";
import { normalizeEvents } from "../src/lib/events";
import EventsPreview from "../src/cms/previews/EventsPreview";
import { previewSponsorSources } from "../src/cms/previews/previewData";

const waldo = { id: "waldo", name: "Waldo", src: "/uploads/waldo.png", description: "Product design consultancy", website: "https://www.waldo.consulting" };
const source = { logos: [
  ...Array.from({ length: 30 }, (_, index) => ({ name: `Legacy ${index}`, src: `/uploads/${index}.png` })),
  waldo, { id: "no-name", src: "a.png" }, { id: "duplicate", name: "First", src: "a.png" },
  { id: "duplicate", name: "Second", src: "b.png" }, { id: "no-image", name: "No image" },
] };
function control(kind = "organisation-relation") {
  const widgets: Record<string, React.ComponentClass<ReferenceControlProps>> = {};
  registerReferenceWidgets({ getWidget: () => ({ control: () => null }), registerWidget: (name, widget) => { widgets[name] = widget as React.ComponentClass<ReferenceControlProps>; } });
  let selected: unknown;
  const calls: unknown[][] = [];
  const instance = new widgets[kind]({ field: { get: () => undefined }, value: [], queryHits: [], onChange: value => { selected = value; },
    query: async (...args) => {
      calls.push(args);
      // Decap applies options_length to matching nested fields BEFORE returning
      // the containing file. A first page of legacy rows must not hide Waldo.
      const limit = args[5] as number;
      return { payload: { hits: [{ data: { logos: limit > 0 ? source.logos.slice(0, limit) : source.logos } }] } };
    },
  });
  const picker = () => instance.render().props.children[0] as React.ReactElement<ReferenceControlProps>;
  return { picker, calls, selected: () => selected };
}

test("sponsor picker loads the complete file before filtering, including valid records beyond Decap's default 20", async () => {
  const { picker, calls } = control();
  const result = await picker().props.query("events.0.sponsorIds", "sponsors", ["logos.*.name", "logos.*.id"], "", "sponsors", 20);
  assert.equal(calls[0][5], 0);
  assert.deepEqual((result.payload.hits![0].data as typeof source).logos.map(row => row.id), ["waldo"]);
});

test("search uses the complete directory and keeps duplicate IDs excluded even for a single matching name", async () => {
  const { picker, calls } = control();
  for (const search of ["Waldo", "WAL", "waldo", "First", "missing"]) {
    const result = await picker().props.query("field", "sponsors", ["logos.*.name", "logos.*.id"], search, "sponsors", 20);
    assert.equal(calls.at(-1)![3], "");
    const rows = (result.payload.hits![0].data as typeof source).logos;
    assert.deepEqual(rows.map(row => row.id), ["First", "missing"].includes(search) ? [] : ["waldo"]);
  }
});

test("selection stores only the stable ID and the participant resolver finds the central sponsor", async () => {
  const { picker, selected } = control();
  const result = await picker().props.query("field", "sponsors", [], "", "sponsors", 20);
  picker().props.onChange(["waldo"]);
  assert.deepEqual(selected(), ["waldo"]);
  const organisations = getOrganisations(result.payload.hits![0].data);
  const event = normalizeEvents([{ id: 99, title: "Draft", date: "2099-01-01", sponsorIds: selected() }])[0];
  assert.equal(getEventParticipants(event, { organisations }).sponsors[0].name, "Waldo");
  assert.deepEqual(getEventParticipants({ ...event, sponsorIds: [] }, { organisations }).sponsors, []);
});

test("event relations keep their existing query arguments", async () => {
  const { picker, calls } = control("event-relation");
  const args = ["field", "events", ["events.*.title"], "Draft", "eventsContent", 20];
  await picker().props.query(...args);
  assert.deepEqual(calls[0], args);
});

test("draft preview renders a staging-only sponsor from Decap relation metadata without copying it into event data", () => {
  const draft = { events: [{ id: 99, title: "Staging draft", date: "2099-01-01", sponsorIds: ["waldo"], panels: [{ title: "First panel" }, { title: "Second panel" }] }] };
  const before = JSON.stringify(draft);
  const metadata = { events: { 0: { sponsorIds: { sponsors: { waldo: { logos: [waldo] } } } } } };
  const fieldsMetaData = { toJS: () => metadata };
  assert.equal(previewSponsorSources(fieldsMetaData)!.organisations.find(row => row.id === "waldo")!.name, "Waldo");
  const html = renderToStaticMarkup(<EventsPreview entry={{ getIn: () => ({ toJS: () => draft }) }} initialEventId={99} fieldsMetaData={fieldsMetaData} />);
  assert.match(html, /Waldo/);
  assert.match(html, /https:\/\/www.waldo.consulting/);
  assert.doesNotMatch(html, /unresolved sponsor waldo/);
  assert(html.indexOf("First panel") < html.indexOf("Second panel"));
  assert.equal(JSON.stringify(draft), before);
  assert.equal(previewSponsorSources(undefined), undefined);
});
