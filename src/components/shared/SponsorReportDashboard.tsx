import {attendanceLabels,type AttendanceReport,type AttendanceStatus} from '@/lib/sponsor-reports/attendance';
import './partner-mobile.css';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {portalTerms} from '@/lib/sponsor-reports/portal-terms';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import PartnerEventHero from './PartnerEventHero';
import PartnerEventInformation from './PartnerEventInformation';
import PartnerEventProducers from './PartnerEventProducers';
import PartnerEventOverview from './PartnerEventOverview';
import PartnerAudienceProfile from './PartnerAudienceProfile';
import PartnerAttendanceReport from './PartnerAttendanceReport';
import {seniorityGroup,seniorityGroups,organisations,type SeniorityGroup} from '@/lib/sponsor-reports/audience-profile';
import type {GalleryAccess} from './EventGallery';
import MarketingDownloads,{type MarketingFile} from './MarketingDownloads';
import {guestListDownloadsAvailable} from '@/lib/sponsor-reports/download-availability';
import {recentRegistrations,type SponsorGuest} from '@/lib/sponsor-reports/guest-list';
import {PreEventOverview} from './PreEventReport';
import {useState,useEffect,useRef} from 'react';
import {Download,Search} from 'lucide-react';
import {Button} from '@/components/ui/button';
import LinkedInProfileLink from './LinkedInProfileLink';
import type {SponsorState,EventbriteReport} from '@/lib/sponsor-reports/supabase-connection';

type MeetingControls={selected:string[];busy:boolean;ready:boolean;unavailable:Set<string>;toggle:(ref:string,checked:boolean)=>void};
function MeetingCheckbox({guest,controls}:{guest:SponsorGuest;controls:MeetingControls}){
 const disabled=!controls.ready||controls.busy||!guest.guestRef||controls.unavailable.has(guest.guestRef);
 return <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs text-white/75"><input type="checkbox" className="h-4 w-4 accent-primary" checked={!!guest.guestRef&&controls.selected.includes(guest.guestRef)} disabled={disabled} onChange={e=>guest.guestRef&&controls.toggle(guest.guestRef,e.target.checked)} aria-label={`Invite ${guest.firstName} ${guest.lastName} to next event`} title={!guest.guestRef||controls.unavailable.has(guest.guestRef)?'Selection unavailable until this guest’s identity is resolved':undefined}/><span>Invite to next event</span></label>;
}
type AttendanceAccess = {
 load: () => Promise<AttendanceReport>;
 save?: (guest: string, status: AttendanceStatus) => Promise<AttendanceReport>;
};
type AttendanceControls = {
 report: AttendanceReport | null;
 editing: boolean;
 busy: boolean;
 save: (guest: string, status: AttendanceStatus) => void;
};

