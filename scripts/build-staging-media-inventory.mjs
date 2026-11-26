import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import {basename,extname,join} from 'node:path';
import {execFileSync} from 'node:child_process';

const imageExtensions=new Set(['.jpg','.jpeg','.png','.webp','.avif','.gif','.svg']);
const files=execFileSync('git',['ls-files','-z','public','src/assets','src/content','src/components','src/pages','src/lib'],{encoding:'utf8'}).split('\0').filter(Boolean);
const imageFiles=files.filter(path=>imageExtensions.has(extname(path).toLowerCase()));
const references=await Promise.all(files.filter(path=>/\.(json|tsx|ts|css)$/.test(path)).map(async path=>({path,text:await readFile(path,'utf8')})));
const buildAssets=await readdir('dist/assets').catch(()=>[]);

function dimensions(bytes,extension){
 if(extension==='.png'&&bytes.length>=24&&bytes.subarray(1,4).toString()==='PNG')return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
 if(extension==='.gif'&&bytes.length>=10&&bytes.subarray(0,3).toString()==='GIF')return [bytes.readUInt16LE(6),bytes.readUInt16LE(8)];
 if(extension==='.jpg'||extension==='.jpeg'){
  for(let i=2;i+9<bytes.length&&bytes[i]===255;){
   const marker=bytes[i+1];
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return [bytes.readUInt16BE(i+7),bytes.readUInt16BE(i+5)];
   const length=bytes.readUInt16BE(i+2);if(length<2||marker===218)break;i+=2+length;
  }
 }
 if(extension==='.webp'&&bytes.length>=30){
  const type=bytes.subarray(12,16).toString();
  if(type==='VP8X')return [bytes.readUIntLE(24,3)+1,bytes.readUIntLE(27,3)+1];
  if(type==='VP8L'&&bytes[20]===47){const n=bytes.readUInt32LE(21);return [(n&16383)+1,((n>>>14)&16383)+1];}
  if(type==='VP8 ')return [bytes.readUInt16LE(26)&16383,bytes.readUInt16LE(28)&16383];
 }
 return [null,null];
}
function category(path){
 if(/sponsor|partner|logo|faultline/i.test(path))return 'Sponsor and partner logos';
 if(/headshot|portrait|speaker|team/i.test(path))return 'Profile imagery';
 if(/hero|banner/i.test(path))return 'Website heroes';
 if(/insight|blog|editorial/i.test(path))return 'Editorial photography';
 if(/event|off.air|ibc|mpts/i.test(path))return 'Event photography and artwork';
 return 'Website imagery';
}
const byDigest=new Map();
for(const path of imageFiles){
 const bytes=await readFile(path);
 const digest=createHash('sha256').update(bytes).digest('hex');
 const filename=basename(path);
 const extension=extname(path).toLowerCase();
 const [width,height]=dimensions(bytes,extension);
 let url=null;
 if(path.startsWith('public/')&&!path.startsWith('public/admin/')){
  const relativePath=path.slice('public/'.length);
  const deployed=await stat(join('dist',relativePath)).catch(()=>null);
  if(deployed?.isFile()) url='/'+relativePath.split('/').map(encodeURIComponent).join('/');
 }else if(path.startsWith('src/assets/')){
  const stem=filename.slice(0,-extension.length);
  const candidates=buildAssets.filter(name=>name.startsWith(stem+'-')&&name.endsWith(extension));
  for(const candidate of candidates){
   if(createHash('sha256').update(await readFile(join('dist/assets',candidate))).digest('hex')!==digest)continue;
   url='/assets/'+encodeURIComponent(candidate);
   break;
  }
 }
 const aliases=byDigest.get(digest)??[];
 const uses=references.filter(ref=>ref.text.includes('/'+path.replace(/^public\//,''))||ref.text.includes('/'+filename)).map(ref=>ref.path);
 aliases.push({path,url,uses,filename,extension,width,height,category:category(path),size:bytes.length,date:(await stat(path)).mtime.toISOString()});
 byDigest.set(digest,aliases);
}
const rows=[...byDigest.entries()].map(([id,files])=>({id,files})).sort((a,b)=>a.files[0].filename.localeCompare(b.files[0].filename));
if(process.env.DEPLOY_TARGET==='staging'){
 await mkdir('dist/admin',{recursive:true});
 await writeFile('dist/admin/media-inventory.json',JSON.stringify(rows.flatMap(row=>{
  const published=row.files.filter(file=>file.url&&file.uses.length);
  return published.length?[{id:row.id,files:published}]:[];
 })));
}
await writeFile(process.env.MEDIA_INVENTORY_REPORT??'/tmp/media-library-inventory.json',JSON.stringify({sourceCount:imageFiles.length,uniqueHashes:rows.length,rows},null,2));
console.log(`Inventoried ${imageFiles.length} repository image paths, ${rows.length} distinct file hashes.`);
