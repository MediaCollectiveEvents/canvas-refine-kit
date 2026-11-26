// Public code request gateway: neutral responses, no self-registration or entitlement changes.
const PRODUCTION_PROJECT='https://qtmbioguefmtwtngbava.supabase.co';
const PRODUCTION_PUBLIC_KEY='sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz';
const REHEARSAL_PROJECT='https://ioynilkvrfujnmudaped.supabase.co';
Deno.serve(async(req:Request)=>{
 const project=Deno.env.get('SUPABASE_URL')??PRODUCTION_PROJECT;
 const rehearsal=project===REHEARSAL_PROJECT;
 if(!rehearsal&&project!==PRODUCTION_PROJECT)return new Response(null,{status:503});
 const origin=req.headers.get('Origin')??'';
 const allowed=new Set(rehearsal?['https://staging.mediacollective.events']:['https://www.mediacollective.events','https://mediacollective.events']);
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,data:object)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&!allowed.has(origin))return reply(403,{error:'origin_denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
 try{
  const text=await req.text();if(text.length>512)return reply(400,{error:'invalid_request'});
  const email=String(JSON.parse(text).email??'').trim().toLowerCase();
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply(400,{error:'invalid_request'});
  const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}');
  const key=Object.values(keys).find(k=>typeof k==='string'&&k.startsWith('sb_secret_')) as string|undefined;
  const resend=rehearsal?undefined:Deno.env.get('RESEND_API_KEY');if(!key)throw Error('unavailable');
  const publicKey=rehearsal
   ? Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')??'{}')).find((value):value is string=>typeof value==='string'&&value.startsWith('sb_publishable_'))
   : PRODUCTION_PUBLIC_KEY;
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()??'unknown';
  const ipHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+':'+ip)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  async function rpc(name:string,body:object){const r=await fetch(`${project}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key!,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('unavailable');return r.json();}
  const route=await rpc('portal_code_request_route',{p_email:email,p_ip_hash:ipHash});
  if(route.registered){
   if(route.confirmed&&!publicKey)throw Error('unavailable');
   const r=await fetch(`${project}/auth/v1/${route.confirmed?'otp':'invite'}`,{method:'POST',headers:{apikey:route.confirmed?publicKey!:key,'Content-Type':'application/json'},body:JSON.stringify(route.confirmed?{email,create_user:false}:{email}),signal:AbortSignal.timeout(15000)});
   // Keep account existence private. Native Auth retains OTP expiry and sending limits.
   if(!r.ok&&r.status!==400&&r.status!==422)throw Error('unavailable');
  }else if(route.requestId){
   if(!resend){
    await rpc('portal_code_request_result',{p_id:route.requestId,p_sent:false});
    if(rehearsal)return reply(200,{accepted:true});
    throw Error('unavailable');
   }
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json','Idempotency-Key':`portal-access-${route.requestId}`},body:JSON.stringify({from:'The Media Collective <chris@mediacollective.events>',to:['chris@mediacollective.events'],subject:'Event Hub access request',text:`An unregistered email address requested an Event Hub sign-in code.\n\nEmail: ${email}\nRequested: ${new Date().toISOString()}\n\nNo account or access has been granted. Review this request in your normal approval process. To approve, add the email in Manage partners:\nhttps://www.mediacollective.events/partner-portal/\n\nThis address has not been verified. Do not treat the request as proof of identity.`}),signal:AbortSignal.timeout(15000)});
   await rpc('portal_code_request_result',{p_id:route.requestId,p_sent:r.ok});if(!r.ok)throw Error('unavailable');
  }
  return reply(200,{accepted:true});
 }catch{return reply(503,{error:'request_unavailable'});}
});
