import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = 'dist';
const entry = readFileSync(`${root}/index.html`, 'utf8');
if (!entry.includes('src="/assets/')) throw new Error('Event Hub requires an absolute Vite asset entry.');
const hub = `${root}/eventhub`;
mkdirSync(`${hub}/owner`, { recursive: true });
for (const route of ['', '/owner']) writeFileSync(`${hub}${route}/index.html`, entry);
const hubRules = readFileSync('public/eventhub/.htaccess', 'utf8');
writeFileSync(`${hub}/.htaccess`, process.env.DEPLOY_TARGET === 'staging'
  ? hubRules.replaceAll('https://qtmbioguefmtwtngbava.supabase.co', 'https://ioynilkvrfujnmudaped.supabase.co')
  : hubRules);

if (process.env.DEPLOY_TARGET !== 'staging') {
  cpSync('src/owner-offline', `${hub}/owner-offline`, { recursive: true });
  for (const size of [192, 512]) cpSync(`src/assets/owner-app/icon-${size}.png`, `${hub}/owner-icon-${size}.png`);
  writeFileSync(`${hub}/owner.webmanifest`, JSON.stringify({
    id: '/eventhub/owner', name: 'Media Collective Owner', short_name: 'MC Owner',
    start_url: '/eventhub/owner-offline/index.html', scope: '/eventhub/', display: 'standalone',
    background_color: '#0a1b23', theme_color: '#0a1b23',
    icons: [192, 512].map(size => ({ src: `owner-icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
  }));
}

const digest = file => createHash('sha256').update(readFileSync(`${root}/${file}`)).digest('hex').slice(0, 16);
const admin = `${root}/admin/index.html`;
let html = readFileSync(admin, 'utf8');
html = html.replace('src="/admin/cms.bundle.js"', `src="/admin/cms.bundle.js?v=${digest('admin/cms.bundle.js')}"`);
html = html.replace('</head>', `<link rel="cms-config-url" type="text/yaml" href="/admin/config.yml?v=${digest('admin/config.yml')}" />\n  </head>`);
writeFileSync(admin, html);
