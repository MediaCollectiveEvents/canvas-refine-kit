import { useEffect, useId, useRef, useState } from "react";
import { getAnalyticsConsent, type AnalyticsChoice } from "@/lib/analyticsConsent";
import { analyticsConsentPolicy } from "@/lib/analyticsConsentPolicy";

const OPEN_COOKIE_SETTINGS = "tmc:open-cookie-settings";

export function CookieSettingsButton({ className }: { className?: string }) {
  return <button type="button" className={className} aria-controls="analytics-cookie-preferences"
    onClick={event => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS, { detail: event.currentTarget }))}>
    Cookie settings
  </button>;
}

export default function CookieConsent() {
  const [controller] = useState(() => typeof window === "undefined" ? null : getAnalyticsConsent());
  const [choice, setChoice] = useState<AnalyticsChoice>(() => controller?.getChoice() ?? null);
  const [editing, setEditing] = useState(false);
  const [confirmWithdrawal, setConfirmWithdrawal] = useState(false);
  const keepChoice = useRef<HTMLButtonElement>(null);
  const settings = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const title = useId();
  const description = useId();
  const visible = choice === null || editing;
  const preferenceDuration = analyticsConsentPolicy.maxAgeMs === null
    ? "until you change it or clear browser storage"
    : `for ${analyticsConsentPolicy.maxAgeMs / (24 * 60 * 60 * 1000)} days`;

  useEffect(() => {
    if (!controller) return;
    const unsubscribe = controller.subscribe(() => setChoice(controller.getChoice()));
    controller.initialize();
    setChoice(controller.getChoice());
    const openSettings = (event: Event) => {
      settings.current = (event as CustomEvent<HTMLButtonElement>).detail;
      setEditing(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, openSettings);
    return () => {
      unsubscribe();
      window.removeEventListener(OPEN_COOKIE_SETTINGS, openSettings);
    };
  }, [controller]);

  useEffect(() => { if (editing) heading.current?.focus(); }, [editing]);
  useEffect(() => { if (confirmWithdrawal) keepChoice.current?.focus(); }, [confirmWithdrawal]);
  const close = () => {
    setConfirmWithdrawal(false);
    setEditing(false);
    requestAnimationFrame(() => settings.current?.focus({ preventScroll: true }));
  };
  const choose = (next: Exclude<AnalyticsChoice, null>) => {
    if (next === "rejected" && choice === "accepted") {
      setConfirmWithdrawal(true);
      return;
    }
    if (controller?.choose(next) === false) return;
    close();
  };
  const button = "min-h-11 rounded-full border border-[#35C5BB] px-5 py-2 text-base font-medium text-[#9BF8ED] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35C5BB]";

  return <>
    {visible && <section id="analytics-cookie-preferences" role="region" aria-labelledby={title} aria-describedby={description}
      onKeyDown={event => { if (event.key === "Escape" && choice !== null) { event.preventDefault(); close(); } }}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[85dvh] overflow-y-auto border-t border-white/20 bg-[#08111f] px-6 py-5 text-[#f7f3eb] shadow-lg">
      <div className="site-container flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[65ch]">
          <h2 ref={heading} tabIndex={-1} id={title} className="font-display text-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#35C5BB]">Analytics preferences</h2>
          <p id={description} className="mt-2 text-base leading-relaxed">With your permission, we use Google Analytics and Cloudflare Web Analytics to understand site usage and performance. Neither loads until you accept. Google Analytics uses cookies. We save your choice in this browser {preferenceDuration}. Google Fonts and form verification are separate from this analytics choice. You can change your choice using Cookie settings at any time. <a href="/privacy-policy#cookies" className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#35C5BB]">Privacy Policy</a></p>
          {choice !== null && <p className="mt-2 text-base leading-relaxed">Current choice: analytics {choice === "accepted" ? "accepted" : "rejected"}.{choice === "accepted" ? " Withdrawing analytics here or in another tab reloads this page to unload both services. Finish any forms first. Rejecting here asks you to confirm before reloading." : ""}</p>}
          {confirmWithdrawal && <div role="alert" className="mt-4 space-y-3">
            <p className="text-base leading-relaxed">Reject analytics and reload? Unfinished registration or enquiry details will be lost. Keep your current choice to finish your form first.</p>
            <div className="flex flex-wrap gap-3">
              <button ref={keepChoice} type="button" className={button} onClick={() => { setConfirmWithdrawal(false); heading.current?.focus(); }}>Keep current choice</button>
              <button type="button" className={button} onClick={() => { if (controller?.choose("rejected", true) !== false) close(); }}>Reject and reload</button>
            </div>
          </div>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button type="button" className={button} onClick={() => choose("accepted")}>Accept analytics</button>
          <button type="button" className={button} onClick={() => choose("rejected")}>Reject analytics</button>
          {choice !== null && <button type="button" className={button} onClick={close}>Close</button>}
        </div>
      </div>
    </section>}
  </>;
}
