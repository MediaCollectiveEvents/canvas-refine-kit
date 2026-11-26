import {useState} from 'react';
import {Download} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';
import {ownerRegistrantsCsv,withRegistrationDates} from '@/lib/sponsor-reports/owner-registrants-csv';
export default function OwnerRegistrantDownload({client}:{client:FrankfurtOwnerClient}){
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function download(){setBusy(true);setError('');setMessage('');try{
  const[state,pending,preview]=await Promise.all([client.state(),client.unenriched(),client.sponsorPreview()]);
  const rows=withRegistrationDates([...(state.versions[state.versions.length-1]?.rows??[]),...pending.rows.map(row=>({...row,email:row.email??''}))],preview.raw.rows);
  if(!rows.length)throw Error('There are no registrants to download.');
  const url=URL.createObjectURL(new Blob([ownerRegistrantsCsv(rows)],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`OFF_AIR_Registrants_${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage(`Downloaded ${rows.length} registrants, including email, company, job title, LinkedIn URL and registration date where supplied.`);
 }catch(e){setError(e instanceof Error?e.message:'The registrant list could not be downloaded.');}finally{setBusy(false);}}
 return <section className="my-6 rounded-xl border border-white/15 p-5"><h2 className="text-xl">Download registrants</h2><p className="my-3 text-sm text-white/65">Owner-only CSV of the current report and new registrations, including email addresses and registration dates. Existing enrichment matches and deleted registrations are excluded from the new registrations.</p><Button variant="brand" disabled={busy} onClick={()=>void download()}><Download className="mr-2 h-4 w-4"/>{busy?'Preparing…':'Download registrants CSV'}</Button>{message&&<p role="status" className="mt-3 text-sm text-primary">{message}</p>}{error&&<p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}</section>;
}
