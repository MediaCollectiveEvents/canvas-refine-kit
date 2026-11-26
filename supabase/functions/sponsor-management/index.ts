// Owner-only provisioning. Administrative key stays in the hosted Edge runtime, never the browser.
const PROJECT='https://qtmbioguefmtwtngbava.supabase.co';
const PUBLIC_KEY='sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz';
export function validateSponsorRequest(value:unknown){
 if(!value||typeof value!=='object')throw new Error('invalid_details');
 const v=value as Record<string,unknown>;
 if(!['create','link','invite'].includes(String(v.action)))throw new Error('invalid_action');
 if(typeof v.email!=='string'||v.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))throw new Error('invalid_email');
 if(v.agreed!==true)throw new Error('approval_required');
 if((v.action==='create'||v.action==='invite')&&(typeof v.company!=='string'||v.company.trim().length<1||v.company.length>200||typeof v.expiresAt!=='string'||!Number.isFinite(Date.parse(v.expiresAt))||Date.parse(v.expiresAt)<=Date.now()||Date.parse(v.expiresAt)>Date.now()+366*86400000))throw new Error('invalid_details');
 return {...v,email:v.email.trim().toLowerCase()};
}
if(typeof Deno!=='undefined')Deno.serve(async(req:Request)=>{
 const publicOrigin=Deno.env.get('PORTAL_PUBLIC_ORIGIN')??'https://www.mediacollective.events';
 const origin=req.headers.get('Origin')??'';
 const allowed=new Set(['http://127.0.0.1:8785','http://localhost:8785','https://mediacollective.events','https://www.mediacollective.events',publicOrigin]);
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Vary':'Origin',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,data:object)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&!allowed.has(origin))return reply(403,{error:'origin_denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
 const bearer=req.headers.get('Authorization')??'';if(!/^Bearer \S+$/.test(bearer))return reply(401,{error:'sign_in_required'});
 async function rpc(name:string,body:object){
  const response=await fetch(`${PROJECT}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:PUBLIC_KEY,Authorization:bearer,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok){const error=await response.json().catch(()=>({}));const message=String(error.message??'');if(response.status===401||response.status===403)throw new Error('owner_access_required');const safe=['owner_account_protected','account_disabled','existing_company_mapping_protected','ambiguous_company','company_disabled','multi_event_company_requires_review','company_access_requires_review','invalid_expiry'];throw new Error(safe.includes(message)?message:'access_save_failed');}
  return response.json();
 }
 try{
  // Every action first validates the owner's live session. No admin key is read before this.
  const list=await rpc('portal_owner_sponsors',{});
  if(Number(req.headers.get('Content-Length')??0)>4096)return reply(413,{error:'invalid_details'});
  const text=await req.text();if(text.length>4096)return reply(413,{error:'invalid_details'});
  const input=validateSponsorRequest(JSON.parse(text));
  const base=new URL(publicOrigin);if(base.origin!==publicOrigin||!(base.protocol==='https:'||publicOrigin==='http://127.0.0.1:8785'))throw new Error('portal_origin_invalid');

  const lookup=await rpc('portal_owner_sponsor_lookup',{p_email:input.email});
  let sponsorId:string;let needsLink=input.action==='link'||!lookup.userId;
  if(input.action==='link'){
   const record=list.find((r:Record<string,unknown>)=>String(r.email).toLowerCase()===input.email&&r.active===true);
   if(!record)throw new Error('active_sponsor_required');sponsorId=record.sponsorId;
  }
  function adminKey(){
   const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}');
   const key=Object.values(keys).find(k=>typeof k==='string'&&k.startsWith('sb_secret_'));
   if(typeof key!=='string')throw new Error('admin_not_configured');return key;
  }
  if(input.action!=='link'&&!lookup.userId){
   const response=await fetch(`${PROJECT}/auth/v1/admin/users`,{method:'POST',headers:{apikey:adminKey(),'Content-Type':'application/json'},body:JSON.stringify({email:input.email,email_confirm:true}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('invitation_failed');
   const user=await response.json();if(user.email?.toLowerCase()!==input.email)throw new Error('invitation_failed');
   // No password and no email: the recipient must prove mailbox access with a requested OTP.
   needsLink=false;
  }
  let linkData:Record<string,any>|null=null;
  if(needsLink){
   // Native project secrets are provisioned by Supabase; never return or log them.
   const key=adminKey();
   const type=lookup.userId?'magiclink':'invite';
   const response=await fetch(`${PROJECT}/auth/v1/admin/generate_link`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({type,email:input.email}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('invitation_failed');linkData=await response.json();
   const user=linkData.user??linkData;
   if(user.email?.toLowerCase()!==input.email||(lookup.userId&&user.id!==lookup.userId))throw new Error('invitation_failed');
  }
  if(input.action==='create'||input.action==='invite'){
   const saved=await rpc('portal_owner_sponsor_save',{p_email:input.email,p_company:input.company,p_expires:input.expiresAt,p_agreed:true});sponsorId=saved.sponsorId;
  }
  const signIn=`${publicOrigin}/partner-portal/?partner=${sponsorId!}`;
  let setupUrl:string|null=null;
  if(linkData){const props=linkData.properties??linkData,user=linkData.user??linkData;const hash=props.hashed_token;const type=props.verification_type??(lookup.userId?'magiclink':'invite');
   if(typeof hash!=='string'||!/^[A-Za-z0-9_-]{20,200}$/.test(hash)||!['invite','magiclink'].includes(type))throw new Error('invitation_failed');
   setupUrl=`${publicOrigin}/partner-portal/activate#${new URLSearchParams({token_hash:hash,type,email:input.email,user:user.id,sponsor:sponsorId!})}`;
  }
  return reply(200,{sponsors:await rpc('portal_owner_sponsors',{}),signInUrl:signIn,setupUrl,localOnly:base.hostname==='127.0.0.1',emailSent:false});
 }catch(e){const error=e instanceof Error?e.message:'';const safe=['invalid_details','invalid_action','invalid_email','approval_required','owner_access_required','owner_account_protected','account_disabled','existing_company_mapping_protected','ambiguous_company','company_disabled','multi_event_company_requires_review','company_access_requires_review','invalid_expiry','active_sponsor_required','admin_not_configured','invitation_failed','portal_origin_invalid','access_save_failed','email_delivery_not_ready','email_send_failed','email_send_rate_limited'];return reply(error==='owner_access_required'?403:400,{error:safe.includes(error)?error:'request_failed'});}
});
