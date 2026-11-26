import {useEffect,useState} from 'react';
import {Helmet} from 'react-helmet-async';
import {Button} from '@/components/ui/button';
type InstallEvent=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function OwnerAppInstall(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(false),[help,setHelp]=useState(false);
 useEffect(()=>{
  const mode=window.matchMedia('(display-mode: standalone)');setInstalled(mode.matches);
  const ready=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent);};
  const done=()=>{setInstalled(true);setPrompt(null);};
  window.addEventListener('beforeinstallprompt',ready);window.addEventListener('appinstalled',done);
  return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done);};
 },[]);
 async function install(){if(!prompt){setHelp(true);return;}try{await prompt.prompt();await prompt.userChoice;}finally{setPrompt(null);}}
 return <><Helmet><link rel="manifest" href="/eventhub/owner.webmanifest"/><meta name="theme-color" content="#0a1b23"/></Helmet>{!installed&&<section className="my-6 rounded-xl border border-white/15 p-5" aria-label="Android owner app"><h2 className="text-xl">Owner portal on your phone</h2><p className="my-3 text-sm text-white/65">Add the owner portal to your Android home screen. Sign in online with two-step verification to save an encrypted offline report. Unlock saved reports with your separate offline passphrase.</p><Button variant="outline" onClick={()=>void install()}>{prompt?'Install owner app':'Add to home screen'}</Button>{help&&<p role="status" className="mt-3 text-sm">Open this page in Chrome on Android, tap the three-dot menu, then “Add to Home screen” → “Install”. If you see “Create shortcut”, you can use that too.</p>}</section>}</>;
}
