import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = process.argv[2];
if (!base) throw new Error('Pass the deployed site origin.');
const entries = [
  ['/', 'seo-pages/home.html'], ['/events/', 'seo-pages/events.html'],
  ['/admin/', 'admin/index.html'], ['/admin/config.yml', 'admin/config.yml'],
  ['/admin/cms.bundle.js', 'admin/cms.bundle.js'], ['/eventhub/', 'eventhub/index.html'],
  ['/eventhub/owner/', 'eventhub/owner/index.html'],
  ['/eventhub/mpts-reception-2027', 'eventhub/index.html'],
];
if (new URL(base).hostname === 'staging.mediacollective.events') entries.push(['/insights/', 'index.html'], ['/insights/off-air-2026-beyond-broadcast', 'index.html'], ['/insights/design-comparison', 'index.html']);
await Promise.all(entries.map(async ([route, file]) => {
  const url = new URL(route, base);
  url.searchParams.set('verify-release', Date.now().toString());
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert.ok(response.ok, `${route} returned ${response.status}`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(`dist/${file}`), `${route} is not serving this release`);
}));
console.log('Verified the public site, CMS and Event Hub against the uploaded release.');
