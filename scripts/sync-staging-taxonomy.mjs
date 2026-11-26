import {readFile, writeFile} from 'node:fs/promises';

if (process.env.DEPLOY_TARGET !== 'staging') throw new Error('Taxonomy sync is only for staging builds.');
const key=process.env.VITE_EVENT_HUB_STAGING_PUBLISHABLE_KEY;
if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key??'')) throw new Error('Missing staging publishable key.');
const response=await fetch('https://ioynilkvrfujnmudaped.supabase.co/rest/v1/rpc/taxonomy_snapshot',{
 method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)
});
if(!response.ok)throw new Error('Staging taxonomy snapshot unavailable ('+response.status+').');
const terms=await response.json();
if(!Array.isArray(terms)||terms.length<20||!terms.every(term=>
 ['area','theme','keyword'].includes(term.kind)&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(term.id)&&
 typeof term.label==='string'&&typeof term.description==='string'))throw new Error('Invalid staging taxonomy snapshot.');
if(new Set(terms.map(term=>term.id)).size!==terms.length)throw new Error('Duplicate staging taxonomy IDs.');

const existing=JSON.parse(await readFile('src/content/taxonomy.json','utf8'));
function snapshot(kind, originals){
 const rows=new Map(originals.map(term=>[term.id,{...term,active:false}]));
 for(const term of terms.filter(term=>term.kind===kind)){
  rows.set(term.id,{id:term.id,label:term.label,description:term.description,active:term.active!==false});
 }
 return [...rows.values()];
}
await writeFile('src/content/taxonomy.json',JSON.stringify({areas:snapshot('area',existing.areas),topics:snapshot('theme',existing.topics)},null,2)+'\n');
await writeFile('src/content/taxonomy-keywords.generated.json',JSON.stringify(snapshot('keyword',[]),null,2)+'\n');
console.log('Synced the approved staging taxonomy snapshot for CMS and website build.');
