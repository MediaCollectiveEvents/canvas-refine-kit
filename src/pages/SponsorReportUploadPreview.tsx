import {OwnerWorkspaceProvider,OwnerWorkspaceNav,OwnerPanel,OwnerOverview,OwnerDraftNotice} from '@/components/shared/OwnerWorkspace';
import '@/components/shared/eventhub-mobile.css';
import {useOwnerMobileTables} from '@/components/shared/useOwnerMobileTables';
import SponsorGuestEditor from "@/components/shared/SponsorGuestEditor";
import { IntroductionFlag, IntroductionFlagNotice, useIntroductionFlags } from "@/components/shared/IntroductionFlag";
import LinkedInProfileLink from "@/components/shared/LinkedInProfileLink";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Header from '@/components/layout/Header';
import SponsorPortalFooter from '@/components/shared/SponsorPortalFooter';
import { Button } from '@/components/ui/button';
import { demoBaseline, demoUpdate, fields, readWorkbook, writeReportWorkbook, reviewRows, type Guest, type Issue } from '@/lib/sponsor-reports/enriched-review';

export type Version = { id: number; name: string; at: string; rows: Guest[] };
type Props = { savedVersions?: Version[]; onPublish?: (rows:Guest[],name:string)=>Promise<Version[]>; onRestore?: (version:number)=>Promise<Version[]>; onSignOut?:()=>void; ownerContent?:ReactNode; remoteBackend?:boolean; onViewSponsor?:()=>void; onViewDemo?:()=>void; guestToEnrich?:Guest };
export default function SponsorReportUploadPreview({savedVersions,onPublish,onRestore,onSignOut,ownerContent,remoteBackend,onViewSponsor,onViewDemo,guestToEnrich}:Props = {}) {
  const mobileRoot=useRef<HTMLDivElement>(null);useOwnerMobileTables(mobileRoot);
  const {flags,toggle} = useIntroductionFlags();
  const [versions,setVersions]=useState<Version[]>(savedVersions??[{id:1,name:'Initial fictional report',at:'Starting sample',rows:demoBaseline}]);
  const [draft,setDraft]=useState<{name:string;rows:Guest[]}|null>(null);
  useEffect(()=>{if(savedVersions)setVersions(savedVersions);},[savedVersions]);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[ack,setAck]=useState(false),[message,setMessage]=useState('');
  const [undoDelete,setUndoDelete]=useState<{name:string;rows:Guest[]}|null>(null);
  const [adding,setAdding]=useState(false);
  const [selectedIssue,setSelectedIssue]=useState<Issue|undefined>();
  const [editing,setEditing]=useState<number|null>(null),[search,setSearch]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const current=versions[versions.length-1]??{id:0,name:'No published report',at:'',rows:[]};
  const editableRows=draft?.rows??current.rows;
  const review=draft?reviewRows(draft.rows,current.rows):null;
  const blockers=review?.issues.filter(i=>i.blocking)??[];
  function choose(name:string,rows:Guest[]){setUndoDelete(null);setDraft({name,rows});setAck(false);setError('');setMessage('');}
  function removeGuest(index:number){
    const row=editableRows[index];
    const before={name:draft?.name??`Manual amendments to version ${current.id}`,rows:editableRows.map(r=>({...r}))};
    choose(before.name,editableRows.filter((_,i)=>i!==index));
    setUndoDelete(before);
    setMessage(`${row.firstName} ${row.lastName} removed from draft. Publish to save the removal.`);
  }
  useEffect(()=>{
    if(!guestToEnrich)return;
    setDraft(previous=>{
      const rows=previous?.rows??current.rows;
      if(rows.some(r=>(guestToEnrich.attendeeId&&r.attendeeId===guestToEnrich.attendeeId)||(guestToEnrich.email&&r.email.trim().toLowerCase()===guestToEnrich.email.trim().toLowerCase())))return previous;
      return {name:previous?.name??'Manual enrichment of Eventbrite registrations',rows:[...rows,{...guestToEnrich,sourceRow:rows.length+2}]};
    });
    setAck(false);setUndoDelete(null);setMessage('Guest added to your enriched draft. Review and publish to save; they will then leave New registrations.');
    document.getElementById('main-content')?.scrollIntoView({behavior:'smooth'});
  },[guestToEnrich]);
  async function load(file?:File) {
    setDraft(null);setUndoDelete(null);setError('');setMessage('');setAck(false);
    if(!file)return;
    if(!file.name.toLowerCase().endsWith('.xlsx')||file.size>5*1024*1024){setError('Choose an .xlsx workbook smaller than 5 MB.');return;}
    setBusy(true);
    try {
      const { Workbook }=await import('exceljs');const wb=new Workbook();await wb.xlsx.load(await file.arrayBuffer());
      const candidate=readWorkbook(wb);
      choose(`${file.name} / ${candidate.name}`,candidate.rows.map(row=>{
        const existing=row.email?current.rows.find(r=>r.email.trim().toLowerCase()===row.email.trim().toLowerCase()):undefined;
        return !row.attendeeId&&existing?.attendeeId?{...row,attendeeId:existing.attendeeId}:row;
      }));
    }catch(e){setError(e instanceof Error?e.message:'The workbook could not be read.');}finally{setBusy(false);if(input.current)input.current.value='';}
  }
  async function publish(rows:Guest[],name:string){
    setBusy(true);setError('');
    try {if(onPublish)setVersions(await onPublish(rows,name));else setVersions(v=>[...v,{id:v.length+1,name,at:new Date().toLocaleString('en-GB'),rows:structuredClone(rows)}]);setDraft(null);setUndoDelete(null);setAck(false);setMessage(onPublish?(remoteBackend?'Report version saved privately in private storage. The live website is unchanged.':'Report version saved privately and published to the local partner portal.'):'Test version published in this owner preview only. Partner portal and live data are unchanged.');}
    catch(e){setError(e instanceof Error?e.message:'Save failed. Your draft has been retained.');}finally{setBusy(false);}
  }
  async function downloadBackup(){
    setBusy(true);setError('');
    try{
      const {Workbook}=await import('exceljs');
      const data=await writeReportWorkbook(new Workbook(),current.rows).xlsx.writeBuffer();
      const url=URL.createObjectURL(new Blob([new Uint8Array(data)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const link=document.createElement('a');link.href=url;link.download=`OFF_AIR_report_backup_v${current.id}.xlsx`;link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{setError('The backup could not be downloaded. Please try again.');}finally{setBusy(false);}
  }
  async function restore(v:Version){if(!onRestore){await publish(v.rows,`Restored from version ${v.id}`);return;}setBusy(true);setError('');try{setVersions(await onRestore(v.id));setDraft(null);setUndoDelete(null);setAck(false);setMessage('Previous report restored as a new private version.');}catch(e){setError(e instanceof Error?e.message:'Restore failed.');}finally{setBusy(false);}}
  return <OwnerWorkspaceProvider><div ref={mobileRoot} className="eventhub-owner-mobile min-h-screen bg-background text-white"><Header/><main id="main-content" className="site-header-clearance" tabIndex={-1}>
    <div className="border-y border-primary/25 bg-primary/10 px-6 py-3 text-center text-sm">{onPublish?(remoteBackend?'OFF AIR partner portal · Private reports · Owner access only':'Local authenticated owner test · Private version storage · Fictional data only'):'Local owner prototype · No authentication · No server upload · Versions reset on reload'}</div>
    <div className="site-container max-w-6xl px-6 py-12"><div className="owner-workspace-header"><div><p className="text-xs uppercase tracking-widest text-primary">OFF AIR · Owner EventHub</p><h1 id="owner-workspace-title" tabIndex={-1} className="mt-3 font-display text-4xl font-light">Event management</h1><p>Registrants, partners and event resources—all your tools in one workspace.</p></div><div className="owner-workspace-actions">{onViewDemo&&<Button variant="outline" onClick={onViewDemo}>Anonymised demo</Button>}{onViewSponsor&&<Button variant="outline" onClick={onViewSponsor}>View partner hub</Button>}{onSignOut&&<button onClick={onSignOut} disabled={busy} className="min-h-11 underline">Sign out</button>}</div></div>{draft&&<OwnerDraftNotice/>}<div className="owner-workspace-grid"><OwnerWorkspaceNav/><div className="owner-workspace-content"><OwnerOverview count={current.rows.length} draft={!!draft}/><OwnerPanel id="reports"><section id="owner-report-upload" className="mt-8 rounded-xl border border-white/15 bg-white/5 p-6"><h2 className="font-display text-xl">Upload corrected report</h2><p className="my-3 text-sm text-white/60">.xlsx · Up to 5 MB · First name, Last name, Email, Company, Job title, LinkedIn URL. Your original file stays unchanged.</p><label className="block text-sm">Choose Excel workbook<input ref={input} type="file" accept=".xlsx" disabled={busy} onChange={e=>void load(e.target.files?.[0])} className="mt-3 block w-full rounded border border-white/20 p-3 file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-black"/></label>{!onPublish&&<div className="mt-4 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={()=>choose('Fictional updated report',structuredClone(demoUpdate))}>Try sample update</Button><Button variant="outline" disabled={busy} onClick={()=>choose('Sample with duplicate email',[...structuredClone(demoUpdate),{...demoUpdate[0],sourceRow:5}])}>Try duplicate check</Button></div>}{busy&&<p role="status" className="mt-3">Reading workbook locally…</p>}</section>
    </OwnerPanel><OwnerPanel id="registrants"><section id="owner-registrant-list" className="mt-8 rounded-xl border border-white/15 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl">{draft?'Amend draft guests':'Amend current guests'}</h2>{onPublish&&<Button variant="brand" disabled={busy} onClick={()=>setAdding(true)}>Add registrant</Button>}</div><p className="my-3 text-sm text-white/60">Edit contact details directly, then review and publish a new version. Delete a duplicate row to remove it from the next report. Earlier reports and original registration sources stay unchanged.</p><label className="block max-w-md text-sm">Find a guest<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, company or job title" className="mt-2 block w-full rounded border border-white/25 bg-white/5 p-3"/></label><div className="mt-5 max-h-96 overflow-auto rounded-lg border border-white/15"><table className="w-full text-left text-sm"><thead className="bg-white/5"><tr>{['Guest','Email','Company','Job title','LinkedIn','Action'].map(h=><th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{editableRows.map((r,i)=>({r,i})).filter(({r})=>fields.map(f=>r[f]).join(' ').toLowerCase().includes(search.trim().toLowerCase())).map(({r,i})=><tr key={i} className="border-t border-white/15"><td className="p-4">{r.firstName} {r.lastName}</td><td className="p-4">{r.email||'Not supplied'}</td><td className="p-4">{r.company||'Not supplied'}</td><td className="p-4">{r.jobTitle||'Not supplied'}</td><td className="p-4"><LinkedInProfileLink value={r.linkedin}/></td><td className="p-4"><Button variant="outline" disabled={busy} aria-label={`Edit ${r.firstName} ${r.lastName}`} onClick={()=>{setSelectedIssue(undefined);setEditing(i);}}>Edit</Button><Button variant="outline" className="mt-2" disabled={busy} aria-label={`Delete ${r.firstName} ${r.lastName} row ${i+1} from report`} onClick={()=>removeGuest(i)}>Delete from report</Button></td></tr>)}</tbody></table>{!editableRows.some(r=>fields.map(f=>r[f]).join(' ').toLowerCase().includes(search.trim().toLowerCase()))&&<p className="p-4 text-white/60">No guests match your search.</p>}</div></section>
    </OwnerPanel>{adding&&<SponsorGuestEditor adding
     guest={{firstName:'',lastName:'',email:'',company:'',jobTitle:'',linkedin:'',attendeeId:'',sourceRow:editableRows.length+2}}
     otherRows={editableRows} saveLabel="Add to draft"
     description="Review and publish the draft to add this person to the OFF AIR report."
     onClose={()=>setAdding(false)} onApply={row=>{
      choose(draft?.name??`Manual additions to version ${current.id}`,[...editableRows,row]);
      setAdding(false);setMessage('Registrant added to the draft. Review and publish to update the Event Hub.');
     }}/>}
    {editing!==null&&editableRows[editing]&&<SponsorGuestEditor issue={selectedIssue} guest={editableRows[editing]} otherRows={editableRows.filter((_,i)=>i!==editing)} onClose={()=>setEditing(null)} onApply={row=>{const rows=editableRows.map((r,i)=>i===editing?row:{...r});choose(draft?.name??`Manual amendments to version ${current.id}`,rows);setEditing(null);setMessage('Amendment added to draft. Review the changes below, then publish to save the new report version.');}}/>}
    {error&&<p role="alert" className="mt-5 rounded border border-red-300 p-4 text-red-200">{error}</p>}{message&&<p role="status" className="mt-5 rounded border border-primary p-4">{message} {undoDelete&&<button disabled={busy} className="ml-3 min-h-11 underline" onClick={()=>choose(undoDelete.name,undoDelete.rows)}>Undo</button>}</p>}
    <OwnerPanel id={['reports','registrants']}>{review&&draft&&<section className="mt-8 rounded-xl border border-white/15 p-6"><h2 className="font-display text-2xl">Review report changes</h2><p className="mt-3 break-words text-white/65">{draft.name}</p><div className="my-6 grid grid-cols-2 gap-3 md:grid-cols-5">{[['Rows',review.rows.length],['Added',review.added.length],['Changed fields',review.changes.length],['Omitted',review.removed.length],['Blocking issues',blockers.length]].map(([k,v])=><div key={k} className="rounded bg-white/5 p-4"><p className="text-sm text-white/60">{k}</p><p className="mt-2 text-2xl">{v}</p></div>)}</div><p className="text-sm text-white/60">Matched by email, with any existing internal references preserved. No names are automatically merged. {review.unchanged} unchanged records. Blank uploaded values replace previous values in this complete report snapshot.</p>
    <details className="my-5" open={review.issues.length>0}><summary className="cursor-pointer">Checks and missing fields ({review.issues.length})</summary><ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm">{review.issues.map((i,n)=><li key={n} className={i.blocking?'text-red-200':'text-white/60'}>{i.row&&editableRows.some(r=>r.sourceRow===i.row)?<button className="min-h-11 text-left underline decoration-dotted underline-offset-4 hover:text-white" onClick={()=>{setSelectedIssue(i);setEditing(editableRows.findIndex(r=>r.sourceRow===i.row));}}>{`Row ${i.row}: `}{i.blocking?'Fix before publishing — ':''}{i.message} · Open record</button>:<>{i.blocking?'Fix before publishing — ':''}{i.message}</>}</li>)}{!review.issues.length&&<li>No issues found.</li>}</ul></details>
    {review.changes.length>0&&<div className="my-5 overflow-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-semibold">Changed fields</caption><thead><tr>{['Person','Field','Previous','Uploaded'].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{review.changes.map((c,i)=><tr key={i} className="border-t border-white/15">{[c.identity,c.field,c.before||'Blank',c.after||'Blank'].map((v,j)=><td key={j} className="p-3">{c.field==='linkedin' && j>=2 ? <LinkedInProfileLink value={j===2?c.before:c.after}/> : v}</td>)}</tr>)}</tbody></table></div>}
    {review.removed.length>0&&<p className="my-4 text-amber-200">Omitted from the new snapshot: {review.removed.map(r=>`${r.firstName} ${r.lastName}`).join(', ')}. They remain in earlier test versions.</p>}
    <details className="my-5"><summary className="cursor-pointer">Preview all uploaded records</summary>{!onPublish&&<IntroductionFlagNotice count={flags.size}/>}<div className="mt-3 overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{[...fields,...(onPublish?[]:['Introduction'])].map(f=><th key={f} className="p-3">{f}</th>)}</tr></thead><tbody>{review.rows.map((r,i)=><tr key={i} className="border-t border-white/15">{fields.map(f=>r[f]).map((v,j)=><td key={j} className="p-3">{j===5?<LinkedInProfileLink value={v}/>:v||'Not supplied'}</td>)}{!onPublish&&<td className="p-3"><IntroductionFlag name={`${r.firstName} ${r.lastName}`} selected={flags.has(r.attendeeId||r.email.toLowerCase())} onToggle={()=>toggle(r.attendeeId||r.email.toLowerCase())}/></td>}</tr>)}</tbody></table></div></details>
    <label className="my-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} className="mt-1"/><span>I have reviewed the changes, missing fields, blank replacements and omitted records.</span></label><Button variant="brand" disabled={!!blockers.length||!ack||busy} onClick={()=>void publish(review.rows,draft.name)}>{onPublish?(remoteBackend?'Publish report':'Publish local report'):'Publish test version'}</Button><button className="ml-5 min-h-11 underline" disabled={busy} onClick={()=>{setDraft(null);setUndoDelete(null);setMessage('');setError('');setAck(false);}}>Discard draft</button></section>}
    </OwnerPanel>{ownerContent}<OwnerPanel id="reports"><section className="mt-10"><h2 className="font-display text-2xl">{onPublish?'Private version history':'Test version history'}</h2><p className="my-3 text-sm text-white/60">Current: version {current.id} · {current.rows.length} rows. {onPublish?'Earlier snapshots are retained in private storage.':'Earlier snapshots stay unchanged during this session.'} Restoring creates another version.</p><Button variant="outline" disabled={busy||!current.rows.length} onClick={()=>void downloadBackup()}>Download current report backup</Button><ul className="mt-4 space-y-3">{[...versions].reverse().map(v=><li key={v.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 p-5"><div><p>Version {v.id} · {v.name}</p><p className="mt-2 text-sm text-white/50">{v.at} · {v.rows.length} records {v.id===current.id?'· Current':''}</p></div>{v.id!==current.id&&<Button variant="outline" disabled={busy} onClick={()=>void restore(v)}>Restore {onPublish?'version':'test version'} {v.id}</Button>}</li>)}</ul></section>
    </OwnerPanel></div></div></div></main><SponsorPortalFooter/></div></OwnerWorkspaceProvider>;
}
