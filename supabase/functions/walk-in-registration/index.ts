// Dedicated public kiosk API. No list, owner actions, automatic emails or Eventbrite writes.
const PROJECT='https://qtmbioguefmtwtngbava.supabase.co';
type Dependencies={env:(key:string)=>string|undefined;fetch:typeof fetch;now:()=>number};
async function limitedBody(req:Request){const reader=req.body?.getReader();if(!reader)throw Error('invalid_request');let size=0;const chunks:Uint8Array[]=[];while(true){const{done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();throw Error('invalid_request');}chunks.push(value);}const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(result));}
export function createWalkInHandler(deps:Dependencies){return async(req:Request)=>{
 const origin=req.headers.get('Origin')??'';const allowed=new Set(['https://www.mediacollective.events','https://mediacollective.events']);
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'POST, GET, OPTIONS'}:{})};
 const reply=(status:number,value:object)=>new Response(JSON.stringify(value),{status,headers});
 if(origin&&!allowed.has(origin))return reply(403,{error:'origin_denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(!['GET','POST'].includes(req.method))return reply(405,{error:'method_not_allowed'});
 // A second independent switch keeps even a migrated/deployed kiosk closed until approved.
 if(deps.env('WALK_IN_KIOSK_ENABLED')!=='true')return req.method==='GET'?reply(200,{enabled:false}):reply(403,{error:'walk_in_closed'});
 try{
  const keys=JSON.parse(deps.env('SUPABASE_SECRET_KEYS')??'{}');const key=Object.values(keys).find(k=>typeof k==='string'&&k.startsWith('sb_secret_')) as string|undefined;if(!key)throw Error('unavailable');
  async function rpc(name:string,body:object){const r=await deps.fetch(`${PROJECT}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key!,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});if(!r.ok){const value=await r.json().catch(()=>({}));throw Error(value.message==='walk_in_closed'?'walk_in_closed':'unavailable');}return r.json();}
  const gate=await rpc('portal_walk_in_status',{});if(req.method==='GET')return reply(200,{enabled:gate.enabled===true});if(gate.enabled!==true)return reply(403,{error:'walk_in_closed'});
  const value=await limitedBody(req);const updates=value?.action==='event_updates';
  const allowedFields=new Set(updates?['action','email','requestId','captchaToken','website','agreed']:['firstName','lastName','company','email','requestId','captchaToken','website']);
  if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!allowedFields.has(k)))throw Error('invalid_request');
  if(typeof value.website!=='string'||value.website!=='')throw Error('invalid_request');
  const fields:Record<string,string>={};for(const name of(updates?['email']:['firstName','lastName','company','email'])){if(typeof value[name]!=='string')throw Error('invalid_request');fields[name]=value[name].trim();if(/[\u0000-\u001f\u007f]/.test(fields[name]))throw Error('invalid_request');}
  fields.email=fields.email.toLowerCase();
  if((updates?value.agreed!==true:(!fields.firstName||fields.firstName.length>100||!fields.lastName||fields.lastName.length>100||fields.company.length>200))||fields.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)||typeof value.requestId!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value.requestId)||typeof value.captchaToken!=='string'||value.captchaToken.length<10||value.captchaToken.length>8192)throw Error('invalid_request');
  const secret=deps.env('WALK_IN_RECAPTCHA_SECRET');if(!secret)throw Error('unavailable');
  const captcha=await deps.fetch('https://www.google.com/recaptcha/api/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret,response:value.captchaToken}).toString(),signal:AbortSignal.timeout(12000)});
  if(!captcha.ok)throw Error('verification_failed');const verified=await captcha.json();const timestamp=Date.parse(verified.challenge_ts??'');
  if(verified.success!==true||!['www.mediacollective.events','mediacollective.events'].includes(verified.hostname)||!Number.isFinite(timestamp)||deps.now()-timestamp>120000||timestamp>deps.now()+30000)throw Error('verification_failed');
  const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${key}:${s}`)))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()??'unknown';
  const result=await rpc(updates?'portal_walk_in_updates_submit':'portal_walk_in_submit',{p_request:value.requestId,...(updates?{p_email:fields.email,p_agreed:true}:{p_fields:fields}),p_ip_hash:await hash(ip),p_email_hash:await hash(fields.email)});
  if(result.status==='rate_limited')return reply(429,{error:'rate_limited'});
  if(!(updates?['received']:['registered','refer_to_staff']).includes(result.status))throw Error('unavailable');
  return reply(200,{status:result.status});
 }catch(error){const message=error instanceof Error?error.message:'';const known=['walk_in_closed','invalid_request','verification_failed'];return reply(message==='walk_in_closed'?403:known.includes(message)?400:503,{error:known.includes(message)?message:'unavailable'});}
};}
if(typeof Deno!=='undefined')Deno.serve(createWalkInHandler({env:k=>Deno.env.get(k),fetch,now:()=>Date.now()}));
