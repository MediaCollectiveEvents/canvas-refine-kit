import {isEventHubStaging} from '@/lib/event-hub-backend';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import Header from '@/components/layout/Header';
import SponsorPortalFooter from '@/components/shared/SponsorPortalFooter';
import SponsorReportDashboard from '@/components/shared/SponsorReportDashboard';
import PreEventReport from '@/components/shared/PreEventReport';
import PartnerEmailSignIn from '@/components/shared/PartnerEmailSignIn';
import OwnerMfaGate from '@/components/shared/OwnerMfaGate';
import MptsReportManagement from '@/components/shared/MptsReportManagement';
import type {GalleryAccess} from '@/components/shared/EventGallery';
import {Button} from '@/components/ui/button';
import {FrankfurtSponsorClient,type EventbriteReport} from '@/lib/sponsor-reports/supabase-connection';
import {portalDestination} from '@/lib/sponsor-reports/access-routing';
import type {AttendanceReport} from '@/lib/sponsor-reports/attendance';
import type {GalleryImage} from '@/lib/sponsor-reports/gallery';
import {mptsTerms,type MptsState} from '@/lib/sponsor-reports/mpts';
import {events} from '@/content/events.json';
import '@/components/shared/eventhub-mobile.css';

const event=events.find(item=>item.id===5);
const eventDate=event&&new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeZone:'Europe/London'}).format(new Date(event.date));
const capacity=event?.capacity_number??120;
const eventName='MPTS Reception 2027';
const venue=event?`${event.venue}, ${event.location}`:'';
type Session={sponsor:string|null;state:MptsState};

