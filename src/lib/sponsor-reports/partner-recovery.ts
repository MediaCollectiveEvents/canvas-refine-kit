import {projectUrl,publishableKey} from './supabase-connection';
export const recoveryNotice='If this email has a portal account, a password-reset link will be sent. Check your inbox and spam folder.';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const headers={apikey:publishableKey,'Content-Type':'application/json'};
export async function requestPartnerReset(email:string,partner:string){
 if(!uuid.test(partner))throw new Error('Open the private event link supplied by Chris, then request a reset.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())||email.length>254)throw new Error('Enter your portal email address.');
 const redirect=new URL('https://www.mediacollective.events/partner-portal/partner-password-reset');redirect.searchParams.set('partner',partner);
 const response=await fetch(`${projectUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirect.href)}`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers,body:JSON.stringify({email:email.trim()})});
 if(!response.ok){if(response.status===429)throw new Error('Please wait before requesting another reset link.');throw new Error('The reset email could not be sent. Please contact Chris at chris@mediacollective.events for help.');}
}
export class PartnerRecoveryClient{
 private token:string|null=null;private partner='';private verification:Promise<void>|null=null;
 verify(fragment:string,partner:string){if(this.verification)return this.verification;this.verification=(async()=>{
  const values=new URLSearchParams(fragment.replace(/^#/,''));const token=values.get('access_token')??'';
  if(values.get('type')!=='recovery'||!uuid.test(partner)||!/^eyJ[A-Za-z0-9_.-]{50,8000}$/.test(token))throw new Error('This reset link is missing, invalid or expired. Request a new link from the partner sign-in page.');
  const response=await fetch(`${projectUrl}/auth/v1/user`,{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{...headers,Authorization:`Bearer ${token}`}});
  if(!response.ok)throw new Error('This reset link has expired or has already been used. Request a new link.');
  const user=await response.json();if(typeof user.id!=='string'||!user.email_confirmed_at)throw new Error('This account could not be verified.');
  this.token=token;this.partner=partner;try{await this.checkAccess();}catch{this.token=null;throw new Error('This account does not have active access to this event. Please contact Chris.');}
 })();return this.verification;}
 private async checkAccess(){const r=await fetch(`${projectUrl}/rest/v1/rpc/portal_sponsor_state`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{...headers,Authorization:`Bearer ${this.token}`},body:JSON.stringify({p_event:'off-air',p_sponsor:this.partner})});if(!r.ok)throw new Error('Access unavailable.');}
 async setPassword(password:string){if(!this.token)throw new Error('Open a valid reset link first.');if(password.length<12)throw new Error('Use at least 12 characters.');await this.checkAccess();const authHeaders={...headers,Authorization:`Bearer ${this.token}`};const response=await fetch(`${projectUrl}/auth/v1/user`,{method:'PUT',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:authHeaders,body:JSON.stringify({password})});if(!response.ok)throw new Error('Password was not saved. Try a stronger password or request a new reset link.');this.token=null;try{const logout=await fetch(`${projectUrl}/auth/v1/logout?scope=global`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:authHeaders});return{signedOut:logout.ok};}catch{return{signedOut:false};}}
}
