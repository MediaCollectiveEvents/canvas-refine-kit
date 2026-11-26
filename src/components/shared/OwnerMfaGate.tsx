import {useEffect,useState,type FormEvent} from 'react';
import {Button} from '@/components/ui/button';
import type {FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';
export default function OwnerMfaGate({client,onReady,onSignOut}:{client:FrankfurtOwnerClient;onReady:()=>Promise<void>;onSignOut:()=>void}){
 const [factor,setFactor]=useState(''),[qr,setQr]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let active=true;
  async function initialise(){
   // The server decides whether this session needs MFA. Never bypass it using a browser date or flag.
   try{if(active)await onReady();return;}
   catch(e){if(!(e instanceof Error)||e.message!=='Complete two-step verification to access owner tools.')throw e;}
   const rows=await client.ownerMfaFactors();if(active)setFactor(rows.find(f=>f.status==='verified'&&f.factor_type==='totp')?.id??'');
  }
  void initialise().catch(e=>{if(active)setError(e instanceof Error?e.message:'Could not check your owner session. Please sign out and try again.');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};
 },[client]);
 async function enroll(){setBusy(true);setError('');try{const result=await client.enrollOwnerMfa();setFactor(result.id);setQr(result.qr);}catch(e){setError(e instanceof Error?e.message:'Authenticator setup failed.');}finally{setBusy(false);}}
 async function verify(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{await client.verifyOwnerMfa(factor,code);setCode('');setQr('');await onReady();}catch(e){setError(e instanceof Error?e.message:'Verification failed.');}finally{setBusy(false);}}
 return <section className="mt-8 rounded-xl border border-primary/30 p-6"><h2 className="font-display text-2xl">Two-step verification</h2><p className="my-4 text-sm leading-relaxed text-white/70">Your owner account requires an authenticator code as well as your password.</p>{error&&<p role="alert" className="my-4 text-amber-200">{error}</p>}{!factor?<><p className="mb-4 text-sm text-white/65">Set up your authenticator app to protect access to reports and partner management. Keep access to your Supabase administrator account for recovery if your authenticator is lost.</p><Button variant="brand" disabled={busy||!!error} onClick={()=>void enroll()}>{busy?'Checking…':'Set up two-step verification'}</Button></>:<form onSubmit={verify} className="space-y-4">{qr&&<><p className="text-sm text-white/70">Scan this private QR code with your authenticator app. Do not share it.</p><img src={qr} alt="Private authenticator setup QR code" className="h-56 w-56 rounded-lg bg-white p-3"/></>}<label className="block text-sm">Authenticator code<input required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} disabled={busy} className="mt-2 block w-full max-w-xs rounded border border-white/25 bg-white/5 p-3 text-xl tracking-widest"/></label><Button variant="brand" disabled={busy||code.length!==6}>{busy?'Verifying…':'Verify and continue'}</Button></form>}<button type="button" className="mt-5 block min-h-11 underline" disabled={busy} onClick={onSignOut}>Sign out</button></section>;
}
