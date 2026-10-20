// Bump version whenever analytics providers or purposes materially change.
// This changes the storage key and invalidates records from the previous scope.
// Expiry is checked when loading or receiving a saved preference, not mid-form.
export const analyticsConsentPolicy: { version: number; maxAgeMs: number | null } = {
  version: 2,
  maxAgeMs: 180 * 24 * 60 * 60 * 1000,
};
