import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';
import {seal,snapshot} from '@/owner-offline/store.js';
export default function OwnerOfflineReport({client}:{client:FrankfurtOwnerClient}){
 const [pass,setPass]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function save(){setBusy(true);setMessage('');try{
  if(pass.length<16||pass!==confirm)throw Error('Enter matching passphrases of at least 16 characters.');
  const state=await client.state(),pending=await client.unenriched();
  const rows=[...(state.versions[state.versions.length-1]?.rows??[]),...pending.rows].map(row=>({firstName:row.firstName,lastName:row.lastName,company:row.company,jobTitle:row.jobTitle,email:row.email??'',linkedin:'linkedin' in row?row.linkedin:''}));
  const encrypted=await seal({version:1,savedAt:new Date().toISOString(),rows},pass);
  const registration=await navigator.serviceWorker.register('/eventhub/owner-offline/sw.js',{scope:'/eventhub/owner-offline/'});
  const worker=registration.installing??registration.waiting??registration.active;
  if(!worker)throw Error('Offline app setup is unavailable.');
  if(worker.state!=='activated')await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Offline setup timed out. Try again online.')),30000);worker.addEventListener('statechange',()=>{if(worker.state==='activated'){clearTimeout(timeout);resolve();}if(worker.state==='redundant'){clearTimeout(timeout);reject(Error('Offline setup failed. Try again online.'));}});});
  await snapshot('put',encrypted);setPass('');setConfirm('');setMessage(`Saved ${rows.length} registrants on this device. Open the offline report once, then add it to your home screen. Save again here whenever you need fresh data.`);
 }catch(e){setMessage(e instanceof Error?e.message:'Offline save failed.');}finally{setBusy(false);}}
 return <section className="my-6 rounded-xl border border-white/15 p-5"><h2 className="text-xl">Keep a copy on this phone</h2><p className="my-3 text-sm text-white/65">Save a read-only copy of registrants, including their email addresses. It is encrypted with a separate passphrase that stays on this device only while you type it. Updates require saving again online. Offline access cannot be revoked remotely.</p><div className="grid gap-4 sm:grid-cols-2"><label>Offline passphrase<input type="password" autoComplete="new-password" value={pass} disabled={busy} onChange={e=>setPass(e.target.value)} className="mt-2 block w-full rounded border border-white/25 bg-white/5 p-3"/></label><label>Confirm passphrase<input type="password" autoComplete="new-password" value={confirm} disabled={busy} onChange={e=>setConfirm(e.target.value)} className="mt-2 block w-full rounded border border-white/25 bg-white/5 p-3"/></label></div><div className="mt-4 flex flex-wrap gap-4"><Button variant="brand" disabled={busy||pass.length<16||pass!==confirm} onClick={()=>void save()}>{busy?'Saving…':'Save encrypted offline copy'}</Button><a className="self-center text-primary underline" href="/eventhub/owner-offline/index.html">Open offline report</a><Button variant="outline" disabled={busy} onClick={()=>void snapshot('delete').then(()=>setMessage('Offline copy deleted from this device.')).catch(()=>setMessage('Unable to delete the offline copy.'))}>Delete offline copy</Button></div>{message&&<p role="status" className="mt-4 text-sm">{message}</p>}</section>;
}
