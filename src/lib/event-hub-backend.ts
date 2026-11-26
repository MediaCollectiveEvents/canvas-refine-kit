const stagingHostname = 'staging.mediacollective.events';
const productionUrl = 'https://qtmbioguefmtwtngbava.supabase.co';
const rehearsalUrl = 'https://ioynilkvrfujnmudaped.supabase.co';

const onStagingHost = typeof window !== 'undefined' && window.location.hostname === stagingHostname;
const stagingBuild = import.meta.env?.VITE_EVENT_HUB_STAGING === 'true';
const stagingKey = import.meta.env?.VITE_EVENT_HUB_STAGING_PUBLISHABLE_KEY ?? '';

export const isEventHubStaging = onStagingHost || stagingBuild;
export const isEventHubRehearsalReady = onStagingHost && stagingBuild && /^sb_publishable_[A-Za-z0-9_-]+$/.test(stagingKey);

export const projectUrl = isEventHubStaging
  ? isEventHubRehearsalReady ? rehearsalUrl : 'https://event-hub-unavailable.invalid'
  : productionUrl;
export const publishableKey = isEventHubStaging
  ? isEventHubRehearsalReady ? stagingKey : ''
  : 'sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz';