function GuestAttendance({guest,controls,ambiguous,mobile=false}:{guest:SponsorGuest;controls:AttendanceControls;ambiguous:boolean;mobile?:boolean}){
 const guestRef=ambiguous?null:guest.guestRef;
 const status=(guestRef&&controls.report?.statuses[guestRef])||'unconfirmed';
 return <div className={mobile?'mt-2 text-sm text-white/75':'text-white/75'}>
  {mobile&&<span className="mr-2">Attendance</span>}
  {controls.editing&&guestRef?<select
   aria-label={`Attendance for ${guest.firstName} ${guest.lastName}`}
   className="min-h-10 max-w-full rounded-lg border border-white/20 bg-[#102630] px-2 text-sm text-white"
   value={status}
   disabled={controls.busy}
   onChange={e=>controls.save(guestRef,e.currentTarget.value as AttendanceStatus)}
  >{Object.entries(attendanceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
  :controls.report?attendanceLabels[status]:'—'}
 </div>;
}

function GuestTable({rows,meeting,attendance,anonymised}:{anonymised?:boolean;rows:SponsorGuest[];meeting:MeetingControls;attendance?:AttendanceControls}){
 const registered=(value:string)=>{
  const at=Date.parse(value);
  return Number.isFinite(at)?new Date(at).toLocaleString('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'}):'Not supplied';
 };
 return <><div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#122630] sm:hidden">{rows.map((r,i)=><article key={i} className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-5 last:border-0"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{anonymised?<span className="inline-block h-4 w-32 rounded bg-slate-500/60" role="img" aria-label="Registrant name hidden"/>:<>{r.firstName} {r.lastName}</>}</span></div><p className="mt-1 text-sm text-white/70">{r.jobTitle||"Not supplied"}</p><p className="mt-1 text-xs text-white/50">{r.company||"Not supplied"} · {registered(r.registeredAt)}</p><MeetingCheckbox guest={r} controls={meeting}/>{attendance&&<GuestAttendance guest={r} controls={attendance} ambiguous={!!r.guestRef&&meeting.unavailable.has(r.guestRef)} mobile/>}</div><div className="shrink-0"><LinkedInProfileLink value={r.linkedin??""} compact/></div></article>)}</div><div className="hidden sm:block mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#19333f] text-white/75"><tr>{['Name & role','Organisation','Registered','LinkedIn','Connect',...(attendance?['Attendance']:[])].map(h=><th key={h} scope="col" className="px-6 py-5 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-t border-white/10"><td className="px-6 py-6"><div className="flex flex-wrap items-center gap-3"><span className="font-semibold">{anonymised?<span className="inline-block h-4 w-32 rounded bg-slate-500/60" role="img" aria-label="Registrant name hidden"/>:<>{r.firstName} {r.lastName}</>}</span></div><p className="mt-2 text-white/60">{r.jobTitle||'Not supplied'}</p></td><td className="px-6 py-6 text-white/80">{r.company||'Not supplied'}</td><td className="whitespace-nowrap px-6 py-6 text-white/60">{registered(r.registeredAt)}</td><td className="px-6 py-6"><LinkedInProfileLink value={r.linkedin??''} compact/></td><td className="px-6 py-6"><MeetingCheckbox guest={r} controls={meeting}/></td>{attendance&&<td className="px-6 py-6"><GuestAttendance guest={r} controls={attendance} ambiguous={!!r.guestRef&&meeting.unavailable.has(r.guestRef)}/></td>}</tr>)}</tbody></table></div></>;
}
// All rows are projected by the authenticated backend, with corrected details preferred.
type ReportingEvent={
 name:string;
 date:string;
 venue:string;
 capacity:number;
 endsAt:string;
 terms:string[];
 downloadFilename:string;
};

export default function SponsorReportDashboard({anonymised=false,report,loadEventbrite,loadMarketing,loadDownload,gallery,marketing,meeting,attendance,event}:{event?:ReportingEvent;anonymised?:boolean;attendance?:AttendanceAccess;meeting?:{load:()=>Promise<string[]>;save:(guest:string,selected:boolean)=>Promise<string[]>};marketing?:GalleryAccess;gallery?:GalleryAccess;report:SponsorState;loadEventbrite:()=>Promise<EventbriteReport>;loadMarketing?:(file:MarketingFile)=>Promise<string>;loadDownload?:()=>Promise<{rows:SponsorGuest[]}>}){
 const [meetingSelected,setMeetingSelected]=useState<string[]>([]),[meetingReady,setMeetingReady]=useState(false),[meetingBusy,setMeetingBusy]=useState(false),[meetingError,setMeetingError]=useState(''),[meetingStatus,setMeetingStatus]=useState('');
 useEffect(()=>{let active=true;if(meeting)meeting.load().then(value=>{if(active){setMeetingSelected(value);setMeetingReady(true);}}).catch(()=>{if(active)setMeetingError('Your saved selections could not be loaded. Refresh or sign in again before selecting guests.');});return()=>{active=false;};},[]);
 async function toggleMeeting(ref:string,checked:boolean){if(!meeting||meetingBusy)return;setMeetingBusy(true);setMeetingError('');setMeetingStatus('');try{setMeetingSelected(await meeting.save(ref,checked));setMeetingStatus(checked?'Invitation suggestion saved.':'Invitation suggestion removed.');}catch(e){setMeetingError(e instanceof Error?e.message:'Selection could not be saved. Please try again.');}finally{setMeetingBusy(false);}}
 const [attendanceReport,setAttendanceReport]=useState<AttendanceReport|null>(null);
 const [attendanceError,setAttendanceError]=useState('');
 const [attendanceRefreshError,setAttendanceRefreshError]=useState(false);
 const [attendanceStatus,setAttendanceStatus]=useState('');
 const attendanceSaving=useRef(false);
 const attendanceRevision=useRef(0);
 const [attendanceBusy,setAttendanceBusy]=useState(false);
 const [attendanceClosed,setAttendanceClosed]=useState(false);
 useEffect(()=>{
  if(!attendance)return;
  let active=true;
  async function refresh(){
   if(attendanceSaving.current)return;
   const revision=attendanceRevision.current;
   try{
    const next=await attendance.load();
    if(active&&revision===attendanceRevision.current){setAttendanceReport(next);setAttendanceRefreshError(false);}
   }catch{
    if(active&&revision===attendanceRevision.current)setAttendanceRefreshError(true);
   }
  }
  void refresh();
  const timer=setInterval(()=>void refresh(),30000);
  return()=>{active=false;clearInterval(timer);};
 },[]);
 const closesAt=attendanceReport?.closesAt;
 useEffect(()=>{
  if(!closesAt)return;
  const remaining=Date.parse(closesAt)-Date.now();
  if(remaining<=0){setAttendanceClosed(true);return;}
  const timer=setTimeout(()=>setAttendanceClosed(true),remaining);
  return()=>clearTimeout(timer);
 },[closesAt]);
 const editing=!!attendance?.save&&!!closesAt&&!attendanceClosed&&Date.parse(closesAt)>Date.now();
 async function saveAttendance(guest:string,status:AttendanceStatus){
  if(!attendance?.save||!editing||attendanceSaving.current)return;
  attendanceSaving.current=true;
  attendanceRevision.current++;
  setAttendanceBusy(true);setAttendanceError('');setAttendanceStatus('');
  try{
   setAttendanceReport(await attendance.save(guest,status));
   setAttendanceRefreshError(false);
   setAttendanceStatus(event?'Attendance status saved.':'Shared attendance status saved.');
  }catch(error){
   setAttendanceError(error instanceof Error?error.message:'Attendance could not be saved. Try again.');
  }finally{
   attendanceSaving.current=false;
   setAttendanceBusy(false);
  }
 }
 const [data,setData]=useState<EventbriteReport|null>(null),[error,setError]=useState('');
 const [downloadBusy,setDownloadBusy]=useState(false),[downloadError,setDownloadError]=useState('');
 const [now,setNow]=useState(Date.now()),[tab,setTab]=useState('report'),[query,setQuery]=useState('');
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{let active=true;const refresh=()=>loadEventbrite().then(r=>{if(active){setData(r);setError('');}}).catch(()=>{if(active){setData(null);setError('Registrants could not be loaded. Please try again or sign in again.');}});void refresh();const timer=setInterval(()=>void refresh(),60000);return()=>{active=false;clearInterval(timer);};},[]);
 const [showTerms,setShowTerms]=useState(false);
 const [listMode,setListMode]=useState<'all'|'recent'|AttendanceStatus>('all'),[level,setLevel]=useState<SeniorityGroup|'all'>('all'),[organisation,setOrganisation]=useState(''),[showAll,setShowAll]=useState(false);
 const listRef=useRef<HTMLElement>(null),attendanceRef=useRef<HTMLDivElement>(null),organisationRef=useRef<HTMLSelectElement>(null);
 const eventName=event?.name??'OFF AIR';
 const eventTerms=event?.terms??portalTerms;
 const preEvent=!!event&&now<Date.parse(event.endsAt);
 const reportRows=event&&!data?.syncedAt?null:data?.rows??null;
 const guests=reportRows??[];
 const refs=guests.map(g=>g.guestRef).filter((r):r is string=>!!r);
 const meetingControls:MeetingControls={selected:meetingSelected,busy:meetingBusy,ready:meetingReady,unavailable:new Set(refs.filter((r,i)=>refs.indexOf(r)!==i)),toggle:(ref,checked)=>void toggleMeeting(ref,checked)};
 const matches=(r:SponsorGuest)=>[r.firstName,r.lastName,r.company,r.jobTitle,r.linkedin??''].join(' ').toLowerCase().includes(query.trim().toLowerCase());
 const statusFor=(guest:SponsorGuest):AttendanceStatus=>guest.guestRef&&!meetingControls.unavailable.has(guest.guestRef)
  ?attendanceReport?.statuses[guest.guestRef]??'unconfirmed':'unconfirmed';
 const attendedGuests=attendanceReport?guests.filter(guest=>statusFor(guest)==='attended'):[];
 const listRows=listMode==='recent'?recentRegistrations(guests,now):listMode==='all'?guests:guests.filter(guest=>statusFor(guest)===listMode);
 const rows=listRows.filter(r=>matches(r)&&(level==='all'||seniorityGroup(r.jobTitle)===level)&&(!organisation||r.company.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()===organisation.toLowerCase())),downloadsOpen=event?(!preEvent&&now<Date.parse(event.endsAt)+21*86400000):guestListDownloadsAvailable(new Date(now));
 const companies=organisations(guests),visibleRows=showAll||listMode==='attended'?rows:rows.slice(0,6);
 useEffect(()=>setShowAll(false),[query,listMode,level,organisation]);
 const goToList=()=>requestAnimationFrame(()=>listRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));
 function showAttendees(){
  setListMode('attended');setLevel('all');setOrganisation('');setQuery('');goToList();
 }
 async function download(){
  if(!loadDownload)return;setDownloadBusy(true);setDownloadError('');
  try{const exported=await loadDownload();
  const cell=(s:string)=>'"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';
  const csv=[['First name','Last name','Company','Job title','LinkedIn URL'],...exported.rows.map(r=>[r.firstName,r.lastName,r.company,r.jobTitle,r.linkedin??''])].map(row=>row.map(cell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=event?.downloadFilename??'OFF_AIR_Registrants.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setDownloadError(e instanceof Error?e.message:'Report download failed.');}finally{setDownloadBusy(false);}
 }
 return <>{event?<section className="py-7 sm:py-12"><h2 className="font-display text-3xl">{event.name} report</h2><p className="mt-3 text-white/70">{event.date} · {event.venue}</p></section>:<><PartnerEventHero now={now}/><PartnerEventProducers/></>}
 <Tabs className="partner-resource-tabs" value={tab} onValueChange={setTab}><TabsList aria-label="Partner resources" className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-white/20 bg-[#122630] p-2">{[['report',preEvent?'Registrants':'Attendance report'],['event','Event information'],['materials','Marketing & gallery']].map(([id,label])=><TabsTrigger key={id} value={id} className="min-h-14 flex-1 rounded-lg border border-white/15 px-4 py-4 text-base font-semibold sm:px-6 sm:text-lg text-white/85 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-[#071b23] data-[state=active]:shadow-none">{label}</TabsTrigger>)}</TabsList>
 <TabsContent value="report" className="mt-0">
 {attendance&&!preEvent&&<aside aria-label="Attendance update" className="mt-6 rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-4">
  <p className="text-lg font-semibold text-amber-100">Final attendance numbers are being updated</p>
  <p className="mt-1 text-sm text-amber-100/85">The totals below are provisional while check-ins and sponsor updates are being reconciled.</p>
 </aside>}
 {event&&preEvent?<PreEventOverview rows={reportRows} capacity={event.capacity} onRecent={()=>{setListMode('recent');setLevel('all');setOrganisation('');setQuery('');goToList();}}/>
  :<PartnerEventOverview rows={reportRows} eventName={eventName} attendedCount={reportRows&&attendanceReport?attendedGuests.length:null} onWhoAttended={attendanceReport&&reportRows?showAttendees:undefined} onAttendance={()=>attendanceRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}/>}
 <PartnerAudienceProfile rows={attendance&&!preEvent?(reportRows&&attendanceReport?attendedGuests:null):reportRows} attendees={!!attendance&&!preEvent} title={preEvent?'Who’s coming':undefined} onOrganisation={name=>{setOrganisation(name);setLevel('all');setListMode(attendance&&!preEvent?'attended':'all');setQuery('');goToList();if(!name)requestAnimationFrame(()=>organisationRef.current?.focus());}}/>
 <section ref={listRef} id="registrants" className="mt-12 scroll-mt-28 lg:scroll-mt-48"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold">{listMode==='attended'?'Who attended':listMode==='recent'?'New registrants':'Registrants'} <span className="font-normal text-white/55">{reportRows?listRows.length:'—'}</span></h2>{data?.syncedAt&&<p className="text-xs text-white/50">Updated {new Date(data.syncedAt).toLocaleString('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'})}</p>}</div>
 <div className="partner-list-filters mt-6 flex flex-wrap items-center gap-3"><label className="flex min-w-[200px] flex-1 items-center gap-3 rounded-lg border border-white/20 bg-white/[0.02] px-4"><Search size={18} className="text-white/40" aria-hidden="true"/><span className="sr-only">Search registrants</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, company or role" className="min-h-12 w-full bg-transparent outline-none placeholder:text-white/40"/></label><div className="flex gap-2">{preEvent&&listMode==='recent'&&<button type="button" className="min-h-11 text-primary underline" onClick={()=>setListMode('all')}>Show all registrants</button>}
 {attendanceReport&&!preEvent&&<label className="flex items-center gap-2 text-xs text-white/75">Attendance
  <select value={listMode} onChange={e=>setListMode(e.currentTarget.value as 'all'|AttendanceStatus)} className="min-h-12 rounded-lg border border-white/20 bg-[#102630] px-3 text-sm text-white">
   <option value="all">All statuses</option>
   {Object.entries(attendanceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
  </select>
 </label>}</div><label className="flex items-center gap-2 text-xs text-white/55">Seniority<select value={level} onChange={e=>setLevel(e.target.value as SeniorityGroup|'all')} className="min-h-12 max-w-[190px] rounded-lg border border-white/20 bg-[#102630] px-3 text-sm text-white"><option value="all">All levels</option>{seniorityGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label><label className="sr-only" htmlFor="organisation-filter">Filter by organisation</label><select ref={organisationRef} id="organisation-filter" value={organisation} onChange={e=>setOrganisation(e.target.value)} className="min-h-12 max-w-[190px] rounded-lg border border-white/20 bg-[#102630] px-3 text-sm text-white"><option value="">All organisations</option>{companies.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select>{downloadsOpen&&<Button variant="outline" onClick={download} disabled={!guests.length||!loadDownload||downloadBusy}><Download className="mr-2 h-4 w-4"/>{downloadBusy?'Preparing…':'Download registrants CSV'}</Button>}</div>
 <p className="mt-4 text-xs text-white/55">Suggest a guest for The Media Collective to consider for a future event. Ticking the box saves your suggestion for review.{!meeting&&' Selections are disabled in owner preview.'}</p>{meetingError&&<p role="alert" className="mt-3 text-amber-200">{meetingError}</p>}{meetingStatus&&<p role="status" className="mt-3 text-sm text-primary">{meetingStatus}</p>}
 {attendance?.save&&!preEvent&&closesAt&&<p className="mt-4 text-sm text-white/70">{editing
  ?`${event?'Your sponsor team':'Approved sponsors'} can update attendance until ${new Date(closesAt).toLocaleString('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'})} (UK time).`
  :'Attendance editing has closed. Saved statuses are read-only.'}</p>}
 {!preEvent&&attendanceRefreshError&&<p role="status" className="mt-3 text-amber-200">Attendance could not be refreshed. The report will retry automatically.</p>}
 {!preEvent&&attendanceError&&<p role="alert" className="mt-3 text-amber-200">{attendanceError}</p>}
 {attendanceStatus&&<p role="status" className="mt-3 text-primary">{attendanceStatus}</p>}
 {downloadError&&<p role="alert" className="my-4 text-amber-200">{downloadError}</p>}{error?<p role="alert" className="my-5 text-amber-200">{error}</p>:!data?<p role="status" className="my-5">Loading registrants…</p>:!reportRows?<p className="my-5 text-white/65">No registration list has been published for this event.</p>:<><GuestTable anonymised={anonymised} rows={visibleRows} meeting={meetingControls} attendance={attendance&&!preEvent?{report:attendanceReport,editing,busy:attendanceBusy,save:(guest,status)=>void saveAttendance(guest,status)}:undefined}/><div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50"><p className="partner-show-rows">Showing {visibleRows.length} of {rows.length} {listMode==='attended'?'attendees':'registrants'}{rows.length>visibleRows.length&&<> · <button className="min-h-10 text-primary underline" onClick={()=>setShowAll(true)}>Show all</button></>}{listMode!=='attended'&&showAll&&rows.length>6&&<> · <button className="min-h-10 text-primary underline" onClick={()=>setShowAll(false)}>Show fewer</button></>}</p><p>Use guest details only for {eventName} communications · <button className="text-primary underline" onClick={()=>setShowTerms(true)}>Portal terms</button></p></div>{!rows.length&&<p className="mt-4 text-sm text-white/60">No registrants match these filters.</p>}</>}
 </section>{!preEvent&&<div ref={attendanceRef} className="scroll-mt-28 lg:scroll-mt-48"><PartnerAttendanceReport rows={reportRows} report={attendanceReport} eventName={eventName} eventDate={event?.date} onWhoAttended={attendanceReport&&reportRows?showAttendees:undefined}/></div>}

 </TabsContent><TabsContent value="event">{event?<section className="my-8 rounded-xl border border-white/15 p-6"><h2 className="font-display text-2xl">Event information</h2><p className="mt-3">{event.date} · {event.venue}</p></section>:<PartnerEventInformation/>}</TabsContent><TabsContent value="materials"><MarketingDownloads load={loadMarketing} gallery={gallery} marketing={marketing} files={event?[]:undefined} eventName={eventName}/></TabsContent></Tabs> <div className="partner-cta my-12 grid gap-5 md:grid-cols-2"><section className="rounded-2xl border border-white/10 bg-[#122630] p-7"><h2 className="font-display text-2xl font-semibold">Promote your partnership</h2><p className="my-5 text-white/65">Logos, social graphics and event images for {eventName}.</p><Button variant="outline" onClick={()=>{setTab('materials');window.scrollTo({top:0,behavior:'smooth'});}}>Marketing & gallery →</Button></section><section className="rounded-2xl border border-white/10 bg-[#122630] p-7"><h2 className="font-display text-2xl font-semibold">Your next partnership</h2><p className="my-5 text-white/65">Talk to Chris about upcoming Media Collective events and sponsorship.</p><Button asChild variant="brand"><a href="https://calendly.com/mediacollective/call-with-chris" target="_blank" rel="noopener noreferrer">Book a call</a></Button></section></div>{showTerms&&<Dialog open onOpenChange={setShowTerms}><DialogContent className="max-h-[85vh] overflow-auto border-white/20 bg-[#102630] text-white"><DialogHeader><DialogTitle>{eventName} portal terms</DialogTitle><DialogDescription className="text-white/60">Use of registrant information and event materials</DialogDescription></DialogHeader><ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-white/75">{eventTerms.map(term=><li key={term}>{term}</li>)}</ul><p className="text-xs text-white/45">Version {report.termsVersion}</p></DialogContent></Dialog>}</>;
}
