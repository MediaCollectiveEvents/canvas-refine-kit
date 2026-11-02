import type { EventItem } from "./events";
import type { Contributor, SponsorLogo } from "./contentMetadata";
import { getContributors, getContributorById } from "./contributors";
import { getOrganisations, getOrganisationById } from "./organisations";

export interface EventParticipantSources {
  organisations?: SponsorLogo[];
  contributors?: Contributor[];
}

// Event-owned references are explicit: a logo or reverse link never implies sponsorship.
export function getEventParticipants(event: EventItem, sources: EventParticipantSources = {}) {
  const organisations = sources.organisations ?? getOrganisations();
  const contributors = sources.contributors ?? getContributors();
  const speaker = (id?: string) => getContributorById(id, contributors);
  const speakers = (ids: readonly string[] = []) => [...new Set(ids)].flatMap(id => speaker(id) ?? []);
  return {
    sponsors: [...new Set(event.sponsorIds ?? [])].flatMap(id => {
      const organisation = getOrganisationById(id, organisations);
      return organisation?.name?.trim() ? [organisation] : [];
    }),
    speakers: speakers(event.speakerIds),
    panels: (event.panels ?? []).map(panel => ({ ...panel,
      moderator: speaker(panel.moderatorId), speakers: speakers(panel.speakerIds),
    })),
  };
}

export function getEventParticipantIssues(event: EventItem, sources: EventParticipantSources = {}): string[] {
  const resolved = getEventParticipants(event, sources);
  const issues: string[] = [];
  for (const id of event.sponsorIds ?? []) {
    if (!resolved.sponsors.some(sponsor => sponsor.id === id)) issues.push(`Event ${event.id}: unresolved sponsor ${id}. Add a unique organisation ID and name before linking it.`);
  }
  const contributors = sources.contributors ?? getContributors();
  const checkSpeaker = (id: string) => {
    if (!getContributorById(id, contributors)) issues.push(`Event ${event.id}: unresolved speaker ${id}. Add a unique contributor ID and display name before linking it.`);
  };
  [...new Set([...(event.speakerIds ?? []), ...(event.panels ?? []).flatMap(panel =>
    [...(panel.speakerIds ?? []), ...(panel.moderatorId ? [panel.moderatorId] : [])])])].forEach(checkSpeaker);
  return issues;
}
