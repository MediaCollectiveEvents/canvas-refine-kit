import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import SponsorReportDashboard from './SponsorReportDashboard';
import type {EventbriteReport,SponsorState,FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';

// Whitelist fields: names, emails, profile links and guest identifiers never reach the demo renderer.
export function anonymiseRegistrations(raw:EventbriteReport):EventbriteReport {
 return {syncedAt:raw.syncedAt,canViewEmail:false,rows:raw.rows.map(r=>({
 firstName:'Name hidden',lastName:'',company:r.company,jobTitle:r.jobTitle,
 registeredAt:r.registeredAt,ticketType:'',status:'',
 }))};
}
export default function OwnerAnonymisedDemo({client,onClose}:{client:FrankfurtOwnerClient;onClose:()=>void}){
 const [raw,setRaw]=useState<EventbriteReport|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;client.sponsorPreview().then(value=>{if(active)setRaw(anonymiseRegistrations(value.raw));}).catch(()=>{if(active)setError('Preview could not be loaded. Please sign in again.');});return()=>{active=false;};},[client]);
 const report:SponsorState={sponsor:'Partner preview',event:'off-air',accepted:true,termsVersion:'Demonstration only',canViewEmail:false,rows:[]};
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/20 bg-[#101d24] text-white sm:max-w-[95vw]"><DialogHeader><DialogTitle>Anonymised EventHub demo</DialogTitle><DialogDescription className="text-white/75">Names are hidden. Companies, job titles and registration statistics remain visible. Emails and LinkedIn links are excluded. Downloads, uploads and connection requests are disabled.</DialogDescription></DialogHeader>{error?<p role="alert">{error}</p>:raw?<SponsorReportDashboard anonymised report={report} loadEventbrite={async()=>raw}/>:<p role="status">Loading anonymised view…</p>}</DialogContent></Dialog>;
}
