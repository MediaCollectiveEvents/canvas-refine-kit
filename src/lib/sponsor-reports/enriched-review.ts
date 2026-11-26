import type { Workbook } from 'exceljs';
// Local review logic only. No network, identity allocation or source mutation.
export const fields = ['firstName', 'lastName', 'email', 'company', 'jobTitle', 'linkedin'] as const;
export type Field = typeof fields[number];
export type Guest = Record<Field, string> & { attendeeId: string; sourceRow: number };
export type Issue = { row: number; message: string; blocking: boolean; fields?: Field[] };
export type Change = { identity: string; field: string; before: string; after: string };
export type Review = { rows: Guest[]; issues: Issue[]; added: Guest[]; removed: Guest[]; changes: Change[]; unchanged: number };
const aliases: Record<string, Field | 'attendeeId'> = {
  firstname:'firstName', lastname:'lastName', email:'email', emailaddress:'email', company:'company', companyname:'company', jobtitle:'jobTitle', title:'jobTitle', linkedin:'linkedin', linkedinurl:'linkedin', linkedinprofile:'linkedin', attendeeid:'attendeeId', eventbriteattendeeid:'attendeeId',
};
const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const emailKey = (r: Guest) => r.email.trim().toLowerCase();
export function readTable(table: string[][]): Guest[] {
  const headers = table.map((r,i) => ({i, keys:r.map(c=>aliases[norm(c)])})).filter(({keys}) => fields.every(f=>keys.includes(f)));
  if (headers.length !== 1) throw new Error('Use one table with First name, Last name, Email, Company, Job title and LinkedIn URL headers.');
  const { i, keys } = headers[0];
  if (new Set(keys.filter(Boolean)).size !== keys.filter(Boolean).length) throw new Error('The table has duplicate recognised headers. Keep one column per field.');
  return table.slice(i+1).flatMap((values,j) => {
    if (!keys.some((k,c)=> k && values[c]?.trim())) return [];
    const record: Guest = { firstName:'',lastName:'',email:'',company:'',jobTitle:'',linkedin:'',attendeeId:'',sourceRow:i+j+2 };
    keys.forEach((k,c)=>{if(k)record[k]=(values[c]??'').trim();});
    return [record];
  });
}
export function reviewRows(rows: Guest[], baseline: Guest[]): Review {
  const issues: Issue[] = [], changes: Change[] = [], added: Guest[] = [];
  const ids = new Map<string,number>(), emails = new Map<string,number>();
  if (!rows.length) issues.push({row:0,message:'The report contains no attendee rows.',blocking:true});
  for (const r of rows) {
    for (const [value,seen,label] of [[r.attendeeId,ids,'Attendee ID'],[emailKey(r),emails,'Email']] as const) {
      if (!value) continue;
      const prior=seen.get(value);
      if (prior!==undefined) issues.push({row:r.sourceRow,message:`${label} duplicates row ${prior}.`,blocking:true,fields:label==='Email'?['email']:[]});
      else seen.set(value,r.sourceRow);
    }
    if (!r.firstName || !r.lastName) issues.push({row:r.sourceRow,message:'First and last name are required.',blocking:true,fields:['firstName','lastName'].filter(f=>!r[f]) as Field[]});
    if (!r.attendeeId && !r.email) issues.push({row:r.sourceRow,message:'An email is needed to match this person.',blocking:true,fields:['email']});
    if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) issues.push({row:r.sourceRow,message:'Email address is invalid.',blocking:true,fields:['email']});
    if (r.linkedin && !/^(?:https?:\/\/)?(?:(?:www|[a-z]{2})\.)?linkedin\.com\/in\/[^/\s?#]+\/?(?:\?[^\s#]*)?(?:#[^\s]*)?$/i.test(r.linkedin)) issues.push({row:r.sourceRow,message:'Enter a LinkedIn profile URL, for example linkedin.com/in/profile-name.',blocking:true,fields:['linkedin']});
    const missing=fields.filter(f=>!r[f]);
    if(missing.length)issues.push({row:r.sourceRow,message:`Not supplied: ${missing.join(', ')}.`,blocking:false,fields:missing});
  }
  const matched=new Set<Guest>(); let unchanged=0;
  for (const r of rows) {
    const byId=r.attendeeId ? baseline.find(b=>b.attendeeId===r.attendeeId) : undefined;
    const byEmail=r.email ? baseline.find(b=>emailKey(b)===emailKey(r)) : undefined;
    if (byId && byEmail && byId!==byEmail) {issues.push({row:r.sourceRow,message:'Attendee ID and email point to different previous records. Resolve before publishing.',blocking:true});continue;}
    const old=byId??byEmail;
    if (!old) {added.push(r);continue;}
    if (r.attendeeId && old.attendeeId && r.attendeeId!==old.attendeeId) issues.push({row:r.sourceRow,message:'Email matches a different attendee ID. Resolve before publishing.',blocking:true});
    if(matched.has(old))issues.push({row:r.sourceRow,message:'More than one new row matches the same previous person.',blocking:true});
    matched.add(old);let changed=false;
    for (const field of [...fields,'attendeeId'] as const) if(r[field]!==old[field]) {changed=true;changes.push({identity:`${r.firstName} ${r.lastName}`,field,before:old[field],after:r[field]});}
    if(!changed)unchanged++;
  }
  return {rows,issues,added,removed:baseline.filter(r=>!matched.has(r)),changes,unchanged};
}
export const demoBaseline: Guest[] = [
  {attendeeId:'DEMO-1',firstName:'Alex',lastName:'Morgan',email:'alex.morgan@example.com',company:'Example Broadcast',jobTitle:'Director of Technology',linkedin:'',sourceRow:2},
  {attendeeId:'DEMO-2',firstName:'Sam',lastName:'Taylor',email:'sam.taylor@example.com',company:'Example Studios',jobTitle:'Head of Operations',linkedin:'',sourceRow:3},
];
export const demoUpdate: Guest[] = [...demoBaseline.map((r,i)=>({...r,jobTitle:i===0?'Chief Technology Officer':r.jobTitle,linkedin:i===0?'https://www.linkedin.com/in/demo-only-fictional-alex-morgan/':r.linkedin})), {attendeeId:'DEMO-3',firstName:'Jordan',lastName:'Reed',email:'jordan.reed@example.com',company:'Example Streaming',jobTitle:'VP, Product',linkedin:'',sourceRow:4}];

export function readWorkbook(wb: Workbook): { name: string; rows: Guest[] } {
  if(wb.worksheets.length>20)throw new Error('Use a workbook with no more than 20 worksheets.');
  const candidates:{name:string;rows:Guest[]}[]=[];
  for(const sheet of wb.worksheets){
    if(sheet.rowCount>5500||sheet.columnCount>100)throw new Error('Use a report with at most 5,500 rows and 100 columns per sheet.');
    let hasUncachedFormula=false;
    const table:string[][]=[];
    sheet.eachRow({includeEmpty:true},row=>{const values:string[]=[];for(let c=1;c<=sheet.columnCount;c++){
      const cell=row.getCell(c),v=cell.value;
      if(v&&typeof v==='object'&&'formula' in v){if(v.result===undefined){hasUncachedFormula=true;values.push('');}else values.push(String(v.result));}
      else if(v&&typeof v==='object'&&'hyperlink' in v)values.push(v.hyperlink);
      else values.push(cell.text??'');
    }table.push(values);});
    try{const rows=readTable(table);if(hasUncachedFormula)throw new Error('Recalculate and save formulas in Excel before uploading.');candidates.push({name:sheet.name,rows});}catch(e){if(e instanceof Error&&e.message.startsWith('Recalculate'))throw e;}
  }
  if(candidates.length!==1)throw new Error('Exactly one worksheet must contain the attendee table, with First name, Last name, Email, Company, Job title and LinkedIn URL headers.');
  return candidates[0];
}

// Export a recoverable report using literal cells (never executable Excel formulas).
export function writeReportWorkbook(workbook: Workbook, rows: Guest[]) {
  const sheet=workbook.addWorksheet('Enriched report');
  sheet.addRow(['First name','Last name','Email','Company','Job title','LinkedIn URL']);
  rows.forEach(r=>sheet.addRow(fields.map(f=>r[f])));
  sheet.columns.forEach(c=>{c.width=28;});
  return workbook;
}
