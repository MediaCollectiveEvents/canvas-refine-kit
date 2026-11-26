import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../../supabase/functions/offair-owner-update/index.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
let handle;
globalThis.Deno = {
  env: { get: key => ({ SUPABASE_URL: 'https://qtmbioguefmtwtngbava.supabase.co', RESEND_API_KEY: 'synthetic-key' })[key] },
  serve: callback => { handle = callback; },
};
await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

let isOwner = true;
const outgoing = [];
globalThis.fetch = async (url, options) => {
  if (url.endsWith('/portal_owner_sponsors')) return isOwner
    ? Response.json([
      { email: 'one@example.invalid', active: true, confirmed: true },
      { email: 'two@example.invalid', active: true, confirmed: true },
      { email: 'expired@example.invalid', active: false, confirmed: true },
    ])
    : new Response(null, { status: 403 });
  if (url.endsWith('/auth/v1/user')) return Response.json({ email: 'owner@example.invalid', email_confirmed_at: '2026-11-26' });
  assert.equal(url, 'https://api.resend.com/emails/batch');
  outgoing.push({ emails: JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
  return Response.json({ data: outgoing.at(-1).emails.map(() => ({ id: 'test-message' })) });
};
const payload = { subject: 'OFF AIR update', message: 'Test content', requestId: 'aabbccdd-0001-4000-8000-aabbccdd0001' };
function submit(action, recipients, token = 'Bearer fake-owner-token') {
  return handle(new Request('https://edge.example.invalid', {
    method: 'POST', headers: { Authorization: token }, body: JSON.stringify({ ...payload, action, recipients }),
  }));
}
assert.equal((await submit('test', [], '')).status, 401);
isOwner = false;
assert.equal((await submit('test', [])).status, 403);
isOwner = true;
assert.equal((await submit('test', ['one@example.invalid'])).status, 400);
assert.equal((await submit('send', ['one@example.invalid', 'expired@example.invalid'])).status, 409);
assert.equal(outgoing.length, 0);
assert.deepEqual(await (await submit('test', [])).json(), { accepted: 1 });
assert.deepEqual(outgoing[0].emails.map(email => email.to), [['owner@example.invalid']]);
assert.equal(outgoing[0].emails[0].subject, '[Test] OFF AIR update');
assert.deepEqual(await (await submit('send', ['two@example.invalid', 'one@example.invalid', 'one@example.invalid'])).json(), { accepted: 2 });
assert.deepEqual(outgoing[1].emails.map(email => email.to), [['one@example.invalid'], ['two@example.invalid']]);
await submit('send', ['one@example.invalid', 'two@example.invalid']);
assert.equal(outgoing[1].key, outgoing[2].key);
console.log('Owner email test isolation, recipient access validation, private delivery and retry key verified with mocked services.');
