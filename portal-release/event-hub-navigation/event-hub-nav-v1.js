// Keep the deployed site's header content intact; add a normal link to the protected partner sign-in.
(()=>{
 const destination='/eventhub/';
 // The public site's React router still has a legacy Hub route in its bundle.
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target instanceof Element?event.target.closest('header nav a[href]'):null;
  if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!['/eventhub','/partner-portal'].includes(url.pathname.replace(/\/$/,'')))return;
  event.preventDefault();
  event.stopPropagation();
  location.assign(destination+url.search+url.hash);
 },true);
 const style=document.createElement('style');style.textContent='@media(min-width:1024px){header nav [data-partner-hub-menu]{gap:12px!important}}@media(min-width:1280px){header nav [data-partner-hub-menu]{gap:24px!important}}@media(min-width:1536px){header nav [data-partner-hub-menu]{gap:32px!important}}@media(min-width:1024px) and (max-width:1279px){header .lg\\:grid{display:none!important}header div.lg\\:hidden{display:flex!important}header nav.lg\\:hidden:not([hidden]){display:block!important}}';document.head.append(style);
 function update(){
  document.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(href&&/^\/events\/4\/?(?=[?#]|$)/.test(href))a.setAttribute('href',href.replace(/^\/events\/4\/?/,'/OFFAIR26/'));});
  document.querySelectorAll('header nav a[href="/partners"]').forEach(partners=>{
   const menu=partners.parentElement;
   if(!menu)return;menu.dataset.partnerHubMenu='true';
   const existing=Array.from(menu.querySelectorAll('a')).find(a=>['/eventhub','/partner-portal'].includes(a.getAttribute('href')?.replace(/\/$/,'')??''));
   if(existing){if(existing.getAttribute('href')!==destination)existing.setAttribute('href',destination);if(existing.textContent.trim()!=='Event Hub')existing.textContent='Event Hub';return;}
   const link=partners.cloneNode(false);
   link.removeAttribute('aria-current');
   link.href=destination;link.textContent='Event Hub';link.dataset.partnerHubNav='true';
   link.className=link.className.replace(/\bbg-white\/10\b/g,'').replace(/\btext-white\b(?!\/)/g,'text-white/90');
   partners.after(link);
  });
 }
 let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update();});}).observe(document.documentElement,{childList:true,subtree:true});
 update();
})();
