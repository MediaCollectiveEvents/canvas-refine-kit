import fs from 'node:fs/promises';import ts from 'typescript';import assert from 'node:assert/strict';
const js=ts.transpileModule(await fs.readFile('src/lib/sponsor-reports/access-routing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {portalDestination}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const state={current:1,versions:[],introductions:[]};
assert.deepEqual(await portalDestination({state:async()=>state}),{kind:'owner',state});
assert.deepEqual(await portalDestination({state:async()=>{throw Error('Complete two-step verification to access owner tools.');}}),{kind:'owner'});
assert.deepEqual(await portalDestination({state:async()=>{throw Error('This account has not been enabled as the portal owner yet.');}}),{kind:'partner'});
for(const message of ['Please sign in again.','Your session has expired. Sign out and sign in again.','Network failure'])await assert.rejects(()=>portalDestination({state:async()=>{throw Error(message);}}),{message});
console.log('PASS server-verified owner routing, mandatory MFA handoff, partner separation and fail-closed session/network errors');
