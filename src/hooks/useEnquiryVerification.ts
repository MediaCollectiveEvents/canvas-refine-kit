import { useEffect, useState } from "react";
import { getEnquirySiteKey } from "@/lib/enquiryVerification";

export default function useEnquiryVerification(active: boolean) {
  const siteKey = getEnquirySiteKey(import.meta.env.DEV, import.meta.env.VITE_RECAPTCHA_SITE_KEY);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!active) {
      // Closing the dialog or leaving the verification step unmounts the widget.
      // The next widget must start its own loading and recovery lifecycle.
      setStatus("loading");
      return;
    }
    if (!siteKey || status !== "loading") return;
    const timeout = setTimeout(() => setStatus("failed"), 15000);
    return () => clearTimeout(timeout);
  }, [active, siteKey, status, attempt]);
  return {
    siteKey, attempt, ready: active && !!siteKey && status === "ready",
    failed: () => setStatus("failed"), loaded: () => setStatus("ready"),
    retry: () => { setStatus("loading"); setAttempt(value => value + 1); },
    message: !siteKey
      ? "Verification is not configured for this local preview. An approved development site key is needed. Your entries are kept."
      : status === "failed"
        ? "Verification is unavailable. Check your connection, then try verification again. Your entries are kept."
        : "Loading verification…",
    canRetry: active && !!siteKey && status === "failed",
  };
}
