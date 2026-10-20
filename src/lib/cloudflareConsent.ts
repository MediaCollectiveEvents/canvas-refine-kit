// Cloudflare has no documented runtime teardown. Prevent its final unload beacon
// after withdrawal; never intercept unrelated form, font or verification traffic.
export function installCloudflareConsentGuard(browser: Window & typeof globalThis, allowed: () => boolean) {
  const isBeacon = (value: string | URL) => {
    try {
      const url = new URL(String(value), browser.location.href);
      return url.pathname === "/cdn-cgi/rum" && (url.hostname === "cloudflareinsights.com" || url.origin === browser.location.origin);
    } catch { return false; }
  };
  const navigator = browser.navigator;
  if (navigator.sendBeacon) {
    const send = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => !allowed() && isBeacon(url) ? false : send(url, data);
  }
  if (browser.fetch) {
    const fetch = browser.fetch.bind(browser);
    browser.fetch = (input, init) => {
      const url = typeof input === "object" && "url" in input ? input.url : input as string | URL;
      return !allowed() && isBeacon(url) ? Promise.reject(new DOMException("Analytics consent denied", "AbortError")) : fetch(input, init);
    };
  }
  const requests = new WeakMap<XMLHttpRequest, boolean>();
  const prototype = browser.XMLHttpRequest.prototype;
  const open = prototype.open, send = prototype.send;
  prototype.open = function (method, url, async = true, username?, password?) {
    requests.set(this, isBeacon(url));
    return open.call(this, method, url, async, username, password);
  };
  prototype.send = function (body) {
    if (!allowed() && requests.get(this)) return;
    return send.call(this, body);
  };
}
