import type {SponsorGuest} from '@/lib/sponsor-reports/guest-list';

export default function PartnerEventOverview({rows,onAttendance,onWhoAttended,attendedCount,eventName='OFF AIR'}:{eventName?:string;rows:SponsorGuest[]|null;attendedCount:number|null;onAttendance:()=>void;onWhoAttended?:()=>void}){
 return <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#122630] p-6 sm:p-8">
  <div className="flex flex-wrap gap-x-10 gap-y-4">
   {attendedCount!==null&&<p className="text-white/75"><strong className="mr-3 font-display text-4xl font-semibold text-white">{attendedCount}</strong>attended</p>}
   <p className="text-white/75"><strong className="mr-3 font-display text-4xl font-semibold text-white">{rows?.length??'—'}</strong>people registered for {eventName}</p>
  </div>
  <div className="flex flex-wrap items-center gap-5">
   {onWhoAttended&&<button type="button" onClick={onWhoAttended} className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-[#071b23]">Who attended</button>}
   <button type="button" onClick={onAttendance} className="min-h-10 text-sm font-semibold text-primary underline underline-offset-4">View attendance summary</button>
  </div>
 </section>;
}
