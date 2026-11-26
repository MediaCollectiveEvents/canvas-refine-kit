export type WalkInFields={firstName:string;lastName:string;company:string;email:string};
export type WalkInRow=WalkInFields&{id:string;source:'walk_in';registeredAt:string;updatedAt:string;deletedAt:string|null;revision:number;existingRegistration:boolean};
export type WalkInSettings={enabled:boolean;opensAt:string;closesAt:string;privacyVersion:string};
export type EventUpdateSignup={id:string;email:string;requestedAt:string;consentVersion:string;status:string};
export type WalkInState={settings:WalkInSettings;rows:WalkInRow[];updates?:EventUpdateSignup[]};
export const blankWalkIn=():WalkInFields=>({firstName:'',lastName:'',company:'',email:''});
export function normalizeSignupEmail(value:unknown){if(typeof value!=='string')throw Error('Enter a valid email address.');const email=value.trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\u0000-\u001f\u007f]/.test(email))throw Error('Enter a valid email address.');return email;}
export function normalizeWalkIn(input:unknown):WalkInFields{
 if(!input||typeof input!=='object')throw Error('Enter your registration details.');
 const value=input as Record<string,unknown>,out=blankWalkIn();
 for(const key of Object.keys(out) as (keyof WalkInFields)[]){if(typeof value[key]!=='string')throw Error('Check the registration fields.');out[key]=value[key].trim();if(/[\u0000-\u001f\u007f]/.test(out[key]))throw Error('Remove unsupported characters from your details.');}
 if(!out.firstName||out.firstName.length>100)throw Error('Enter a first name of up to 100 characters.');
 if(!out.lastName||out.lastName.length>100)throw Error('Enter a last name of up to 100 characters.');
 if(out.company.length>200)throw Error('Company must be 200 characters or fewer.');
 out.email=out.email.toLowerCase();if(out.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email))throw Error('Enter a valid email address.');
 return out;
}
export const walkInPrivacyVersion='off-air-walk-in-v2';
export const walkInPrivacy='The Media Collective, operated by Modula Media Ltd, uses these details to register your attendance and manage communications about OFF AIR. Your details may be shared with OFF AIR event partners for communications related to this event, subject to your permissions. This does not subscribe you to future-event marketing emails.';
export function walkInCsv(rows:WalkInRow[]){const cell=(s:string)=>'"'+(/^[\s\u0000-\u001f]*[=+@-]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';return '\uFEFF'+[['First name','Last name','Company','Email','Registration date (UTC)','Source','Status'],...rows.map(r=>[r.firstName,r.lastName,r.company,r.email,r.registeredAt,r.source,r.existingRegistration?'Existing event registration requires review':'Walk-in'])].map(r=>r.map(cell).join(',')).join('\r\n');}

export const eventUpdatesConsent='I would like to receive emails from The Media Collective about future events. I can unsubscribe at any time.';
export function eventUpdateSignupsCsv(rows:EventUpdateSignup[]){const cell=(s:string)=>'"'+(/^[\s\u0000-\u001f]*[=+@-]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';return '\uFEFF'+[['Email','Requested at (UTC)','Consent version','Consent wording','Status','Source'],...rows.map(r=>[r.email,r.requestedAt,r.consentVersion,eventUpdatesConsent,r.status,'walk_in_kiosk'])].map(r=>r.map(cell).join(',')).join('\r\n');}
