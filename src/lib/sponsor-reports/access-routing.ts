import type {OwnerState} from './supabase-connection';

export type PortalDestination<T=OwnerState>={kind:'owner';state?:T}|{kind:'partner'};
// Ask the existing server-side owner guard. Never infer privileges from an email address.
export async function portalDestination<T>(client:{state:()=>Promise<T>}):Promise<PortalDestination<T>>{
 try{return {kind:'owner',state:await client.state()};}
 catch(error){
  if(error instanceof Error&&error.message==='Complete two-step verification to access owner tools.')return {kind:'owner'};
  if(error instanceof Error&&error.message==='This account has not been enabled as the portal owner yet.')return {kind:'partner'};
  throw error;
 }
}
