import { projectUrl, publishableKey } from './supabase-connection';
// One in-memory recovery session. No passwords or bearer tokens enter browser storage.
export class OwnerRecoveryClient {
 private verification:Promise<void>|null=null;
 private accessToken:string|null=null;
 verify(tokenHash:string){
  if(this.verification)return this.verification;
  this.verification=(async()=>{
   if(!/^[A-Za-z0-9_-]{20,200}$/.test(tokenHash))throw new Error('This reset link is missing or invalid.');
   const r=await fetch(`${projectUrl}/auth/v1/verify`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify({token_hash:tokenHash,type:'recovery'})});
   const value=await r.json();
   if(!r.ok||typeof value.access_token!=='string')throw new Error('This reset link has expired or has already been used.');
   if(value.user?.id!=='50a047a3-600d-47ed-941f-140fd7058396'||value.user?.email?.toLowerCase()!=='chris@mediacollective.events')throw new Error('This link is not for your portal owner account.');
   this.accessToken=value.access_token;
  })();return this.verification;
 }
 async setPassword(password:string){
  if(!this.accessToken)throw new Error('Open a valid owner reset link first.');
  if(password.length<12)throw new Error('Choose a password with at least 12 characters.');
  const token=this.accessToken;
  const headers={apikey:publishableKey,'Content-Type':'application/json',Authorization:`Bearer ${token}`};
  const r=await fetch(`${projectUrl}/auth/v1/user`,{method:'PUT',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers,body:JSON.stringify({password})});
  if(!r.ok){const value=await r.json();throw new Error(value.code==='weak_password'?'Supabase rejected this password as too weak. Choose a stronger password.':'Password was not updated. Check the reset link and try again.');}
  this.accessToken=null;
  try{const logout=await fetch(`${projectUrl}/auth/v1/logout?scope=global`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers});return {signedOut:logout.ok};}catch{return {signedOut:false};}
 }
}
