import {useEffect,useState,type ChangeEvent,type FormEvent} from 'react';
import SponsorGuestEditor from './SponsorGuestEditor';
import {Button} from '@/components/ui/button';
import type {FrankfurtSponsorClient} from '@/lib/sponsor-reports/supabase-connection';
import type {MptsSettings} from '@/lib/sponsor-reports/mpts';
import {parseMptsCheckins,parseMptsRegistrations,type MptsRegistration} from '@/lib/sponsor-reports/mpts-csv';
import type {AttendanceReport} from '@/lib/sponsor-reports/attendance';

type PendingUpload={filename:string;checkins:false;rows:MptsRegistration[]}
 |{filename:string;checkins:true;rows:ReturnType<typeof parseMptsCheckins>};

export default function MptsReportManagement({client,endsAt,onChanged}:{client:FrankfurtSponsorClient;endsAt:string;onChanged:()=>void}){
 const [settings,setSettings]=useState<MptsSettings|null>(null);
 const [attendance,setAttendance]=useState<AttendanceReport|null>(null);
 const [pending,setPending]=useState<PendingUpload|null>(null);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [team,setTeam]=useState('');
 const [adding,setAdding]=useState(false);
 const afterEvent=Date.now()>=Date.parse(endsAt);
 const accessExpiry=new Date(Date.parse(endsAt)+21*86400000).toISOString();

 async function refresh(){
  const [report,attendanceReport]=await Promise.all([
   client.mptsReport<MptsSettings>('owner_settings'),client.mptsReport<AttendanceReport>('attendance'),
  ]);
  setSettings(report);setAttendance(attendanceReport);
 }
 useEffect(()=>{void refresh().catch(()=>setError('The reporting controls could not be loaded. Sign in again to retry.'));},[client]);

 async function perform(action:()=>Promise<string>){
  setBusy(true);setError('');setMessage('');
  try{setMessage(await action());await refresh();onChanged();}
  catch(e){setError(e instanceof Error?e.message:'The report could not be updated.');}
  finally{setBusy(false);}
 }

 async function prepareCsv(e:ChangeEvent<HTMLInputElement>,checkins:boolean){
  const file=e.currentTarget.files?.[0];
  e.currentTarget.value='';
  if(!file)return;
  setError('');setPending(null);
  try{
   if(!file.name.toLowerCase().endsWith('.csv')||file.size>2*1024*1024)throw new Error('Choose a CSV smaller than 2 MB.');
   const csv=await file.text();
   setPending(checkins?{filename:file.name,checkins:true,rows:parseMptsCheckins(csv)}
    :{filename:file.name,checkins:false,rows:parseMptsRegistrations(csv)});
  }catch(error){setError(error instanceof Error?error.message:'The CSV could not be read.');}
 }

 function publish(){
  if(!pending||!settings)return;
  void perform(async()=>{
   if(pending.checkins){
    const result=await client.mptsReport<{attended:number;noShow:number;unmatched:number}>('import_checkins',null,{rows:pending.rows});
    setPending(null);
    return `Check-ins saved. ${result.attended} attended, ${result.noShow} no-show and ${result.unmatched} unmatched CSV rows.`;
   }
   await client.mptsReport('publish',null,{filename:pending.filename,rows:pending.rows,revision:settings.revision,agreed:true});
   setPending(null);
   return `Published ${pending.rows.length} MPTS registrants.`;
  });
 }
 function approve(e:FormEvent){
  e.preventDefault();
  if(!team)return;
  void perform(async()=>{await client.mptsReport('grant_team',null,{sponsor:team,expiresAt:accessExpiry});setTeam('');return 'MPTS team access saved.';});
 }

 return <section className="my-8 rounded-xl border border-white/20 bg-[#122630] p-6" aria-labelledby="mpts-manage">
  <h2 id="mpts-manage" className="font-display text-2xl">Manage the MPTS report</h2>
  <div className="mt-6 grid gap-7 lg:grid-cols-2">
   <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Registration list</h3>
     <Button variant="brand" disabled={busy||!settings} onClick={()=>setAdding(true)}>Add registrant</Button>
    </div>
    <p className="text-sm text-white/70">Upload a CSV with first name, last name and email. You can also include attendee ID, company, job title, LinkedIn URL and an ISO registration date.</p>
    <label className="block text-sm">Choose registration CSV<input className="mt-2 block" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>void prepareCsv(e,false)}/></label>
    {afterEvent&&<><h3 className="font-semibold">Attendance</h3>
     <label className="block text-sm">Choose Eventbrite check-in CSV<input className="mt-2 block" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>void prepareCsv(e,true)}/></label>
     {attendance?.closesAt?<p className="text-sm text-white/70">Editing deadline {new Date(attendance.closesAt).toLocaleString('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'})} UK time.</p>
     :<Button variant="outline" disabled={busy||!attendance} onClick={()=>void perform(async()=>{await client.mptsReport('open_attendance');return 'The 72-hour attendance editing window is open.';})}>Open 72-hour editing window</Button>}
    </>}
    {pending&&<div className="rounded-lg border border-primary/40 p-4">
     <p className="text-sm">{pending.filename} · {pending.rows.length} rows</p>
     <div className="mt-3 flex gap-3"><Button variant="brand" disabled={busy||!settings} onClick={publish}>{pending.checkins?'Apply check-ins':'Publish registration list'}</Button><Button variant="outline" disabled={busy} onClick={()=>setPending(null)}>Cancel</Button></div>
    </div>}
   </div>
   <div className="space-y-4">
    <h3 className="font-semibold">Sponsor access</h3>
    <form onSubmit={approve} className="flex flex-wrap items-end gap-3">
     <label className="text-sm">Existing sponsor team<select className="mt-2 block min-h-10 rounded border border-white/25 bg-[#102630] px-3" value={team} onChange={e=>setTeam(e.target.value)}><option value="">Choose a team</option>{settings?.teams.filter(option=>!option.approved).map(option=><option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
     <Button variant="brand" disabled={busy||!team}>Approve MPTS access</Button>
    </form>
    {settings?.teams.filter(option=>option.approved).map(option=><div key={option.id} className="flex flex-wrap items-center justify-between gap-3"><span>{option.name}</span><Button variant="outline" disabled={busy} onClick={()=>void perform(async()=>{await client.mptsReport('revoke_team',null,{sponsor:option.id});return 'MPTS team access revoked.';})}>Revoke MPTS access</Button></div>)}
    <h3 className="font-semibold">Next-event suggestions</h3>
    {settings?.suggestions.length?<ul className="space-y-2 text-sm text-white/75">{settings.suggestions.map((entry,index)=><li key={index}>{entry.guest.firstName} {entry.guest.lastName} · {entry.team}</li>)}</ul>:<p className="text-sm text-white/65">No suggestions yet.</p>}
   </div>
  </div>
  {adding&&<SponsorGuestEditor adding
   guest={{firstName:'',lastName:'',email:'',company:'',jobTitle:'',linkedin:'',attendeeId:'',sourceRow:0}}
   otherRows={[]} saveLabel="Add registrant" description="Save this person to the published MPTS registration list."
   onClose={()=>setAdding(false)} onApply={async guest=>{
    await client.addMptsRegistrant(guest);
    setAdding(false);setMessage('Registrant added to the MPTS report.');setError('');
    onChanged();
    await refresh().catch(()=>setError('The registrant was saved. Refresh the page before publishing a new CSV.'));
   }}/>}
  {message&&<p className="mt-5 text-primary" role="status">{message}</p>}
  {error&&<p className="mt-5 text-amber-200" role="alert">{error}</p>}
 </section>;
}
