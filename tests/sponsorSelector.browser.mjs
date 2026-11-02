// Exercises the real vendored Decap relation parser and generated CMS widget.
// No authentication, backend writes or real content changes are performed.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');

test('built CMS loads and its sponsor widget feeds stable IDs to the real Decap relation control', async () => {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0, hmr: false } });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const page = await browser.newPage();
    // Keep the smoke test independent of external GitHub availability.
    await page.route('https://api.github.com/**', route => route.fulfill({ status: 401, body: '{"message":"Requires authentication"}', contentType: 'application/json' }));
    const address = server.httpServer.address();
    await page.goto(`http://127.0.0.1:${address.port}/admin/index.html`);
    await page.waitForFunction(() => !!window.CMS?.getWidget('organisation-relation'));
    await page.getByRole('button', { name: /Login with GitHub/i }).waitFor();
    await page.waitForFunction(() => !!window.CMS?.getWidget('organisation-relation'));
    const result = await page.evaluate(async () => {
      const source = { logos: [
        ...Array.from({ length: 30 }, (_, i) => ({ name: `Legacy ${i}`, src: `/uploads/${i}.png` })),
        { id: 'waldo', name: 'Waldo', src: '/uploads/waldo.png' },
        { id: 'nameless', src: '/uploads/nameless.png' },
      ] };
      const fields = { name: 'sponsorIds', collection: 'sponsors', file: 'sponsors', value_field: 'logos.*.id', multiple: true,
        display_fields: { toJS: () => ['logos.*.name'] } };
      let selected, metadata, args;
      const Control = window.CMS.getWidget('organisation-relation').control;
      const instance = new Control({ field: { get: key => fields[key] }, value: [], queryHits: [],
        query: async (...queryArgs) => {
          args = queryArgs;
          const limit = queryArgs[5];
          return { payload: { hits: [{ data: { logos: limit > 0 ? source.logos.slice(0, limit) : source.logos } }] } };
        },
        onChange: (value, meta) => { selected = value.toJS(); metadata = meta; },
      });
      const picker = instance.render().props.children[0];
      const response = await picker.props.query('events.0.sponsorIds', 'sponsors', ['logos.*.name', 'logos.*.id'], '', 'sponsors', 20);
      const Native = window.CMS.getWidget('relation').control;
      const native = new Native(picker.props);
      const options = native.parseHitOptions(response.payload.hits);
      native.handleChange(options);
      return { ids: options.map(option => option.value), labels: options.map(option => option.label), selected,
        metadataIds: metadata.sponsorIds.sponsors.waldo.logos.map(row => row.id), limit: args[5] };
    });
    assert.deepEqual(result, { ids: ['waldo'], labels: ['Waldo'], selected: ['waldo'], metadataIds: ['waldo'], limit: 0 });
  } finally {
    await browser?.close();
    await server.close();
  }
});
