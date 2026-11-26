const stagingOrigin = "https://staging.mediacollective.events";
const responseHeaders = {
  "Access-Control-Allow-Origin": stagingOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Vary": "Origin",
};

const consentVersion = "event-updates-v1";
const consentText = "I agree to receive emails about new Media Collective events and to the processing of my details for this purpose. I can withdraw consent at any time.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const engagementOptions = ["Attend", "Sponsor", "Co-host", "Receive new event notifications"];
const rehearsalUrl = "https://ioynilkvrfujnmudaped.supabase.co";

function receipt(success: boolean, outcomeUnknown = false) {
  return Response.json({ success, outcomeUnknown }, { headers: responseHeaders });
}

async function rpc(name: string, args: Record<string, unknown>, key: string) {
  const response = await fetch(rehearsalUrl + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", apikey: key,
      ...(key.startsWith("eyJ") ? { Authorization: "Bearer " + key } : {}),
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Supabase request failed");
  return await response.json();
}

async function subscribe(email: string, requestId: string) {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const portal = Deno.env.get("STAGING_HUBSPOT_PORTAL_ID");
  const form = Deno.env.get("STAGING_HUBSPOT_FORM_ID");
  const subscription = Number(Deno.env.get("STAGING_HUBSPOT_SUBSCRIPTION_ID"));
  if (!serviceKey || Deno.env.get("HUBSPOT_EVENT_UPDATES_ENABLED") !== "true" ||
    !portal || !/^\d+$/.test(portal) || portal === "139602049" ||
    !form || !/^[0-9a-f-]{36}$/i.test(form) ||
    !Number.isSafeInteger(subscription) || subscription < 1) return receipt(false);

  const result = await rpc("portal_begin_event_update_consent", {
    p_request_id: requestId, p_email: email, p_version: consentVersion,
  }, serviceKey);
  if (result !== "started") return result === "accepted" ? receipt(true) : receipt(false, true);

  let status: number | null = null;
  try {
    const provider = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        fields: [{ objectTypeId: "0-1", name: "email", value: email }],
        legalConsentOptions: { consent: {
          consentToProcess: true,
          text: consentText,
          communications: [{ value: true, subscriptionTypeId: subscription, text: consentText }],
        } },
      }),
    });
    status = provider.status;
  } catch {
    // A timeout may occur after acceptance. Keep the recorded consent for review.
  }

  const recorded = await rpc("portal_finish_event_update_consent", {
    p_request_id: requestId, p_provider_status: status,
  }, serviceKey);
  return status === 200 && recorded === true ? receipt(true) : receipt(false, true);
}

function singleLine(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max &&
    value.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(value);
}

Deno.serve(async (request) => {
  if (request.headers.get("origin") !== stagingOrigin) return new Response(null, { status: 403 });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST" || Deno.env.get("SUPABASE_URL") !== rehearsalUrl) return receipt(false);

  let data;
  try {
    const body = await request.text();
    if (body.length > 20000) return receipt(false);
    data = JSON.parse(body);
  } catch {
    return receipt(false);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) return receipt(false);
  const token = data["g-recaptcha-response"];
  if (!singleLine(token, 4096) || !singleLine(data.emailAddress, 255) || !emailPattern.test(data.emailAddress.trim()) ||
    !singleLine(data.fullName, 100)) return receipt(false);

  const contact = data.formType === "contact";
  const updates = data.formType === "event-updates";
  let invitation = false;
  if (contact) {
    if (typeof data.message !== "string" || !data.message.trim() || data.message.length > 5000 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data.message)) return receipt(false);
  } else {
    if (!singleLine(data.companyName, 100) || !singleLine(data.event, 1000) ||
      !singleLine(data.howEngage, 500) || data.consent !== "Y") return receipt(false);
    const choices = data.howEngage.split(", ");
    if (updates) {
      if (data.consentVersion !== consentVersion || typeof data.requestId !== "string" ||
        !requestIdPattern.test(data.requestId) || data.howEngage !== "Receive new event notifications") return receipt(false);
    } else {
      if (data.formType !== undefined || choices.some((choice: string) => !engagementOptions.includes(choice)) ||
        new Set(choices).size !== choices.length) return receipt(false);
      invitation = choices.includes("Attend");
    }
  }

  const secret = Deno.env.get("WEBSITE_ENQUIRY_RECAPTCHA_SECRET");
  const key = Deno.env.get("WEBSITE_INVITATION_WRITE_KEY");
  const publishableKey = Deno.env.get("WEBSITE_INVITATION_PUBLISHABLE_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || (invitation && (!key || !publishableKey)) || (!invitation && !serviceKey)) return receipt(false);

  try {
    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!verification.ok) return receipt(false);
    const captcha = await verification.json();
    if (captcha.success !== true || captcha.hostname !== new URL(stagingOrigin).hostname) return receipt(false);
  } catch {
    return receipt(false);
  }

  try {
    const email = data.emailAddress.trim().toLowerCase();
    if (updates) return await subscribe(email, data.requestId);
    if (!invitation) {
      const saved = await rpc("portal_record_staging_website_enquiry", {
        p_kind: contact ? "contact" : "commercial", p_name: data.fullName.trim(), p_email: email,
        p_message: contact ? data.message.trim() : null,
        p_company: contact ? null : data.companyName.trim(),
        p_event: contact ? null : data.event.trim(),
        p_engagement: contact ? null : data.howEngage,
      }, serviceKey!);
      return saved === true ? receipt(true) : receipt(false, true);
    }
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const sourceRef = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const saved = await rpc("portal_record_website_invitation", {
      p_key: key, p_source_ref: sourceRef, p_name: data.fullName.trim(),
      p_company: data.companyName.trim(), p_email: email, p_event: data.event.trim(), p_engagement: data.howEngage,
    }, publishableKey!);
    return saved === true ? receipt(true) : receipt(false, true);
  } catch {
    return receipt(false, true);
  }
});
