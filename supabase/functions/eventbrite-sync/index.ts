// Server-only Eventbrite token. No service-role key is used: owner RPCs check the caller's live session.
const PROJECT='https://qtmbioguefmtwtngbava.supabase.co';
const PUBLIC_KEY='sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz';
const EVENT='1999093084229';
export async function fetchAttendees(token:string,fetcher:typeof fetch=fetch){
 const result:Record<string,string>[]=[];const seen=new Set<string>();let page=1;
 while(true){
  const response=await fetcher(`https://www.eventbriteapi.com/v3/events/${EVENT}/attendees/?page=${page}&expand=ticket_class`,{headers:{Authorization:`Bearer ${token}`},redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(response.status===401||response.status===403?'eventbrite_authorisation_required':'eventbrite_unavailable');
  const body=await response.json();if(!Array.isArray(body.attendees)||!body.pagination||typeof body.pagination.has_more_items!=='boolean')throw new Error('invalid_eventbrite_response');
  for(const a of body.attendees){
   if(typeof a.id!=='string'||seen.has(a.id))throw new Error('duplicate_or_missing_attendee_id');seen.add(a.id);
   // Original submitted fields only. No enrichment, email guessing or identity merge.
   const text=(v:unknown)=>typeof v==='string'?v:'';
   const profile=a.profile??{};
   result.push({attendeeId:a.id,firstName:text(profile.first_name),lastName:text(profile.last_name),email:text(profile.email),company:text(profile.company),jobTitle:text(profile.job_title),ticketType:text(a.ticket_class?.name),status:text(a.status),registeredAt:text(a.created)});
   if(result.length>5000)throw new Error('eventbrite_report_too_large');
  }
  if(!body.pagination.has_more_items)break;
  if(++page>50)throw new Error('eventbrite_pagination_limit');
 }
 return result;
}
// Tests import the pure collector without starting the Deno HTTP server.
if(typeof Deno!=='undefined')Deno.serve(async(req:Request)=>{
 const allowed=new Set(['http://127.0.0.1:8785','http://localhost:8785','https://mediacollective.events','https://www.mediacollective.events']);
 const origin=req.headers.get('Origin')??'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,data:object)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&!allowed.has(origin))return reply(403,{error:'origin_denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
 const bearer=req.headers.get('Authorization')??'';if(!/^Bearer \S+$/.test(bearer))return reply(401,{error:'sign_in_required'});
 const scheduledToken=bearer.startsWith('Bearer ebcron_')?bearer.slice(7):null;
 async function rpc(name:string,body:object){
  const response=await fetch(`${PROJECT}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:PUBLIC_KEY,...(scheduledToken?{}:{Authorization:bearer}),'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(response.status===401||response.status===403?'owner_access_required':'save_rejected');
  return response.json();
 }
 try{
  // Authorise BEFORE reading the Eventbrite token or calling upstream. Scope is fixed to OFF AIR.
  const baseline=scheduledToken?await rpc('portal_eventbrite_job_state',{p_token:scheduledToken}):await rpc('portal_eventbrite_sync_state',{});
  const token=Deno.env.get('EVENTBRITE_PRIVATE_TOKEN');if(!token)return reply(503,{error:'eventbrite_not_configured'});
  const rows=await fetchAttendees(token);
  const saved=scheduledToken?await rpc('portal_eventbrite_job_ingest',{p_token:scheduledToken,p_rows:rows,p_base:baseline.revision}):await rpc('portal_eventbrite_ingest',{p_rows:rows,p_base:baseline.revision,p_eventbrite_event:EVENT});
  return reply(200,saved);
 }catch(e){
  const code=e instanceof Error?e.message:'';
  const safe=['owner_access_required','eventbrite_authorisation_required','eventbrite_unavailable','invalid_eventbrite_response','duplicate_or_missing_attendee_id','eventbrite_report_too_large','eventbrite_pagination_limit','save_rejected'].includes(code)?code:'sync_failed';
  return reply(safe==='owner_access_required'?403:502,{error:safe});
 }
});
