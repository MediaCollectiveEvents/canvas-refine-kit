import fs from 'node:fs/promises';import ts from 'typescript';import assert from 'node:assert/strict';
const source=await fs.readFile('src/lib/sponsor-reports/guest-list.ts','utf8');
const js=ts.transpile(source,{module:ts.ModuleKind.ESNext});const {recentRegistrations,uniqueCompanyCount}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const now=Date.parse('2026-11-17T12:00:00Z'),base={firstName:'Example',lastName:'Guest',company:'',jobTitle:''};
const row=(registeredAt)=>({...base,registeredAt});
const entries=[row('2026-11-14T11:59:59Z'),row('2026-11-14T12:00:00Z'),row('2026-11-17T11:00:00Z'),row(''),row('bad'),row('2026-11-17T12:00:01Z')];
assert.deepEqual(recentRegistrations(entries,now).map(r=>r.registeredAt),['2026-11-17T11:00:00Z','2026-11-14T12:00:00Z']);
assert.equal(recentRegistrations(entries,now+1).length,1);assert.equal(recentRegistrations(entries,now+73*3600000).length,0);
console.log('PASS rolling72hour boundary, chronological order, ageing-out, invalid/unknown/future date exclusion');

assert.equal(uniqueCompanyCount([{company:"  BBC "},{company:"bbc"},{company:"Acme  Media"},{company:"ACME MEDIA"},{company:""},{company:"N/A"},{company:"Not supplied"},{company:"Unknown"}]),2);
assert.equal(uniqueCompanyCount([]),0);
console.log("PASS unique companies normalize case and spacing and exclude missing details");
