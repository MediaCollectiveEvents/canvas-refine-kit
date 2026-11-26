import type {SponsorGuest} from './guest-list';
export const seniorityGroups=[{id:'leadership',label:'Board, C-suite & founders',color:'#a6efea'},{id:'director',label:'Directors & VPs',color:'#35c6bd'},{id:'head',label:'Heads of function',color:'#229f98'},{id:'manager',label:'Managers',color:'#187874'},{id:'specialist',label:'Specialists & independents',color:'#537981'},{id:'unknown',label:'To be confirmed',color:'#364d57'}] as const;
export type SeniorityGroup=typeof seniorityGroups[number]['id'];
export function seniorityGroup(title:string):SeniorityGroup{
 const t=title.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 if(!t||/^(n\/?a|unknown|not supplied)$/.test(t))return 'unknown';
 if(/\b(founder|owner|ceo|cto|coo|cfo|cio|cmo|cpo|cro|chief .+ officer)\b/.test(t))return 'leadership';
 if(/\b(chair|chairman|chairwoman|board member|non.executive director)\b/.test(t))return 'leadership';
 if(/\b(vp|svp|evp|avp|vice president|managing director|general manager|director)\b/.test(t)||t==='marketting directot')return 'director';
 if(/\bhead of\b/.test(t))return 'head';
 if(/\bmanager\b/.test(t))return 'manager';
 if(t==='managing editor'||/\b(consultant|partner|supervisor|leader|lead|advisor|ambassador|publisher|assistant)\b/.test(t)&&!/^lead solutions? architect$/.test(t)&&!/^technology business partner\b/.test(t))return 'unknown';
 if(/\b(engineer|architect|developer|producer|editor|journalist|analyst|designer|specialist|expert|reporter|freelance|freelancer)\b/.test(t)||/\b(sales executive|account executive|product owner|technology business partner)\b/.test(t))return 'specialist';
 return 'unknown';
}
export function organisations(rows:SponsorGuest[]){const groups=new Map<string,{name:string;count:number}>();const missing=new Set(['','n/a','na','n.a.','not supplied','unknown','none','-','—']);for(const row of rows){const name=row.company.normalize('NFKC').trim().replace(/\s+/g,' '),key=name.toLowerCase();if(missing.has(key))continue;const found=groups.get(key);if(found)found.count++;else groups.set(key,{name,count:1});}return [...groups.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));}
export function daysUntilEvent(now:number){const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));const [y,m,d]=date.split('-').map(Number);return Math.round((Date.UTC(2026,10,24)-Date.UTC(y,m-1,d))/86400000);}
