import type {Guest} from './enriched-review';

function csvRecords(csv:string){
 const rows:string[][]=[];
 let row:string[]=[];
 let field='';
 let quoted=false;
 let closedQuote=false;
 for(let i=0;i<csv.length;i++){
  const char=csv[i];
  if(quoted){
   if(char==='"'&&csv[i+1]==='"'){field+='"';i++;}
   else if(char==='"'){quoted=false;closedQuote=true;}
   else field+=char;
   continue;
  }
  if(char===','||char==='\n'||char==='\r'){
   row.push(field);field='';closedQuote=false;
   if(char!==','){
    if(char==='\r'&&csv[i+1]==='\n')i++;
    if(row.some(value=>value.trim()))rows.push(row);
    row=[];
   }
  }else if(char==='"'&&!field&&!closedQuote){quoted=true;}
  else if(char==='"'||closedQuote){throw new Error('A quoted CSV field is malformed.');}
  else field+=char;
 }
 if(quoted)throw new Error('A quoted CSV field is unfinished.');
 row.push(field);
 if(row.some(value=>value.trim()))rows.push(row);
 return rows;
}

function readRows(csv:string){
 const [header,...rows]=csvRecords(csv.replace(/^\uFEFF/,''));
 if(!header||!rows.length||rows.length>5000)throw new Error('Choose a CSV with a header and between 1 and 5,000 data rows.');
 if(rows.some(row=>row.length!==header.length))throw new Error('Some CSV rows have a different number of columns from the header.');
 const columns=header.map(value=>value.trim().toLowerCase());
 function find(options:string[]){return options.map(name=>columns.indexOf(name)).find(index=>index>=0)??-1;}
 const first=find(['first name','attendee first name','firstname']);
 const last=find(['last name','surname','attendee surname','attendee last name','lastname']);
 const email=find(['email','email address','attendee email']);
 if([first,last,email].some(index=>index<0))throw new Error('The CSV needs first name, last name and email columns.');
 return {
  rows,first,last,email,find,
  value(row:string[],index:number){return (row[index]??'').trim().replace(/[\r\n\t]+/g,' ');},
 };
}

export type MptsRegistration=Guest&{registeredAt:string};

export function parseMptsRegistrations(csv:string):MptsRegistration[]{
 const {rows,first,last,email,find,value}=readRows(csv);
 const id=find(['attendee id','attendeeid','registration id']);
 const company=find(['company','organisation','organization']);
 const role=find(['job title','jobtitle','role']);
 const linkedin=find(['linkedin','linkedin url']);
 const date=find(['registered at','registeredat','order date','registration date']);
 return rows.map((row,index)=>{
  const firstName=value(row,first),lastName=value(row,last),address=value(row,email).toLowerCase();
  const attendeeId=value(row,id),registered=value(row,date);
  if(!firstName||!lastName||(!attendeeId&&!address)||address&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){
   throw new Error(`CSV row ${index+2} needs a name and email address or attendee ID.`);
  }
  if(registered&&(!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/i.test(registered)||!Number.isFinite(Date.parse(registered)))){
   throw new Error(`CSV row ${index+2} has an invalid registration date. Use an ISO date or timestamp with a time zone.`);
  }
  return {sourceRow:index+2,attendeeId,firstName,lastName,email:address,company:value(row,company),jobTitle:value(row,role),linkedin:value(row,linkedin),registeredAt:registered?new Date(registered).toISOString():''};
 });
}

export function parseMptsCheckins(csv:string){
 const {rows,first,last,email,find,value}=readRows(csv);
 const status=find(['check-in status','attendance status','status']);
 if(status<0)throw new Error('The CSV needs a check-in status column.');
 return rows.map((row,index)=>{
  const key=value(row,status).toLowerCase();
  const address=value(row,email).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw new Error(`CSV row ${index+2} needs a valid attendee email.`);
  if(!['checked in','checked out','attended','no show'].includes(key))throw new Error(`CSV row ${index+2} has an unknown check-in status.`);
  return {firstName:value(row,first),lastName:value(row,last),email:address,status:key==='no show'?'no_show':'attended'};
 });
}
