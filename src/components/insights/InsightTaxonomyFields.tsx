import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {matchTaxonomy,taxonomyRequest,useActiveTaxonomy} from '@/lib/masterTaxonomy';

export default function InsightTaxonomyFields({text,themes,keywords,onChange,token}:{
 text:string;themes:string[];keywords:string[];onChange:(themes:string[],keywords:string[])=>void;token?:string;
}){
 const {terms,error}=useActiveTaxonomy();
 const [search,setSearch]=useState('');
 const [show,setShow]=useState(false);
 const [suggestion,setSuggestion]=useState('');
 const [reason,setReason]=useState('');
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const query=search.trim().toLowerCase();
 const matches=show?matchTaxonomy(terms,text):[];
 const matching=terms.filter(term=>[term.label,term.id,...term.aliases].some(value=>value.toLowerCase().includes(query)));
 const activeIds=new Set(terms.map(term=>term.id));
 const inactiveThemes=terms.length?themes.filter(id=>!activeIds.has(id)):[];
 const inactiveKeywords=terms.length?keywords.filter(id=>!activeIds.has(id)):[];
 function toggle(id:string,kind:'theme'|'keyword'){
  const current=kind==='theme'?themes:keywords;
  const next=current.includes(id)?current.filter(value=>value!==id):[...current,id];
  if(kind==='theme')onChange(next,keywords);else onChange(themes,next);
 }
 async function propose(){
  if(!token)return;
  setBusy(true);setStatus('');
  try{
   await taxonomyRequest('taxonomy_suggest',{p_token:token,p_label:suggestion,p_reason:reason});
   setSuggestion('');setReason('');setStatus('Suggestion saved for editorial review.');
  }catch(cause){setStatus(cause instanceof Error?cause.message:'Could not save suggestion.');}
  finally{setBusy(false);}
 }

 return <section className="space-y-4">
  <h3 className="font-display text-xl">Industry themes and detailed keywords</h3>
  {error&&<p role="alert">{error}</p>}
  <label className="block">Find an active term<input value={search} onChange={e=>setSearch(e.target.value)} className="mt-1 w-full rounded border border-white/20 bg-[#102630] p-3"/></label>
  <Button type="button" variant="outline" disabled={!terms.length} onClick={()=>setShow(!show)}>{show?'Hide matches':'Find matches in article'}</Button>
  {show&&<div className="space-y-2">
   <p>Matches come from the wording in your headline, standfirst and article.</p>
   {matches.length===0&&<p>No active terms matched.</p>}
   {matches.map(({term,matched})=><button key={term.id} type="button" aria-pressed={(term.kind==='theme'?themes:keywords).includes(term.id)}
    className="mr-2 rounded border border-white/25 px-3 py-2 aria-pressed:border-primary aria-pressed:text-primary" onClick={()=>toggle(term.id,term.kind==='theme'?'theme':'keyword')}>
    {term.label} · matched “{matched}”
   </button>)}
  </div>}
  {(['theme','keyword'] as const).map(kind=><fieldset key={kind} className="space-y-2">
   <legend>{kind==='theme'?'Industry themes':'Detailed keywords'}</legend>
   <div className="grid gap-2 sm:grid-cols-2">{matching.filter(term=>term.kind===kind).map(term=><label key={term.id} className="flex items-center gap-2">
    <input type="checkbox" checked={(kind==='theme'?themes:keywords).includes(term.id)} onChange={()=>toggle(term.id,kind)}/>{term.label}
   </label>)}</div>
   {!matching.some(term=>term.kind===kind)&&<p>No active {kind}s match.</p>}
   {(kind==='theme'?inactiveThemes:inactiveKeywords).map(id=><label key={id} className="flex items-center gap-2">
    <input type="checkbox" checked onChange={()=>toggle(id,kind)}/>{id} (historical selection, clear before submitting)
   </label>)}
  </fieldset>)}
  {token&&<details className="space-y-3">
   <summary>Suggest a missing keyword</summary>
   <label className="block">Suggested keyword<input value={suggestion} maxLength={200} onChange={e=>setSuggestion(e.target.value)} className="w-full rounded border border-white/20 bg-[#102630] p-3"/></label>
   <label className="block">Why it is needed (optional)<textarea value={reason} maxLength={1000} onChange={e=>setReason(e.target.value)} className="w-full rounded border border-white/20 bg-[#102630] p-3"/></label>
   <Button type="button" variant="outline" disabled={busy||!suggestion.trim()} onClick={()=>void propose()}>Submit suggestion</Button>
   {status&&<p role="status">{status}</p>}
  </details>}
 </section>;
}
