const productionSiteKey = "6LeBiU8sAAAAAOmWadJe4sFM-0UaOBkFk-19GyIc";

// A development key must be approved for localhost and match server-side verification.
// Never substitute Google's test keys or bypass the existing handler.
export function getEnquirySiteKey(development: boolean, configuredKey?: string): string | undefined {
  return configuredKey?.trim() || (development ? undefined : productionSiteKey);
}
