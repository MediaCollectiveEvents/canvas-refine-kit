import {projectUrl,publishableKey} from './supabase-connection';
export type Invitation={token:string;type:string;email:string;user:string;sponsor:string};
export class SponsorActivationClient{
 private verification:Promise<void>|null=null;private accessToken:string|null=null;private sponsor='';
 verify(invite:Invitation){if(this.verification)return this.verification;this.verification=(async()=>{
  const uuid=/^[a-f0-9-]{36}$/i;
  if(!/^[A-Za-z0-9_-]{20,200}$/.test(invite.token)||!['invite','magiclink'].includes(invite.type)||!uuid.test(invite.user)||!uuid.test(invite.sponsor))throw new Error('This setup link is missing or invalid.');
  const r=await fetch(`${projectUrl}/auth/v1/verify`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify({token_hash:invite.token,type:invite.type})});
  const value=await r.json();if(!r.ok||typeof value.access_token!=='string'||value.user?.id!==invite.user||value.user?.email?.toLowerCase()!==invite.email.toLowerCase())throw new Error('This setup link has expired, was already used, or belongs to another account. Ask Chris for a new link.');
  this.accessToken=value.access_token;this.sponsor=invite.sponsor;
  try{await this.checkAccess();}catch{this.accessToken=null;throw new Error('This sponsor access has expired or been revoked.');}
 })();return this.verification;}
 private async checkAccess(){const r=await fetch(`${projectUrl}/rest/v1/rpc/portal_sponsor_state`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,Authorization:`Bearer ${this.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({p_event:'off-air',p_sponsor:this.sponsor})});if(!r.ok)throw new Error('Access unavailable.');}
 async setPassword(password:string){if(!this.accessToken)throw new Error('Open a valid setup link first.');if(password.length<12)throw new Error('Use at least 12 characters.');await this.checkAccess();const headers={apikey:publishableKey,Authorization:`Bearer ${this.accessToken}`,'Content-Type':'application/json'};const r=await fetch(`${projectUrl}/auth/v1/user`,{method:'PUT',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers,body:JSON.stringify({password})});if(!r.ok)throw new Error('Password was not saved. Try a stronger password.');this.accessToken=null;try{await fetch(`${projectUrl}/auth/v1/logout?scope=global`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers});}catch{/* Password saved; session expiry still enforced server-side. */}}
}
