import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';

type Kind='area'|'theme'|'keyword';
type Status='proposed'|'under_review'|'approved'|'active'|'retired';
type Term={id:string;kind:Kind;label:string;description:string;aliases:string[];themeIds:string[];sourceIds:string[];legacyIds:string[];original_status?:string;evidence_locator?:string;replaced_by?:string;revision:number;status:Status;serving?:boolean};
type Snapshot={terms:Term[];sources:{id:string;kind?:string;path?:string;file?:string}[];historicalEvents:{event_ref:string;legacy_theme:string;legacy_keyword:string}[];suggestions:{id:string;label:string;reason:string;status:string}[]};
const statuses:Status[]=['proposed','under_review','approved','active','retired'];
const layers:Record<Kind,string>={area:'Functional areas',theme:'Industry themes',keyword:'Detailed keywords'};
const field='mt-1 block w-full rounded border border-white/20 bg-[#102630] p-3';
const editStatus=(term:Term)=>term.status.replaceAll('_',' ');
const blank=(kind:Kind):Term=>({id:'',kind,label:'',description:'',aliases:[],themeIds:[],sourceIds:[],legacyIds:[],revision:0,status:'proposed'});
const quote=(value:unknown)=>'"'+String(value??'').replace(/^[\s]*[=+@-]/,"'$&").replaceAll('"','""')+'"';

