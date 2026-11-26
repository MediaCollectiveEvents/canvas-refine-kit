import { useEffect, useState } from 'react';
import { isEventHubRehearsalReady, projectUrl, publishableKey } from './event-hub-backend';

export interface MasterTerm {
 id: string;
 kind: 'area'|'theme'|'keyword';
 label: string;
 description: string;
 aliases: string[];
 themeIds: string[];
}

const normalize=(value:string)=>' '+value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()+' ';

export function matchTaxonomy(terms: MasterTerm[], text: string) {
 const content=normalize(text);
 return terms.filter(term=>term.kind!=='area').flatMap(term=>{
  const matched=[term.label,...term.aliases].find(label=>label.trim()&&content.includes(normalize(label)));
  return matched?[{term,matched}]:[];
 });
}

export async function taxonomyRequest<T>(name: string, body: object = {}, signal?: AbortSignal): Promise<T> {
 if(!isEventHubRehearsalReady)throw Error('Staging taxonomy is unavailable.');
 const response=await fetch(projectUrl+'/rest/v1/rpc/'+name,{
  method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal,
  headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),
 });
 if(!response.ok){
  const error = await response.json().catch(()=>({}));
  const reasons: Record<string,string>={invalid_link:'This contributor link has expired or been revoked.',term_already_active:'That keyword is already active. Search for it above.',suggestion_limit_reached:'This draft has reached its suggestion limit.'};
  throw Error(reasons[error.message]??'The staging taxonomy request was rejected.');
 }
 return response.json();
}

export function useActiveTaxonomy(){
 const [terms,setTerms]=useState<MasterTerm[]>([]);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(!isEventHubRehearsalReady)return;
  const controller=new AbortController();
  taxonomyRequest<MasterTerm[]>('taxonomy_active',{},controller.signal).then(setTerms).catch(cause=>{
   if(!controller.signal.aborted)setError(cause.message);
  });
  return ()=>controller.abort();
 },[]);
 return {terms,error};
}
