const productionProject = "https://qtmbioguefmtwtngbava.supabase.co";
const siteOrigin = "https://www.mediacollective.events";
const headers = {
  "Access-Control-Allow-Origin": siteOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function receipt(success: boolean, outcomeUnknown = false) {
  return Response.json({ success, outcomeUnknown }, { headers });
}

function singleLine(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max &&
    value.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(value);
}

Deno.serve(async (request) => {
  if (Deno.env.get("SUPABASE_URL") !== productionProject || request.headers.get("origin") !== siteOrigin) {
    return new Response(null, { status: 403 });
  }
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return receipt(false);

  const captchaSecret = Deno.env.get("WEBSITE_ENQUIRY_RECAPTCHA_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("PARTNERSHIP_RESEND_API_KEY");
  const sender = Deno.env.get("PARTNERSHIP_ACKNOWLEDGEMENT_FROM");
  if (!captchaSecret || !serviceKey || !resendKey || !sender) return receipt(false);

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
  if (!singleLine(token, 4096) || !singleLine(data.fullName, 100) ||
    !singleLine(data.companyName, 100) || !singleLine(data.emailAddress, 255) ||
    !emailPattern.test(data.emailAddress.trim()) || !singleLine(data.event, 1000) ||
    !singleLine(data.howEngage, 30) || data.consent !== "Y") return receipt(false);
  const choices = data.howEngage.split(", ");
  if (new Set(choices).size !== choices.length || choices.some(choice => choice !== "Sponsor" && choice !== "Co-host")) {
    return receipt(false);
  }

  try {
    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: captchaSecret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!verification.ok) return receipt(false);
    const result = await verification.json();
    if (result.success !== true || result.hostname !== new URL(siteOrigin).hostname) return receipt(false);
  } catch {
    return receipt(false);
  }

  const email = data.emailAddress.trim().toLowerCase();
  let enquiryId: string;
  try {
    const response = await fetch(productionProject + "/rest/v1/rpc/portal_record_partnership_enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        ...(serviceKey.startsWith("eyJ") ? { Authorization: "Bearer " + serviceKey } : {}),
      },
      body: JSON.stringify({
        p_name: data.fullName.trim(), p_company: data.companyName.trim(), p_email: email,
        p_event: data.event.trim(), p_engagement: choices.sort().join(", "),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return receipt(false, true);
    enquiryId = await response.json();
    if (typeof enquiryId !== "string" || !uuidPattern.test(enquiryId)) return receipt(false, true);
  } catch {
    return receipt(false, true);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendKey,
        "Content-Type": "application/json",
        "Idempotency-Key": "partnership-enquiry-" + enquiryId,
      },
      body: JSON.stringify({
        from: sender,
        to: [email],
        subject: "We received your partnership enquiry",
        text: "Thank you for your interest in partnering with The Media Collective. We’ve received your enquiry and will review it before following up.",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("Partnership acknowledgement rejected", { status: response.status });
  } catch {
    console.error("Partnership acknowledgement delivery could not be confirmed");
  }

  return receipt(true);
});
