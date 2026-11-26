// Run: node tests/sponsor-portal/enriched-review.test.mjs
import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
const source=await fs.readFile('src/lib/sponsor-reports/enriched-review.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {readWorkbook,writeReportWorkbook,readTable,reviewRows,demoBaseline,demoUpdate}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const changed=reviewRows(demoUpdate,demoBaseline);
assert.equal(changed.added.length,1);assert.equal(changed.changes.length,2);assert.equal(changed.removed.length,0);assert.equal(changed.unchanged,1);
assert.equal(reviewRows([...demoUpdate,{...demoUpdate[0],email:demoUpdate[0].email.toUpperCase(),sourceRow:5}],demoBaseline).issues.filter(i=>i.blocking).length,3);
assert(reviewRows([{...demoBaseline[0],email:'bad address'}],demoBaseline).issues.some(i=>i.blocking));
assert(reviewRows([{...demoBaseline[0],email:demoBaseline[1].email}],demoBaseline).issues.some(i=>i.message.includes('different previous')));
const emailChange=reviewRows([{...demoBaseline[0],email:'new@example.com'},demoBaseline[1]],demoBaseline);
assert.equal(emailChange.added.length,0);assert.equal(emailChange.removed.length,0);assert.equal(emailChange.changes[0].field,'email');
assert.equal(reviewRows([demoBaseline[0]],demoBaseline).removed.length,1);
assert(reviewRows([],demoBaseline).issues.some(i=>i.blocking));
assert(reviewRows([{...demoBaseline[0],linkedin:'https://evil.example/in/test'}],demoBaseline).issues.some(i=>i.blocking));
const rows=readTable([['OFF AIR report'],[],['First Name','Last Name','Email','Company','Job Title','LinkedIn URL','Eventbrite Attendee ID'],['Alex','Morgan','alex@example.com','','','','00123']]);
assert.equal(rows[0].attendeeId,'00123');assert.equal(rows[0].sourceRow,4);assert.equal(rows[0].company,'');
assert.throws(()=>readTable([['First name','Last name','Email']]));
assert.throws(()=>readTable([['First name','Last name','Email','Company','Job title','Linkedin','Email']]));
assert.equal(demoBaseline[0].jobTitle,'Director of Technology');
console.log('PASS enrichment comparison, identity conflicts, omissions, blanks, duplicate checks and table parsing');

const {default:ExcelJS}=await import('exceljs');
const fixture=new ExcelJS.Workbook();const sheet=fixture.addWorksheet('Report');sheet.addRow(['OFF AIR synthetic test']);sheet.addRow(['First name','Last name','Email','Company','Job title','LinkedIn URL','Eventbrite Attendee ID']);demoUpdate.forEach(r=>sheet.addRow([r.firstName,r.lastName,r.email,r.company,r.jobTitle,r.linkedin,r.attendeeId]));const wb=new ExcelJS.Workbook();await wb.xlsx.load(await fixture.xlsx.writeBuffer());
const parsed=readWorkbook(wb);assert.equal(parsed.rows.length,3);assert.equal(parsed.rows[0].attendeeId,'DEMO-1');assert.equal(parsed.rows[0].jobTitle,'Chief Technology Officer');assert.equal(parsed.rows[0].linkedin,'https://www.linkedin.com/in/demo-only-fictional-alex-morgan/');
console.log('PASS XLSX import with prefixed report title and blank fields');

for (const linkedin of ['https://uk.linkedin.com/in/example-person/','https://www.linkedin.com/in/example-person/','https://linkedin.com/in/example-person']) assert(!reviewRows([{...demoBaseline[0],linkedin}],[]).issues.some(i=>i.blocking),linkedin);
for (const linkedin of ['https://linkedin.com.evil.example/in/test','https://fake.linkedin.com/in/test','https://www.linkedin.com/in/test/other']) assert(reviewRows([{...demoBaseline[0],linkedin}],[]).issues.some(i=>i.blocking),linkedin);
console.log('PASS manually supplied country-specific LinkedIn links accepted; unrelated hosts rejected');

for (const linkedin of ['http://uk.linkedin.com/in/example-person/','linkedin.com/in/example-person','www.linkedin.com/in/example-person/','uk.linkedin.com/in/example-person']) assert(!reviewRows([{...demoBaseline[0],linkedin}],[]).issues.some(i=>i.blocking),linkedin);
console.log('PASS working HTTP and prefix-free LinkedIn URLs no longer trigger HTTPS alerts');

const backupRows=[{...demoBaseline[0],attendeeId:'0000123',company:'=literal company',linkedin:'uk.linkedin.com/in/example-person'}, {...demoBaseline[1],email:''}];
const backup=writeReportWorkbook(new ExcelJS.Workbook(),backupRows);
const restored=new ExcelJS.Workbook();await restored.xlsx.load(await backup.xlsx.writeBuffer());
const recovered=readWorkbook(restored).rows;
for(let i=0;i<backupRows.length;i++)for(const key of ['firstName','lastName','email','company','jobTitle','linkedin'])assert.equal(recovered[i][key],backupRows[i][key]);
assert.equal(recovered[0].attendeeId,'');
assert.equal(restored.worksheets[0].columnCount,6);
assert.equal(restored.worksheets[0].getCell('D2').type,ExcelJS.ValueType.String);
console.log('PASS Excel backup/re-import contains six contact fields and preserves blanks, URLs and literal formula-like text');
