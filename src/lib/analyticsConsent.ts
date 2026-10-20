import { analyticsConsentPolicy } from "./analyticsConsentPolicy";
import { installCloudflareConsentGuard } from "./cloudflareConsent";
export const ANALYTICS_ID = "G-4VZBFPC4S8";
export const ANALYTICS_CONSENT_KEY = `tmc.analytics-consent.v${analyticsConsentPolicy.version}`;
export type AnalyticsChoice = "accepted" | "rejected" | null;

const denied = { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
export function parseAnalyticsChoice(value: string | null, now = Date.now(), maxAgeMs = analyticsConsentPolicy.maxAgeMs): AnalyticsChoice {
  try {
    const record = JSON.parse(value ?? "null");
    if (!record || record.version !== analyticsConsentPolicy.version || !["accepted", "rejected"].includes(record.choice) || !Number.isFinite(record.savedAt) || record.savedAt < 0 || record.savedAt > now) return null;
    if (maxAgeMs !== null && (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0 || now - record.savedAt >= maxAgeMs)) return null;
    return record.choice;
  } catch { return null; }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function createAnalyticsConsent(browser: Window) {
  let choice: AnalyticsChoice = null;
  try {
    const saved = browser.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    choice = parseAnalyticsChoice(saved);
    if (saved !== null && choice === null) browser.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  } catch { /* Fail closed if storage is unavailable. */ }
  let initialized = false;
  let requested = false;
  const listeners = new Set<() => void>();
  const globals = browser as Window & Record<string, unknown>;
  const disable = `ga-disable-${ANALYTICS_ID}`;

  function clearAnalyticsCookies() {
    const doc = browser.document;
    const host = browser.location.hostname;
    const domains = [""];
    if (host !== "localhost" && !/^[\d.]+$/.test(host)) {
      const parts = host.split(".");
      for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join("."), `.${parts.slice(i).join(".")}`);
    }
    for (const cookie of doc.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) doc.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
    }
  }

  function enable() {
    globals[disable] = false;
    if (requested) return;
    requested = true;
    browser.gtag!("consent", "update", { ...denied, analytics_storage: "granted" });
    browser.gtag!("js", new Date());
    // One initial view for the current route; GA4's enabled history measurement
    // handles subsequent navigation. Routes visited before acceptance are not queued.
    browser.gtag!("config", ANALYTICS_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = browser.document.createElement("script");
    script.id = "tmc-google-analytics";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
    browser.document.head.appendChild(script);
    const cloudflare = browser.document.createElement("script");
    cloudflare.id = "tmc-cloudflare-analytics";
    cloudflare.async = true;
    cloudflare.src = "https://static.cloudflareinsights.com/beacon.min.js";
    cloudflare.setAttribute("data-cf-beacon", JSON.stringify({ token: "5bf9c8154a3742a2a2373cf19d016170" }));
    browser.document.head.appendChild(cloudflare);
  }

  function apply(next: AnalyticsChoice) {
    choice = next;
    if (next === "accepted") enable();
    else {
      globals[disable] = true;
      clearAnalyticsCookies();
      if (requested) {
        // A loaded Google tag can send cookieless consent pings when updated to
        // denied. Reload instead: the next document has no Google tag at all.
        browser.document.getElementById("tmc-google-analytics")?.remove();
        browser.document.getElementById("tmc-cloudflare-analytics")?.remove();
        browser.location.reload();
      } else browser.gtag!("consent", "update", { ...denied });
    }
    listeners.forEach(listener => listener());
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    globals[disable] = true;
    installCloudflareConsentGuard(browser as Window & typeof globalThis, () => choice === "accepted");
    browser.dataLayer = browser.dataLayer || [];
    browser.gtag = function () { browser.dataLayer!.push(arguments); };
    // Local queue only. No analytics resource is fetched unless accepted.
    browser.gtag("consent", "default", { ...denied });
    if (choice === "accepted") enable();
    else clearAnalyticsCookies();
    browser.addEventListener("storage", event => {
      if (event.key === ANALYTICS_CONSENT_KEY || event.key === null) {
        const next = event.key === null ? null : parseAnalyticsChoice(event.newValue);
        if (next !== choice) apply(next);
      }
    });
  }

  return {
    initialize,
    getChoice: () => choice,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    choose(next: Exclude<AnalyticsChoice, null>, reloadConfirmed = false) {
      initialize();
      if (next === "rejected" && requested && !reloadConfirmed && !browser.confirm("Reject analytics and reload? Any unfinished registration or enquiry details will be lost. Choose Cancel to keep your current choice and finish your form first.")) return false;
      try { browser.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ version: analyticsConsentPolicy.version, choice: next, savedAt: Date.now() })); } catch {
        // If saving a rejection fails (for example, quota), remove a stale grant
        // so reloading cannot silently re-enable analytics.
        if (next === "rejected") {
          try { browser.localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch { /* Storage is unavailable; current-document disable still applies. */ }
        }
      }
      if (next !== choice) apply(next);
      return true;
    },
  };
}

let controller: ReturnType<typeof createAnalyticsConsent> | undefined;
export function getAnalyticsConsent() {
  return controller ??= createAnalyticsConsent(window);
}
