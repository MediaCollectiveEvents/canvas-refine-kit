// OFF AIR guest-list downloads open the day after the event, in its local timezone.
export function guestListDownloadsAvailable(now:Date=new Date()):boolean {
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=(type:string)=>parts.find(p=>p.type===type)?.value??'';
  const date=`${part('year')}-${part('month')}-${part('day')}`;
  return date>='2026-11-25'&&date<'2026-12-16';
}
