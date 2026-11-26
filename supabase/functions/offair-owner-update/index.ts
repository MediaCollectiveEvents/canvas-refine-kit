const production = 'https://qtmbioguefmtwtngbava.supabase.co';
const publicKey = 'sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz';
const origins = new Set(['https://www.mediacollective.events', 'https://mediacollective.events']);
const emailPattern = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function eligibleEmails(rows: unknown): Set<string> {
  if (!Array.isArray(rows)) throw new Error('invalid_access_list');
  return new Set(rows.filter(row => row?.active === true && row.confirmed === true && !row.deletedAt)
    .map(row => String(row.email ?? '').trim().toLowerCase())
    .filter(email => email.length <= 254 && emailPattern.test(email)));
}

export function parseUpdate(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const { action, subject, message, recipients, requestId } = value as Record<string, unknown>;
  if ((action !== 'test' && action !== 'send') ||
      typeof subject !== 'string' || !subject.trim() || subject.length > 160 || /[\r\n]/.test(subject) ||
      typeof message !== 'string' || !message.trim() || message.length > 10000 ||
      typeof requestId !== 'string' || !uuidPattern.test(requestId) ||
      !Array.isArray(recipients) || recipients.length > 100 ||
      recipients.some(value => typeof value !== 'string' || value.length > 254 || !emailPattern.test(value)) ||
      (action === 'test' ? recipients.length !== 0 : recipients.length === 0)) return null;
  return { action, subject: subject.trim(), message, requestId, recipients: [...new Set<string>(recipients.map(email => email.toLowerCase()))].sort() };
}

if (typeof Deno !== 'undefined') Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin') ?? '';
  const headers = {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
    ...(origins.has(origin) ? {
      'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    } : {}),
  };
  const reply = (status: number, value: object) => new Response(JSON.stringify(value), { status, headers });
  if (origin && !origins.has(origin)) return reply(403, { error: 'origin_denied' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (Deno.env.get('SUPABASE_URL') !== production) return reply(503, { error: 'delivery_unavailable' });
  const bearer = request.headers.get('Authorization') ?? '';
  if (!/^Bearer \S+$/.test(bearer)) return reply(401, { error: 'owner_access_required' });

  try {
    const raw = await request.text();
    const input = raw.length <= 40000 ? parseUpdate(JSON.parse(raw)) : null;
    if (!input) return reply(400, { error: 'invalid_message' });
    const authHeaders = { apikey: publicKey, Authorization: bearer, 'Content-Type': 'application/json' };
    const access = await fetch(`${production}/rest/v1/rpc/portal_owner_sponsors`, {
      method: 'POST', headers: authHeaders, body: '{}', signal: AbortSignal.timeout(10000),
    });
    if (!access.ok) return reply(access.status === 401 || access.status === 403 ? 403 : 503, { error: 'owner_access_required' });

    let recipients = input.recipients;
    if (input.action === 'test') {
      const response = await fetch(`${production}/auth/v1/user`, { headers: authHeaders, signal: AbortSignal.timeout(10000) });
      if (!response.ok) return reply(403, { error: 'owner_access_required' });
      const user = await response.json();
      if (!user.email_confirmed_at || typeof user.email !== 'string' || !emailPattern.test(user.email)) {
        return reply(422, { error: 'owner_email_unavailable' });
      }
      recipients = [user.email];
    } else {
      const eligible = eligibleEmails(await access.json());
      if (recipients.some(email => !eligible.has(email))) return reply(409, { error: 'recipient_access_changed' });
    }

    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) return reply(503, { error: 'delivery_unavailable' });
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `offair-update-${input.action}-${input.requestId}` },
      body: JSON.stringify(recipients.map(email => ({
        from: 'The Media Collective <chris@mediacollective.events>', to: [email],
        subject: input.action === 'test' ? `[Test] ${input.subject}` : input.subject, text: input.message,
      }))),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return reply(502, { error: 'delivery_rejected' });
    const result = await response.json();
    if (!Array.isArray(result.data) || result.data.length !== recipients.length) return reply(502, { error: 'delivery_unconfirmed' });
    return reply(200, { accepted: recipients.length });
  } catch {
    return reply(503, { error: 'delivery_unconfirmed' });
  }
});
