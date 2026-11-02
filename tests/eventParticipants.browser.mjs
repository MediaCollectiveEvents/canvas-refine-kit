// Optional interactive regression: PLAYWRIGHT_MODULE may point to an installed runtime.
// Run from the repository root: node --test tests/eventParticipants.browser.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');

test('CMS event selector resets route context and preserves editorial panel order', async () => {
  const root = process.cwd();
  const temporary = await mkdtemp(path.join(tmpdir(), 'event-participant-preview-'));
  const fixture = path.join(temporary, 'preview.tsx');
  await writeFile(fixture, `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import EventsPreview from '@/cms/previews/EventsPreview';
    const sponsor = { id: 'waldo', name: 'Waldo', src: '/uploads/waldo.png', website: 'https://www.waldo.consulting' };
    const fieldsMetaData = { toJS: () => ({ events: { 0: { sponsorIds: { sponsors: { waldo: { logos: [sponsor] } } } } } }) };
    const draft = { events: [
      { id: 99, title: 'Draft Event A', date: '2099-01-01', sponsorIds: ['waldo'], panels: [{title:'First panel'}, {title:'Second panel'}] },
      { id: 100, title: 'Draft Event B', date: '2099-01-02', panels: [{title:'Another panel'}] }
    ] };
    const entry = { getIn: () => ({ toJS: () => draft }) };
    createRoot(document.querySelector('#root')).render(<EventsPreview entry={entry} fieldsMetaData={fieldsMetaData} />);
  `);
  const server = await createServer({
    resolve: { dedupe: ['react', 'react-dom'] },
    server: { host: '127.0.0.1', port: 0, fs: { allow: [root, temporary] } },
    plugins: [{ name: 'participant-preview-test', configureServer(server) {
      server.middlewares.use('/__participant_review', async (_request, response, next) => {
        try {
          response.setHeader('Content-Type', 'text/html');
          response.end(await server.transformIndexHtml('/__participant_review/index.html',
            `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/@fs${fixture}"></script></body></html>`));
        } catch (error) { next(error); }
      });
    } }],
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const address = server.httpServer.address();
    assert(address && typeof address !== 'string');
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        await page.goto(`http://127.0.0.1:${address.port}/__participant_review`);
        const selector = page.getByRole('combobox', { name: 'Event preview' });
        const footerCTA = page.getByRole('heading', { name: 'Want to attend our next event?', exact: true });
        await selector.waitFor();
        assert.equal(await footerCTA.count(), 1);
        await selector.selectOption('99');
        await page.getByRole('heading', { name: 'Draft Event A', exact: true }).waitFor();
        assert.equal(await footerCTA.count(), 0, 'event detail must not keep the listing footer CTA');
        await page.getByRole('heading', { name: 'Sponsors', exact: true }).waitFor();
        assert.equal(await page.getByRole('link', { name: 'Waldo (opens in a new tab)', exact: true }).getAttribute('href'), 'https://www.waldo.consulting');
        assert.doesNotMatch(await page.locator('body').innerText(), /unresolved sponsor waldo/, 'staging-only sponsor must resolve in the draft preview');
        assert.deepEqual(await page.locator('main h3').allTextContents(), ['First panel', 'Second panel']);
        await selector.selectOption('100');
        await page.getByRole('heading', { name: 'Draft Event B', exact: true }).waitFor();
        assert.equal(await footerCTA.count(), 0);
        await selector.selectOption('listing');
        await page.getByRole('heading', { name: 'Panels', exact: true }).waitFor({ state: 'hidden' });
        assert.equal(await footerCTA.count(), 1, 'returning to the listing must restore its route context');
      } finally { await page.close(); }
    }
  } finally {
    await browser?.close();
    await server.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
