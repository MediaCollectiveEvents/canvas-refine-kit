import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { EnquiryDeliveryError, sendEnquiry } from "../src/lib/enquiryTransport";

const require = createRequire(import.meta.url);
const deferred = () => {
  let resolve!: (value?: any) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<any>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

// Run the real component handlers with controlled CAPTCHA/transport promises.
// No DOM library, credentials, third-party requests or real submissions are used.
function mount(kind: "registration" | "contact") {
  const token = deferred(), delivery = deferred();
  const slots: any[] = [];
  let cursor = 0, captchaCalls = 0, sends = 0, resets = 0;
  const timers = new Map<number, () => void>();
  const values: any = kind === "registration"
    ? { fullName: "Audit", companyName: "Test", email: "audit@example.com", interestedEvents: ["event-4"], engagementTypes: ["attend"], gdprConsent: true }
    : { fullName: "Audit", email: "audit@example.com", message: "Test enquiry" };
  const originalValues = structuredClone(values);
  const Dummy = () => null;
  const form = { trigger: async () => true, getValues: () => values, handleSubmit: (handler: any) => () => handler(values), reset: () => { resets++; }, setValue() {}, control: {} };
  const send = async () => { sends++; await delivery.promise; };
  const verification = { ready: true, siteKey: "test-only-not-sent", attempt: 0, failed() { this.ready = false; }, loaded() {}, retry() {} };
  const mocks: Record<string, any> = {
    react: {
      useState(initial: any) { const index = cursor++; if (!(index in slots)) slots[index] = kind === "registration" && initial === 1 ? 4 : initial; return [slots[index], (value: any) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }]; },
      useRef(initial: any) { const index = cursor++; return slots[index] ??= { current: initial }; },
      useMemo(compute: any) { return compute(); }, useEffect() {},
    },
    "react-hook-form": { useForm: () => form },
    "@hookform/resolvers/zod": { zodResolver: () => undefined },
    "react-google-recaptcha": { default: Dummy, __esModule: true },
    "framer-motion": { motion: { div: Dummy }, AnimatePresence: Dummy, useReducedMotion: () => true },
    "@/hooks/useEnquiryVerification": { default: () => verification, __esModule: true },
    "@/lib/enquiryTransport": { sendEnquiry: send, EnquiryDeliveryError },
    "@/lib/contact": { contactSchema: {}, sendContact: send },
    "@/hooks/use-toast": { toast() {} },
    "@/lib/events": { getRegistrationOptions: () => [{ id: "event-4", label: "OFF AIR" }] },
    "@/lib/attendance": { getAttendanceOptions: () => [{ id: "event-4", label: "OFF AIR" }], getAttendanceSelection: () => "event-4", getAttendanceStages: () => [1, 4] },
    "@/content/partners.json": { default: { hero: { primaryCta: { url: "https://calendly.com/mediacollective/call-with-chris" } } } },
  };
  const source = readFileSync(new URL(kind === "registration" ? "../src/components/EventRegistrationForm.tsx" : "../src/components/ContactForm.tsx", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  new Function("require", "exports", "setTimeout", "clearTimeout", "console", js)(
    (name: string) => mocks[name] ?? (name.startsWith("@/components/") || name === "lucide-react" ? new Proxy({}, { get: () => Dummy }) : require(name)), exports,
    (callback: () => void, ms: number) => { timers.set(ms, callback); return ms; }, (id: number) => timers.delete(id), { error() {} },
  );
  let tree: any;
  const nodes = (node: any): any[] => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)];
  const text = (node: any): string => node == null || typeof node === "boolean" ? "" : typeof node !== "object" ? String(node) : Array.isArray(node) ? node.map(text).join(" ") : text(node.props?.children);
  const render = () => {
    cursor = 0;
    tree = exports.default({ open: true, onOpenChange() {}, attendanceOnly: true });
    for (const node of nodes(tree)) if (node.type === Dummy && node.ref) node.ref.current = { executeAsync: () => { captchaCalls++; return token.promise; }, reset() {} };
    return tree;
  };
  const submit = () => nodes(render()).find(node => node.type === "form").props.onSubmit({ preventDefault() {} });
  const button = () => nodes(render()).find(node => node.props?.type === "submit");
  const status = () => nodes(render()).filter(node => node.props?.role === "status").map(text).join(" ");
  const closeSuccess = () => nodes(render()).find(node => node.props?.children === "Close").props.onClick();
  return { render, submit, button, status, closeSuccess, text: () => text(render()), token, delivery, timers, values, originalValues, counts: () => ({ captchaCalls, sends, resets }) };
}

