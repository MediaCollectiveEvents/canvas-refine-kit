export type SponsorGuest={firstName:string;lastName:string;company:string;jobTitle:string;linkedin?:string;registeredAt:string;guestRef?:string|null};
export function recentRegistrations(rows:SponsorGuest[],now:number=Date.now()):SponsorGuest[]{
 const cutoff=now-72*60*60*1000;
 return rows.filter(r=>{const at=Date.parse(r.registeredAt);return Number.isFinite(at)&&at>=cutoff&&at<=now;}).sort((a,b)=>Date.parse(b.registeredAt)-Date.parse(a.registeredAt));
}
export function uniqueCompanyCount(rows:Pick<SponsorGuest,'company'>[]){
 const missing=new Set(['','n/a','na','n.a.','not supplied','unknown','none','-','—']);
 return new Set(rows.map(row=>row.company.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()).filter(name=>!missing.has(name))).size;
}
