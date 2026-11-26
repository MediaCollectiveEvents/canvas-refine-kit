import type {Guest} from './enriched-review';
type Row=Pick<Guest,'firstName'|'lastName'|'email'|'company'|'jobTitle'> & {linkedin?:string;registeredAt?:string};
export function withRegistrationDates(rows:Row[],registrations:{firstName:string;lastName:string;registeredAt:string}[]):Row[]{
 const name=(r:{firstName:string;lastName:string})=>`${r.firstName} ${r.lastName}`.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 const dates=new Map<string,Set<string>>();
 for(const r of registrations){if(!r.registeredAt||!Number.isFinite(Date.parse(r.registeredAt)))continue;const key=name(r),values=dates.get(key)??new Set<string>();values.add(r.registeredAt);dates.set(key,values);}
 return rows.map(r=>{const values=dates.get(name(r));return {...r,registeredAt:r.registeredAt||(values?.size===1?[...values][0]:'')};});
}
export function ownerRegistrantsCsv(rows:Row[]){
 const date=(value?:string)=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value)):'';
 const cell=(value:string)=>{const safe=/^[\s\u0000-\u001f]*[=+\-@]/.test(value)?"'"+value:value;return '"'+safe.replace(/"/g,'""')+'"';};
 return '\uFEFF'+[['First name','Last name','Email','Company','Job title','LinkedIn URL','Registration date (London)'],...rows.map(r=>[r.firstName,r.lastName,r.email??'',r.company,r.jobTitle,r.linkedin??'',date(r.registeredAt)])].map(r=>r.map(cell).join(',')).join('\r\n');
}
