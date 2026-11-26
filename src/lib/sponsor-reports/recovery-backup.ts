export type EncryptedBackup={format:'media-collective-encrypted-backup';version:1;kdf:'PBKDF2-SHA256';iterations:600000;salt:string;iv:string;ciphertext:string};
const bytesToBase64=(bytes:Uint8Array)=>{let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);};
const fromBase64=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
async function key(passphrase:string,salt:Uint8Array){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:new Uint8Array(salt),iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function encryptRecoveryBackup(value:unknown,passphrase:string):Promise<EncryptedBackup>{
 if(passphrase.length<16)throw new Error('Use a separate backup passphrase of at least 16 characters.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('media-collective-backup-v1')},await key(passphrase,salt),new TextEncoder().encode(JSON.stringify(value)));
 return {format:'media-collective-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:600000,salt:bytesToBase64(salt),iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(encrypted))};
}
export async function checkRecoveryBackup(value:unknown,passphrase:string){
 const v=value as EncryptedBackup;
 if(!v||v.format!=='media-collective-encrypted-backup'||v.version!==1||v.kdf!=='PBKDF2-SHA256'||v.iterations!==600000||typeof v.ciphertext!=='string'||v.ciphertext.length>100*1024*1024)throw new Error('Choose a valid encrypted portal backup.');
 try{
  const salt=fromBase64(v.salt),iv=fromBase64(v.iv);if(salt.length!==16||iv.length!==12)throw new Error('Invalid encryption parameters');
  const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('media-collective-backup-v1')},await key(passphrase,salt),fromBase64(v.ciphertext));
  const payload=JSON.parse(new TextDecoder().decode(clear));
  if(payload.format!=='media-collective-portal-recovery'||payload.version!==1||!payload.tables||!Array.isArray(payload.tables.report_versions)||!Array.isArray(payload.tables.report_current)||!Array.isArray(payload.files))throw new Error('Invalid recovery payload');
  return {exportedAt:String(payload.exportedAt),versions:payload.tables.report_versions.length,partners:Array.isArray(payload.tables.memberships)?payload.tables.memberships.length:0,files:payload.files.length};
 }catch{throw new Error('The backup could not be verified. Check the passphrase and that the file is intact.');}
}
export async function encodeBackupFile(response:Response){if(!response.ok)throw new Error('Marketing file backup failed.');return bytesToBase64(new Uint8Array(await response.arrayBuffer()));}
