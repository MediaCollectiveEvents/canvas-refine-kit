import PartnerAudienceProfile from './PartnerAudienceProfile';
import {recentRegistrations,type SponsorGuest} from '@/lib/sponsor-reports/guest-list';

export function PreEventOverview({rows,capacity,onRecent}:{rows:SponsorGuest[]|null;capacity:number;onRecent?:()=>void}){
 const count=rows?.length;
 const expected=count===undefined?undefined:Math.round(count*0.8);
 const recent=rows?recentRegistrations(rows).length:null;
 return <div className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
   <section className="rounded-2xl border border-white/10 bg-[#122630] p-6 sm:p-8">
    <h2 className="font-display text-xl font-semibold">Registrations</h2>
    <p className="mt-4 text-white/75"><strong className="mr-3 font-display text-4xl font-semibold text-white">{count??'—'}</strong>of {capacity} places registered</p>
    {count===undefined?<p className="mt-4 text-sm text-white/65">Registration data hasn’t been connected for this event.</p>:<>
     <progress className="mt-5 h-3 w-full accent-primary" aria-label="Places registered" max={capacity} value={Math.min(capacity,count)}/>
     <p className="mt-4 text-sm text-white/70">Estimated turnout is {expected} guests, based on 80% of registrations.</p>
    </>}
   </section>
   <section className="rounded-2xl border border-white/10 bg-[#122630] p-6 sm:p-8">
    <h2 className="font-display text-xl font-semibold">New in the last 3 days</h2>
    <p className="mt-4 font-display text-4xl font-semibold">{rows?recent:'—'}</p>
    {rows&&<button type="button" className="mt-4 min-h-10 text-sm text-primary underline" onClick={onRecent}>See who’s new</button>}
   </section>
  </div>;
}

export default function PreEventReport({capacity}:{capacity:number}){
 return <>
  <PreEventOverview rows={null} capacity={capacity}/>
  <PartnerAudienceProfile rows={null} title="Who’s coming"/>
 </>;
}
