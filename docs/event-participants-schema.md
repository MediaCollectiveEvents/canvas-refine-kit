# Event participants

## Baseline and scope

This additive feature targets main at `29157aede1543dd5afc1cb6606aa0722283917eb`. Main already provides the shared `EventPageTemplate`; the preview commit reuses it without modifying public EventDetails, editorial renderers, registration, calendar, metadata, narrative or Partners behavior. The public route remains `/events/:id`.

Individual CMS previews normalize unsaved draft data and render the same template. A keyed PreviewLayout resets MemoryRouter state when switching between listing and individual event selections. Preview invitation handlers are inert; they do not submit registrations. The existing legacy layout preview and protected-event-ID/capacity diagnostics remain intact.

## Additive fields

Events may store optional `sponsorIds: string[]`, `speakerIds: string[]`, and ordered `panels`. Sponsor IDs reference existing `src/content/sponsors.json` records through the organisation loader. Speaker IDs reference existing `src/content/contributors.json` profiles. Biographies, logos and participant records are not copied into events. Existing Partners and reverse organisation event links do not imply sponsorship.

Panels have a required `title`, optional display `time` and `description`, optional `moderatorId`, and optional ordered `speakerIds`. Titles must be nonblank. Panels preserve editorial array order. IDs use stable lowercase letters/numbers separated by hyphens. Repeated references are deduplicated in first-occurrence order. Malformed reference IDs and blank-title panels are omitted with CMS diagnostics. Missing or ambiguous directory records stay hidden with unresolved-reference diagnostics; titled panels may render before their participants are confirmed.

The existing event collection gains Sponsors, Speakers and Panels fields. Sponsor selection uses the existing organisation-relation control; people use contributor relation fields. Contributor labels acknowledge speakers and the ID hint protects both article/event references. Existing collection names, formats, files, content, IDs/slugs and source fields are retained.

## Rendering

Sponsors, Speakers and Panels render after Programme and before the existing partner-event/Partners/context sections, without changing those sections. Empty participant sections are omitted. The component renders for both generic and editorial events. Participant text is escaped; unsafe image/website URLs are rejected using existing source handling. No new registration policy, calendar logic, image mapping or narrative formatting is introduced.

## Validation and follow-up

Replay validation compares current main with both replacement layers, including full-suite baseline comparison, existing event/template/editorial tests, participant tests, draft switching at desktop/mobile widths, TypeScript, scoped lint, production/static-head and CMS builds, and public HTML equivalence for all eight events plus not-found (normalizing generated Radix IDs). Build the CMS bundle from each layer's sources; do not hand-edit it. Earlier `1162a0d` test counts and behavior are historical, not the current baseline.

No directory or event content is changed by this feature. Editors must provide stable sponsor IDs and speaker profiles through the existing CMS before references display.