export default function MptsReceptionReport(){
 const client=useRef(new FrankfurtSponsorClient()).current;
 const [params]=useSearchParams();
 const [session,setSession]=useState<Session|null>(null);
 const [ownerGate,setOwnerGate]=useState(false);
 const [useCode,setUseCode]=useState(isEventHubStaging);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [agreed,setAgreed]=useState(false);
 const [reportRefresh,setReportRefresh]=useState(0);
 const [teams,setTeams]=useState<{sponsorId:string;company:string}[]>([]);
 const activeSponsor=session?.sponsor;

 async function logout(){
  setSession(null);setOwnerGate(false);setTeams([]);setAgreed(false);
  try{await client.signOut();}catch{setError('The local session was closed.');}
 }

 useEffect(()=>{
  if(activeSponsor===undefined)return;
  let active=true;
  const timer=setInterval(()=>void client.mptsReport<MptsState>('state',activeSponsor).then(state=>{
   if(active)setSession({sponsor:activeSponsor,state});
  }).catch(()=>{
   if(active){void logout();setError('MPTS access could not be verified. Sign in again.');}
  }),60000);
  return()=>{active=false;clearInterval(timer);};
 },[activeSponsor,client]);

 const signedIn=!!session||ownerGate||teams.length>0;
 useEffect(()=>{
  if(!signedIn)return;
  let timeout:ReturnType<typeof setTimeout>;
  const restart=()=>{clearTimeout(timeout);timeout=setTimeout(()=>void logout(),30*60*1000);};
  restart();
  window.addEventListener('pointerdown',restart);
  window.addEventListener('keydown',restart);
  return()=>{
   clearTimeout(timeout);
   window.removeEventListener('pointerdown',restart);
   window.removeEventListener('keydown',restart);
  };
 },[signedIn]);

 async function openTeam(sponsor:string){
  setSession({sponsor,state:await client.mptsReport<MptsState>('state',sponsor)});
  setTeams([]);
 }

 async function openReport(){
  const destination=await portalDestination({state:()=>client.mptsReport<MptsState>('state')});
  if(destination.kind==='owner'){
   if(!destination.state){setOwnerGate(true);return;}
   setSession({sponsor:null,state:destination.state});
   return;
  }
  const access=await client.mptsReport<{sponsorId:string;company:string}[]>('access');
  const requested=params.get('partner');
  if(requested&&access.some(team=>team.sponsorId===requested)){await openTeam(requested);return;}
  if(access.length===1){await openTeam(access[0].sponsorId);return;}
  if(access.length>1){setTeams(access);return;}
  throw new Error('This account does not have approved access to the MPTS report.');
 }

 async function openOwner(){
  const state=await client.mptsReport<MptsState>('state');
  setOwnerGate(false);setSession({sponsor:null,state});
 }

 async function signIn(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=new FormData(e.currentTarget);
  setBusy(true);setError('');
  try{await client.signIn(String(form.get('email')),String(form.get('password')));await openReport();}
  catch(e){await logout();setError(e instanceof Error?e.message:'Sign-in unavailable.');}
  finally{setBusy(false);}
 }

 async function accept(){
  if(!session||!session.sponsor||!agreed)return;
  setBusy(true);setError('');
  try{
   const state=await client.mptsReport<MptsState>('accept',session.sponsor,{agreed,version:session.state.termsVersion});
   setSession({...session,state});
  }catch(e){setError(e instanceof Error?e.message:'The event terms could not be saved.');}
  finally{setBusy(false);}
 }

 function media(kind:'gallery'|'marketing',sponsor:string|null):GalleryAccess{
  return {
   list:()=>client.mptsMedia<{images:GalleryImage[]}>('list',sponsor,{kind}),
   file:image=>client.galleryFile(image,'mpts-reception-2027'),
   upload:kind==='gallery'||sponsor===null?(file,caption)=>client.uploadMptsImage(file,caption,sponsor,kind):undefined,
   remove:sponsor===null?(image,archived)=>client.mptsMedia('archive',null,{id:image.id,archived}).then(()=>undefined):undefined,
  };
 }

 return <div className="eventhub-mobile min-h-screen bg-[#0a1b23] text-white">
  <Header/>
  <main id="main-content" className="site-header-clearance">
   <div className="site-container max-w-6xl px-6 py-12">
    <div className="flex items-center justify-between gap-4">
     <Link to="/eventhub/" className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4">Back to Event Hub</Link>
     {(session||teams.length>0)&&<button className="min-h-11 text-sm underline" onClick={()=>void logout()}>Sign out</button>}
    </div>
    <h1 className="mt-3 font-display text-4xl font-light">{eventName}</h1>
    {event&&<p className="mt-4 text-white/75">{eventDate} · {venue}</p>}
    {error&&<p role="alert" className="mt-5 rounded-lg border border-amber-300/40 p-4 text-amber-200">{error}</p>}
    {ownerGate?<OwnerMfaGate client={client} onReady={openOwner} onSignOut={()=>void logout()}/>
    :teams.length>0?<section className="mt-6 space-y-3"><h2 className="text-xl">Choose a sponsor team</h2>{teams.map(team=><Button key={team.sponsorId} variant="outline" onClick={()=>{setError('');void openTeam(team.sponsorId).catch(e=>setError(e.message));}}>{team.company}</Button>)}</section>
    :!session?<>
     {isEventHubStaging&&<p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75">Use the email approved for the staging rehearsal. <a className="text-primary underline underline-offset-4" href="https://www.mediacollective.events/eventhub/mpts-reception-2027">Open the live MPTS report</a> to use your existing account.</p>}
     {useCode?<PartnerEmailSignIn client={client} onSignedIn={openReport}/>
     :<form onSubmit={signIn} className="mt-8 max-w-lg space-y-5 rounded-xl border border-white/20 p-6">
      <h2 className="font-display text-xl">Sign in to the MPTS report</h2>
      <label className="block">Email<input name="email" type="email" required autoComplete="username" className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3"/></label>
      <label className="block">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3"/></label>
      <Button variant="brand" disabled={busy}>{busy?'Signing in…':'Sign in'}</Button>
     </form>}
     <button type="button" disabled={busy} className="mt-3 min-h-11 text-primary underline" onClick={()=>{setUseCode(!useCode);setError('');}}>{useCode?'Sign in with a password':'First-time sign-in'}</button>
     <PreEventReport capacity={capacity}/>
    </>:!session.state.accepted?<section className="mt-8 max-w-2xl rounded-xl border border-white/20 p-6">
     <h2 className="font-display text-xl">MPTS communication terms</h2>
     <ul className="my-5 list-disc space-y-2 pl-5 text-white/75">{mptsTerms.map(term=><li key={term}>{term}</li>)}</ul>
     <label className="flex items-center gap-3"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>I agree to follow these event terms.</label>
     <Button variant="brand" className="mt-5" disabled={!agreed||busy} onClick={()=>void accept()}>Continue to report</Button>
    </section>:<>
     {session.sponsor===null&&<MptsReportManagement client={client} endsAt={session.state.endsAt} onChanged={()=>setReportRefresh(value=>value+1)}/>}
     <SponsorReportDashboard key={reportRefresh} report={session.state}
      event={{name:eventName,date:eventDate??'',venue,capacity,endsAt:session.state.endsAt,terms:mptsTerms,downloadFilename:'MPTS_Reception_2027_Registrants.csv'}}
      loadEventbrite={()=>client.mptsReport<EventbriteReport>('rows',session.sponsor)}
      loadDownload={()=>client.mptsReport('export',session.sponsor)}
      attendance={{load:()=>client.mptsReport<AttendanceReport>('attendance',session.sponsor),
       save:session.sponsor?(guest,status)=>client.mptsReport('save_attendance',session.sponsor,{guest,status}):undefined}}
      meeting={session.sponsor?{load:()=>client.mptsReport('selections',session.sponsor),
       save:(guest,selected)=>client.mptsReport('save_selection',session.sponsor,{guest,selected})}:undefined}
      gallery={media('gallery',session.sponsor)} marketing={media('marketing',session.sponsor)}/>
    </>}
   </div>
  </main>
  <SponsorPortalFooter compact={!!session?.state.accepted}/>
 </div>;
}