for (const kind of ["registration", "contact"] as const) {
  test(`${kind}: verification → sending → acknowledged success; duplicate submits blocked in both waiting phases`, async () => {
    const h = mount(kind);
    const first = h.submit();
    await h.submit(); await flush();
    assert.equal(h.counts().captchaCalls, 1);
    assert.equal(h.counts().sends, 0);
    assert.equal(h.button().props.children, "Verifying…");
    assert.equal(h.button().props.disabled, true);
    assert.match(h.status(), /If reCAPTCHA asks you to complete a challenge/);
    h.token.resolve("test-token"); await flush();
    assert.equal(h.counts().sends, 1);
    assert.equal(h.button().props.children, "Sending…");
    assert.equal(h.button().props.disabled, true);
    assert.match(h.status(), /Please wait for confirmation/);
    assert.doesNotMatch(h.text(), /Your (?:request|enquiry) has been received/);
    await h.submit(); assert.equal(h.counts().sends, 1);
    h.delivery.resolve(); await first; await flush();
    assert.match(h.text(), kind === "registration" ? /Request sent/ : /Enquiry sent/);
    assert.match(h.text(), /has been received/);
    assert.equal(h.counts().resets, 0, "values reset only when the success screen is closed");
    h.closeSuccess();
    assert.equal(h.counts().resets, 1);
  });

  test(`${kind}: verification timeout stops waiting, keeps values and never submits`, async () => {
    const h = mount(kind); const pending = h.submit(); await flush();
    assert.ok(h.timers.has(60000), "existing verification timeout stays 60 seconds");
    h.timers.get(60000)!(); await pending; await flush();
    assert.equal(h.counts().sends, 0);
    assert.equal(h.button().props.disabled, true, "verification must be retried before another submit");
    assert.match(h.text(), /Verification could not be completed/);
    assert.doesNotMatch(h.status(), /Sending|Verifying/);
    assert.deepEqual(h.values, h.originalValues);
  });

  test(`${kind}: uncertain receipt ends sending without false success, reset or automatic retry`, async () => {
    const h = mount(kind); const pending = h.submit(); await flush();
    h.token.resolve("test-token"); await flush();
    h.delivery.reject(new EnquiryDeliveryError(false)); await pending; await flush();
    assert.match(h.text(), /We could not confirm receipt/);
    assert.match(h.text(), /before sending the same request again/);
    assert.match(h.text(), /Arrange a call/);
    assert.doesNotMatch(h.text(), /has been received/);
    assert.equal(h.button().props.disabled, false);
    assert.deepEqual(h.values, h.originalValues);
    assert.deepEqual(h.counts(), { captchaCalls: 1, sends: 1, resets: 0 });
  });
}


test("transport timeout keeps the existing 30-second limit and reports uncertain receipt", async () => {
  const originalFetch = globalThis.fetch, originalTimeout = AbortSignal.timeout;
  const controller = new AbortController();
  AbortSignal.timeout = ms => { assert.equal(ms, 30000); return controller.signal; };
  globalThis.fetch = async (_url, options) => new Promise((_resolve, reject) => {
    options!.signal!.addEventListener("abort", () => reject(new DOMException("Timed out", "TimeoutError")), { once: true });
  });
  try {
    const pending = sendEnquiry({ audit: "local test only" });
    controller.abort();
    await assert.rejects(pending, (error: unknown) => error instanceof EnquiryDeliveryError && !error.confirmedRejection && /could not confirm receipt/.test(error.message));
  } finally {
    globalThis.fetch = originalFetch;
    AbortSignal.timeout = originalTimeout;
  }
});
