const CACHE='mc-owner-offline-shell-v1';
const FILES=['./index.html','./view.js','./store.js','./style.css'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;const allowed=FILES.map(file=>new URL(file,self.location.href).href);if(!allowed.includes(url.href))return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});
