import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OwnerRecoveryClient } from '@/lib/sponsor-reports/supabase-recovery';
// Memoisation prevents React StrictMode from consuming a one-time token twice.
const recovery=new OwnerRecoveryClient();
let initialVerification:Promise<void>|null=null;
function initialize(){
 if(initialVerification)return initialVerification;
 const fragment=new URLSearchParams(window.location.hash.slice(1));
 const token=fragment.get('token_hash')??'';
 window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);
 initialVerification=recovery.verify(token);return initialVerification;
}
export default function SponsorOwnerPasswordReset(){
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const formRef=useRef<HTMLFormElement>(null);
 useEffect(()=>{let mounted=true;initialize().then(()=>{if(mounted)setReady(true);}).catch(e=>{if(mounted)setError(e.message);});return()=>{mounted=false;};},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const password=String(f.get('password'));if(password!==f.get('confirm')){setError('The passwords do not match.');return;}setBusy(true);setError('');try{const result=await recovery.setPassword(password);formRef.current?.reset();setDone(true);setReady(false);setMessage(result.signedOut?'Your portal password has been updated. Sign in using your new password.':'Your portal password has been updated. Automatic session sign-out could not be confirmed.');}catch(e){setError(e instanceof Error?e.message:'Password update failed.');}finally{setBusy(false);}}
 return <main id="main-content" className="min-h-screen bg-[#101d24] px-6 py-14 text-white"><div className="mx-auto max-w-lg"><p className="text-xs uppercase tracking-widest text-primary">The Media Collective · Owner account</p><h1 className="mt-5 font-display text-3xl">Set your portal password</h1><p className="mt-4 leading-relaxed text-white/65">For chris@mediacollective.events. This updates your portal login. Your report versions and owner permissions stay unchanged.</p>{error&&<p role="alert" className="mt-6 rounded border border-red-300 p-4 text-red-200">{error}</p>}{done?<><p role="status" className="my-6 rounded border border-primary p-4">{message}</p><Button asChild variant="brand"><Link to="/eventhub/owner">Continue to sign in</Link></Button></>:<form ref={formRef} onSubmit={submit} className="mt-8 space-y-5"><label className="block">New portal password<input name="password" type="password" autoComplete="new-password" required minLength={12} disabled={!ready||busy} className="mt-2 block w-full rounded border border-white/25 bg-white/5 p-3"/></label><label className="block">Confirm new password<input name="confirm" type="password" autoComplete="new-password" required minLength={12} disabled={!ready||busy} className="mt-2 block w-full rounded border border-white/25 bg-white/5 p-3"/></label><p className="text-sm text-white/50">Use at least 12 characters and save it in your password manager. Enter it yourself; do not send it in chat.</p><Button type="submit" variant="brand" disabled={!ready||busy}>{busy?'Updating…':'Save new password'}</Button></form>}</div></main>;
}
