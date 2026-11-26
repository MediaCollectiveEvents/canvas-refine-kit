import {speakerError} from './errors';
import {projectUrl,publishableKey} from '@/lib/sponsor-reports/supabase-connection';
export type SpeakerBio={name:string;company:string;jobTitle:string;companyUrl:string;linkedinUrl:string;bio:string;headshot:string};
export type SpeakerProfile={id:string;events:string[];profile:SpeakerBio;revision:number;status:string;feedback:string;keywords:string;talkingPoints:{id:string;date:string;body:string;createdAt:string}[];published:SpeakerBio|null};
export const emptyBio:SpeakerBio={name:'',company:'',jobTitle:'',companyUrl:'',linkedinUrl:'',bio:'',headshot:''};
export const wordCount=(text:string)=>text.trim()?text.trim().split(/\s+/u).length:0;
export function normalizeBio(p:SpeakerBio):SpeakerBio{
 const canonical=(value:string)=>{const trimmed=value.trim();if(!trimmed)return '';try{return new URL(trimmed).href;}catch{return trimmed;}};
 return {...p,name:p.name.trim(),company:p.company.trim(),jobTitle:p.jobTitle.trim(),bio:p.bio.trim(),companyUrl:canonical(p.companyUrl),linkedinUrl:canonical(p.linkedinUrl)};
}
export function validateDraft(p:SpeakerBio){
 for(const key of Object.keys(emptyBio) as (keyof SpeakerBio)[]){const limit=key==='headshot'?380000:key==='bio'?4000:key.endsWith('Url')?1000:200;if(typeof p[key]!=='string'||p[key].length>limit)throw new Error('A draft field is too long. Shorten it before saving.');}
 if(p.headshot&&!/^data:image\/jpeg;base64,/.test(p.headshot))throw new Error('Upload a JPEG, PNG or WebP headshot.');
}
export function safeSpeakerLink(value:string,linkedin=false){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password)return undefined;if(linkedin&&!/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9%_-]+\/?$/.test(url.href))return undefined;return url.href;}catch{return undefined;}}
export function validateBio(p:SpeakerBio){
 if(!p.name.trim()||!p.company.trim()||!p.jobTitle.trim()||!p.bio.trim())throw new Error('Complete name, company, job title and biography.');
 if(wordCount(p.bio)>120)throw new Error('The biography must be 120 words or fewer.');
 for(const [key,value] of [['Company website',p.companyUrl.trim()],['LinkedIn',p.linkedinUrl.trim()]]){if(!value)continue;let url:URL;try{url=new URL(value);}catch{throw new Error(`${key} must be a full HTTPS URL.`);}if(url.protocol!=='https:'||url.username||url.password)throw new Error(`${key} must be a full HTTPS URL.`);if(key==='LinkedIn'&&!/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9%_-]+\/?$/.test(value))throw new Error('Use a LinkedIn personal profile URL, for example https://www.linkedin.com/in/your-name/.');}
 if(!/^data:image\/jpeg;base64,/.test(p.headshot))throw new Error('Upload a headshot before submitting.');
}
export async function speakerRpc<T>(name:string,body:object):Promise<T>{const r=await fetch(`${projectUrl}/rest/v1/rpc/${name}`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){const error=await r.json().catch(()=>({}));throw new Error(r.status===404?'Speaker profiles are not activated yet.':speakerError(String(error.message??'')));}return r.json();}
// Decode and re-encode locally: no SVG, original metadata or arbitrary uploaded HTML is retained.
export async function headshotFromFile(file:File):Promise<string>{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('Choose a JPEG, PNG or WebP up to 10 MB.');const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();if(!image.width||!image.height||image.width*image.height>40000000)throw new Error('Choose a smaller image (up to 40 megapixels).');const c=document.createElement('canvas');c.width=c.height=480;const side=Math.min(image.width,image.height);c.getContext('2d')!.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,480,480);return c.toDataURL('image/jpeg',.85);}finally{URL.revokeObjectURL(url);}}
