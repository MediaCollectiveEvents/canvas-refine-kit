import {useState} from 'react';
import {Button} from '@/components/ui/button';
export default function RegistrationDeleteButton({name,onDelete}:{name:string;onDelete:()=>Promise<void>}){
 const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function remove(){setBusy(true);setError('');try{await onDelete();setConfirm(false);}catch(e){setError(e instanceof Error?e.message:'Unable to delete this registration.');}finally{setBusy(false);}}
 return <div className="mt-2">{confirm?<div className="rounded border border-red-300/40 p-3 text-sm"><p>Remove {name} from the report? You can restore it under Deleted registrations. The Eventbrite ticket is unchanged.</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={()=>void remove()}>{busy?'Deleting…':'Confirm delete'}</Button><Button variant="outline" disabled={busy} onClick={()=>setConfirm(false)}>Cancel</Button></div></div>:<Button variant="outline" className="text-red-200" onClick={()=>setConfirm(true)}>Delete from report</Button>}{error&&<p role="alert" className="mt-2 text-red-200">{error}</p>}</div>;
}
