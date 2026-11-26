import collective from '@/assets/logo.png';
import faultline from '@/assets/event-producers/curated-faultline.png';
import decodeTV from '@/assets/event-producers/curated-decodetv.jpg';
import supporters from '@/assets/event-producers/off-air-supporters.png';
import SignalShiftMediaPartner from './SignalShiftMediaPartner';

export default function PartnerEventProducers(){
 return <section aria-label="Event producers and sponsors" className="mb-6 rounded-2xl border border-white/10 bg-[#122630] p-4 sm:p-5">
  <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
   <div><h2 className="text-xs font-semibold text-white/75">Curated and produced by</h2><div className="mt-3 grid grid-cols-3 gap-2">
    <div className="flex h-20 items-center justify-center rounded-lg bg-white p-2"><img src={collective} alt="The Media Collective" className="max-h-16 max-w-full object-contain brightness-0" width="800" height="500"/></div>
    <div className="flex h-20 items-center justify-center rounded-lg bg-white p-2"><img src={faultline} alt="Faultline" className="max-h-16 max-w-full object-contain" width="633" height="247"/></div>
    <div className="flex h-20 items-center justify-center rounded-lg bg-white p-2"><img src={decodeTV} alt="decodeTV" className="max-h-16 max-w-full object-contain" width="395" height="119"/></div>
   </div></div>
   <div><h2 className="text-xs font-semibold text-white/75">Supported by</h2><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Appear',30],['Ateme',330],['Norsk',630],['Waldo',930]].map(([name,x])=><div key={name} className="flex h-16 items-center justify-center rounded-lg bg-white p-2 sm:h-20"><svg role="img" aria-label={String(name)} viewBox={`${x} 75 280 85`} width="280" height="85" preserveAspectRatio="xMidYMid meet" className="block h-auto max-h-full w-full"><image href={supporters} width="1200" height="200"/></svg></div>)}</div></div>
  </div>
  <SignalShiftMediaPartner/>
 </section>;
}