export default function OwnerTaxonomy({client}:{client:FrankfurtOwnerClient}){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 const [layer,setLayer]=useState<Kind>('keyword');
 const [search,setSearch]=useState('');
 const [theme,setTheme]=useState('');
 const [status,setStatus]=useState('');
 const [source,setSource]=useState('');
 const [selected,setSelected]=useState<string[]>([]);
 const [editing,setEditing]=useState<Term|null>(null);
 const [creating,setCreating]=useState(false);
 const [aliases,setAliases]=useState('');
 const [replacement,setReplacement]=useState('');
 const [preview,setPreview]=useState(false);
 const [history,setHistory]=useState<object[]|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');

 async function run(action:string,data:object={}) {
  setBusy(true);setMessage('');setError('');
  try{
   if(action==='history'){
    const result=await client.taxonomy(action,data) as {rows?:object[]};
    setHistory(result.rows??[]);
    return;
   }
   if(action!=='list') await client.taxonomy(action,data);
   const result=await client.taxonomy('list') as unknown as Snapshot;
   setSnapshot(result);setSelected([]);
   if(action!=='list'){setEditing(null);setPreview(false);setMessage('Change saved in the staging database.');}
  }catch(cause){setError(cause instanceof Error?cause.message:'Taxonomy database unavailable.');}
  finally{setBusy(false);}
 }

 function open(term?:Term){
  setCreating(!term);setEditing(term??blank(layer));setAliases(term?.aliases.join('\n')??'');setReplacement('');
  setPreview(false);setHistory(null);
 }
 const terms=snapshot?.terms??[];
 const themes=terms.filter(term=>term.kind==='theme');
 const filtered=terms.filter(term=>term.kind===layer&&(!theme||layer!=='keyword'||term.themeIds.includes(theme))&&
  (!status||term.status===status)&&(!source||term.sourceIds.includes(source))&&
  [term.label,term.id,term.description,...term.aliases,...term.legacyIds].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 const pending=terms.filter(term=>selected.includes(term.id)&&['proposed','under_review'].includes(term.status));
 const current=editing&&terms.find(term=>term.id===editing.id);
 const unsaved=!!editing&&!!current&&(editing.label!==current.label||editing.description!==current.description||
  editing.themeIds.join()!==current.themeIds.join()||aliases!==current.aliases.join('\n'));
 const evidence=editing&&snapshot?.historicalEvents.filter(item=>editing.legacyIds.includes(item.legacy_keyword));
 const similar=editing?.label.trim() ? terms.filter(term=>term.id!==editing.id&&term.kind===editing.kind&&
  [term.label,...term.aliases].some(value=>value.toLowerCase().includes(editing.label.trim().toLowerCase())||
   editing.label.trim().toLowerCase().includes(value.toLowerCase()))) : [];

 function download(format:'json'|'csv'){
  if(!snapshot)return;
  const text=format==='json'?JSON.stringify(snapshot,null,2):
   ['id,kind,label,description,status,aliases,themes,sources,legacy_ids,replacement,revision',
    ...terms.map(term=>[term.id,term.kind,term.label,term.description,term.status,term.aliases.join(' | '),term.themeIds.join(' | '),
     term.sourceIds.join(' | '),term.legacyIds.join(' | '),term.replaced_by,term.revision].map(quote).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([text],{type:format==='json'?'application/json':'text/csv;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='media-collective-taxonomy.'+format;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }

 return <section className="my-8 space-y-5 rounded-xl border border-white/15 p-6">
  <h2 className="font-display text-2xl">Taxonomy &amp; Keyword Management</h2>
  <p className="text-sm text-white/70">Manage the staging vocabulary. Review, approve and activate terms separately.</p>
  <Button disabled={busy} onClick={()=>void run('list')}>{snapshot?'Refresh taxonomy':'Load taxonomy'}</Button>
  {error&&<p role="alert" className="text-red-300">{error}</p>}{message&&<p role="status">{message}</p>}
  {snapshot&&<>
   <div className="grid gap-3 sm:grid-cols-3">{(Object.keys(layers) as Kind[]).map(kind=><div key={kind} className="border border-white/15 p-4">
    <Button variant={kind===layer?'brand':'outline'} onClick={()=>{setLayer(kind);setEditing(null);}}>{layers[kind]}</Button>
    <p className="mt-2">{terms.filter(term=>term.kind===kind).length} total</p>
    <p className="text-xs text-white/65">{statuses.map(value=>terms.filter(term=>term.kind===kind&&term.status===value).length+' '+value.replaceAll('_',' ')).join(' · ')}</p>
   </div>)}</div>
   <div className="grid gap-3 md:grid-cols-4">
    <label>Search<input className={field} value={search} onChange={e=>setSearch(e.target.value)}/></label>
    {layer==='keyword'&&<label>Theme<select className={field} value={theme} onChange={e=>setTheme(e.target.value)}><option value="">All themes</option>{themes.map(term=><option key={term.id} value={term.id}>{term.label}</option>)}</select></label>}
    <label>Status<select className={field} value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(value=><option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}</select></label>
    <label>Source<select className={field} value={source} onChange={e=>setSource(e.target.value)}><option value="">All sources</option>{snapshot.sources.map(item=><option key={item.id} value={item.id}>{item.id}</option>)}</select></label>
   </div>
   <div className="flex flex-wrap gap-2">
    <Button onClick={()=>open()}>Add {layer}</Button>
    <Button variant="outline" onClick={()=>download('json')}>Export JSON</Button>
    <Button variant="outline" onClick={()=>download('csv')}>Export CSV</Button>
    <Button variant="outline" disabled={busy||!pending.length} onClick={()=>void run('approve_many',{terms:pending.map(t=>({id:t.id,revision:t.revision}))})}>Approve selected ({pending.length})</Button>
   </div>
   {editing&&<section className="space-y-3 rounded border border-primary/50 p-4">
    <h3>{creating?'New '+editing.kind:editing.label+' · '+editStatus(editing)}</h3>
    {editing.serving&&editing.status!=='active'&&<p>The previous active revision is still in use.</p>}
    <label>Stable ID<input className={field} disabled={!creating} value={editing.id} onChange={e=>setEditing({...editing,id:e.target.value})}/></label>
    <label>Label<input className={field} value={editing.label} onChange={e=>setEditing({...editing,label:e.target.value})}/></label>
    <label>Definition<textarea className={field} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})}/></label>
    <label>Aliases, one per line<textarea className={field} value={aliases} onChange={e=>setAliases(e.target.value)}/></label>
    {editing.kind==='keyword'&&<fieldset><legend>Theme associations</legend><div className="grid gap-2 sm:grid-cols-2">{themes.filter(t=>t.status!=='retired'||editing.themeIds.includes(t.id)).map(t=><label key={t.id} className="flex gap-2"><input type="checkbox" checked={editing.themeIds.includes(t.id)} onChange={e=>setEditing({...editing,themeIds:e.target.checked?[...editing.themeIds,t.id]:editing.themeIds.filter(id=>id!==t.id)})}/>{t.label}</label>)}</div></fieldset>}
    {!!similar.length&&<p role="status">Possible overlap: {similar.map(term=>term.label).join(', ')}</p>}
    <div className="flex flex-wrap gap-2">
     <Button variant="outline" onClick={()=>setPreview(!preview)}>{preview?'Hide preview':'Preview proposed values'}</Button>
     <Button disabled={busy||editing.status==='retired'} onClick={()=>void run(creating?'create':'edit',{...editing,aliases:aliases.split('\n')})}>Save draft</Button>
     <Button variant="outline" onClick={()=>setEditing(null)}>Close</Button>
    </div>
    {unsaved&&<p role="status">Save these edits before changing the review status.</p>}
    {preview&&<div className="rounded border border-white/15 p-3"><strong>{editing.label}</strong><p>{editing.description}</p><p>{aliases.trim()}</p><p>{editing.themeIds.map(id=>themes.find(t=>t.id===id)?.label??id).join(' · ')}</p></div>}
    {!creating&&<div className="flex flex-wrap gap-2">
     {([['review',editing.status==='proposed','Move to review'],['approve',editing.status==='proposed'||editing.status==='under_review','Approve'],['activate',editing.status==='approved','Activate'],['retire',editing.status!=='retired','Retire'],['reactivate',editing.status==='retired','Prepare reactivation'],['history',true,'Revision history']] as const).filter(([,show])=>show).map(([action,,label])=><Button key={action} variant="outline" disabled={busy||(unsaved&&action!=='history')} onClick={()=>void run(action,{id:editing.id,revision:editing.revision})}>{label}</Button>)}
    </div>}
    {!creating&&editing.kind==='keyword'&&editing.status!=='retired'&&<div className="space-y-2">
      <label>Replacement keyword<select className={field} value={replacement} onChange={e=>setReplacement(e.target.value)}><option value="">Choose an active equivalent</option>{terms.filter(t=>t.id!==editing.id&&t.kind==='keyword'&&t.serving).map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
      <Button variant="outline" disabled={busy||unsaved||!replacement} onClick={()=>void run('merge',{id:editing.id,revision:editing.revision,replacement})}>Retire and replace</Button>
    </div>}
    {editing.replaced_by&&<p>Replacement: {editing.replaced_by}</p>}
    {!creating&&<details><summary>Source evidence and historical associations</summary>
      {snapshot.sources.filter(item=>editing.sourceIds.includes(item.id)).map(item=><p key={item.id}>{item.kind} · {item.path??item.file}</p>)}
      {editing.evidence_locator&&<p>{editing.evidence_locator}</p>}
      {editing.legacyIds.length>0&&<p>Historical IDs: {editing.legacyIds.join(', ')}</p>}
      {evidence?.map(item=><p key={item.event_ref+item.legacy_theme+item.legacy_keyword}>{item.event_ref} · {item.legacy_theme} · {item.legacy_keyword}</p>)}
    </details>}
    {history&&<pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(history,null,2)}</pre>}
   </section>}
   <p role="status">{filtered.length} matching terms</p>
   <div className="divide-y divide-white/15">{filtered.map(term=><article key={term.id} className="py-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg">{term.label}</h3><p className="text-xs text-primary">{editStatus(term)} · {term.id}{term.serving&&term.status!=='active'?' · previous revision active':''}</p></div>
    <div className="flex items-center gap-3">{['proposed','under_review'].includes(term.status)&&<input type="checkbox" aria-label={'Select '+term.label+' for approval'} checked={selected.includes(term.id)} onChange={e=>setSelected(e.target.checked?[...selected,term.id]:selected.filter(id=>id!==term.id))}/>}<Button variant="outline" onClick={()=>open(term)}>Edit / review</Button></div></div>
    <p className="mt-2 text-sm">{term.description}</p>
   </article>)}</div>
   <h3>Contributor suggestions</h3>
   {snapshot.suggestions.length===0&&<p>No suggestions to review.</p>}
   {snapshot.suggestions.map(suggestion=><div key={suggestion.id} className="border-t border-white/15 py-3"><strong>{suggestion.label}</strong><p>{suggestion.reason}</p><p>{suggestion.status}</p>{suggestion.status==='proposed'&&<Button variant="outline" disabled={busy} onClick={()=>void run('review_suggestion',{id:suggestion.id})}>Mark reviewed</Button>}</div>)}
  </>}
 </section>;
}
