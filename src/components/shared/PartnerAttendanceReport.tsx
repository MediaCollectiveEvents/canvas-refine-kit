import {attendanceLabels,type AttendanceReport as AttendanceData,type AttendanceStatus} from '@/lib/sponsor-reports/attendance';
import type {SponsorGuest} from '@/lib/sponsor-reports/guest-list';

export default function PartnerAttendanceReport({rows,report,onWhoAttended,eventName='OFF AIR',eventDate='24 November 2026'}:{eventName?:string;eventDate?:string;rows:SponsorGuest[]|null;report:AttendanceData|null;onWhoAttended?:()=>void}){
 const counts:Record<AttendanceStatus,number>={attended:0,unable_to_attend:0,no_show:0,unconfirmed:0};
 const occurrences=new Map<string,number>();
 for(const {guestRef} of rows??[]){
  if(guestRef)occurrences.set(guestRef,(occurrences.get(guestRef)??0)+1);
 }
 for(const {guestRef} of rows??[]){
  const status=guestRef&&occurrences.get(guestRef)===1?report?.statuses[guestRef]:undefined;
  counts[status??'unconfirmed']++;
 }
 return <section id="attendance-report" className="mt-12 rounded-2xl border border-primary/25 bg-[#102630] p-6 sm:p-9">
  <h2 className="font-display text-2xl font-semibold sm:text-3xl">{eventName} attendance report</h2>
  <p className="mt-4 text-white/70">{eventName} took place on {eventDate}. Attendance statuses reflect Eventbrite check-ins and {eventName==='OFF AIR'?'corrections shared by approved sponsors':'any updates saved by your sponsor team'}.</p>
  {rows&&report&&<dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
   {Object.entries(attendanceLabels).map(([key,label])=><div key={key} className="rounded-xl border border-white/10 p-4">
    <dt className="text-sm text-white/70">{label}</dt>
    <dd className="mt-2 font-display text-2xl font-semibold">{counts[key as AttendanceStatus]}</dd>
   </div>)}
  </dl>}
  {onWhoAttended&&<button type="button" className="mt-5 min-h-10 text-sm font-semibold text-primary underline underline-offset-4" onClick={onWhoAttended}>View who attended</button>}
 </section>;
}
