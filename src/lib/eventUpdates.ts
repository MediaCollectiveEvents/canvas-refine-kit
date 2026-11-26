/** This version identifies the explicit consent shown in the event-updates flow. */
export const EVENT_UPDATES_CONSENT_VERSION = "event-updates-v1";
export const EVENT_UPDATES_CONSENT_TEXT = "I agree to receive emails about new Media Collective events and to the processing of my details for this purpose. I can withdraw consent at any time.";

export function getEventUpdatesMetadata(requestId: string) {
  return { formType: "event-updates", consentVersion: EVENT_UPDATES_CONSENT_VERSION, requestId };
}
