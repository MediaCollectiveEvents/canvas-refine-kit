import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Button} from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/shared/Seo';

type ImageFile={path:string;url:string;uses:string[];filename:string;extension:string;width:number|null;height:number|null;category:string;size:number;date:string};
type Entry={id:string;files:ImageFile[]};
type Source={url:string;name:string;id:string};
const presets=[['Original',0],['Freeform',-1],['1:1',1],['4:5',4/5],['3:2',3/2],['4:3',4/3],['16:9',16/9],['9:16',9/16],['1.91:1',1.91],['21:9',21/9]] as const;
const clamp=(value:number,maximum:number)=>Math.max(0,Math.min(value,maximum));
const orientation=(file:ImageFile)=>!file.width||!file.height?'Unknown':file.width===file.height?'Square':file.width>file.height?'Landscape':'Portrait';
const input='mt-1 block w-full rounded border border-white/25 bg-[#102630] p-2';

function download(blob:Blob,name:string){
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download=name;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}

function CropEditor({source,onClose}:{source:Source;onClose:()=>void}){
 const [image,setImage]=useState<HTMLImageElement|null>(null);
 const [preset,setPreset]=useState(0);
 const [rotate,setRotate]=useState(0);
 const [flipX,setFlipX]=useState(false);
 const [flipY,setFlipY]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [xy,setXY]=useState({x:.5,y:.5});
 const [focal,setFocal]=useState<{x:number;y:number}|null>(null);
 const [pickFocal,setPickFocal]=useState(false);
 const [width,setWidth]=useState('');
 const [height,setHeight]=useState('');
 const [format,setFormat]=useState('image/webp');
 const [preview,setPreview]=useState<string|null>(null);
 const [status,setStatus]=useState('');
 const geometry=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let live=true;
  const next=new Image();next.src=source.url;
  next.decode().then(()=>{
   if(!live)return;
   if(next.naturalWidth*next.naturalHeight>40000000){setStatus('Choose an image under 40 megapixels.');return;}
   setImage(next);
  }).catch(()=>{if(live)setStatus('The image could not be opened.');});
  return ()=>{live=false;};
 },[source.url]);

 const w=image?(rotate%180?image.naturalHeight:image.naturalWidth):1;
 const h=image?(rotate%180?image.naturalWidth:image.naturalHeight):1;
 const ratio=preset>0?preset:preset===-1&&Number(width)>0&&Number(height)>0?Number(width)/Number(height):w/h;
 const cropWidth=Math.max(1,Math.floor(Math.min(w,h*ratio)/zoom));
 const cropHeight=Math.max(1,Math.floor(Math.min(h,w/ratio)/zoom));
 const left=Math.round((w-cropWidth)*xy.x);
 const top=Math.round((h-cropHeight)*xy.y);
 const scale=Math.min(1, Number(width)>0?Number(width)/cropWidth:1, Number(height)>0?Number(height)/cropHeight:1);
 const outWidth=Math.max(1,Math.floor(cropWidth*scale));
 const outHeight=Math.max(1,Math.floor(cropHeight*scale));

 function draw(canvas:HTMLCanvasElement,full:boolean){
  if(!image)return;
  const target=full?Math.min(1,960/Math.max(w,h)):outWidth/cropWidth;
  canvas.width=full?Math.round(w*target):outWidth;
  canvas.height=full?Math.round(h*target):outHeight;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  if(!full&&format==='image/jpeg'){ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.scale(target,full?target:outHeight/cropHeight);
  ctx.translate(w/2-(full?0:left),h/2-(full?0:top));
  ctx.rotate(rotate*Math.PI/180);
  ctx.scale(flipX?-1:1,flipY?-1:1);
  ctx.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);
 }
 useEffect(()=>{if(geometry.current)draw(geometry.current,true);},[image,rotate,flipX,flipY]);
 useEffect(()=>{setPreview(null);},[rotate,flipX,flipY,zoom,xy,preset,width,height,format]);
 function reset(){
  setPreset(0);setRotate(0);setFlipX(false);setFlipY(false);setZoom(1);setXY({x:.5,y:.5});
  setFocal(null);setPickFocal(false);setWidth('');setHeight('');setPreview(null);setStatus('');
 }
 function output(save:boolean){
  if(!image)return;
  const canvas=document.createElement('canvas');draw(canvas,false);
  if(!save){setPreview(canvas.toDataURL(format,.88));return;}
  canvas.toBlob(blob=>{
   if(!blob){setStatus('The derivative could not be exported.');return;}
   const ext=blob.type==='image/jpeg'?'jpg':blob.type==='image/png'?'png':'webp';
   const name=source.name.replace(/\.[^.]+$/,'')+'-crop-'+crypto.randomUUID().slice(0,8);
   download(blob,name+'.'+ext);
   const metadata={original:source.id,originalName:source.name,variant:name+'.'+ext,
    crop:{left,top,width:cropWidth,height:cropHeight,space:'rotated image'},aspectRatio:ratio,
    focalPoint:focal,rotate,flipX,flipY,width:outWidth,height:outHeight,format:blob.type};
   download(new Blob([JSON.stringify(metadata,null,2)],{type:'application/json'}),name+'.json');
   setStatus('Derivative and crop metadata exported.');
  },format,.88);
 }
 return <section className="space-y-4 rounded-xl border border-white/20 p-4" aria-label="Crop editor">
  <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl">{source.name}</h2><Button variant="outline" onClick={onClose}>Close editor</Button></div>
  {status&&<p role="status">{status}</p>}
  {image&&<>
   <div className="mx-auto max-w-3xl">
    <div className="relative touch-none overflow-hidden rounded border border-white/20"
      onPointerDown={event=>{
       const r=event.currentTarget.getBoundingClientRect();
       const x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;
       if(pickFocal){setFocal({x:clamp(x,1),y:clamp(y,1)});setPickFocal(false);}
       else {event.currentTarget.setPointerCapture(event.pointerId);setXY({x:clamp((x*w-cropWidth/2)/Math.max(1,w-cropWidth),1),y:clamp((y*h-cropHeight/2)/Math.max(1,h-cropHeight),1)});}
      }}
      onPointerMove={event=>{
       if(!event.currentTarget.hasPointerCapture(event.pointerId)||!event.buttons||pickFocal)return;
       const r=event.currentTarget.getBoundingClientRect();
       setXY({x:clamp(((event.clientX-r.left)/r.width*w-cropWidth/2)/Math.max(1,w-cropWidth),1),
       y:clamp(((event.clientY-r.top)/r.height*h-cropHeight/2)/Math.max(1,h-cropHeight),1)});
      }}>
      <canvas ref={geometry} className="block h-auto w-full bg-[#14232c]"/>
      <div aria-hidden="true" className="pointer-events-none absolute border-2 border-primary"
       style={{left:left/w*100+'%',top:top/h*100+'%',width:cropWidth/w*100+'%',height:cropHeight/h*100+'%',boxShadow:'0 0 0 2000px #0007'}}>
       <div className="grid h-full grid-cols-3 grid-rows-3">{Array.from({length:9},(_,i)=><span key={i} className="border border-white/25"/>)}</div>
      </div>
      {focal&&<span aria-hidden="true" className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary" style={{left:focal.x*100+'%',top:focal.y*100+'%'}}/>}
    </div>
   </div>
   <div className="grid gap-4 sm:grid-cols-3">
    <label>Aspect ratio<select className={input} value={preset} onChange={e=>setPreset(Number(e.target.value))}>{presets.map(([name,value])=><option key={name} value={value}>{name}</option>)}</select></label>
    <label>Output width<input className={input} inputMode="numeric" type="number" value={width} min={1} onChange={e=>setWidth(e.target.value)}/></label>
    <label>Output height<input className={input} inputMode="numeric" type="number" value={height} min={1} onChange={e=>setHeight(e.target.value)}/></label>
    <label>Zoom<input className="block w-full" type="range" min={1} max={6} step={.05} value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
    <label>Horizontal position<input className="block w-full" type="range" min={0} max={1} step={.01} value={xy.x} onChange={e=>setXY({...xy,x:Number(e.target.value)})}/></label>
    <label>Vertical position<input className="block w-full" type="range" min={0} max={1} step={.01} value={xy.y} onChange={e=>setXY({...xy,y:Number(e.target.value)})}/></label>
    <label>Format<select className={input} value={format} onChange={e=>setFormat(e.target.value)}><option value="image/webp">WebP</option><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select></label>
   </div>
   <p>{outWidth} × {outHeight} px</p>
   <div className="flex flex-wrap gap-2">
    <Button variant="outline" onClick={()=>setRotate((rotate+90)%360)}>Rotate 90°</Button>
    <Button variant="outline" aria-pressed={flipX} onClick={()=>setFlipX(!flipX)}>Flip horizontally</Button>
    <Button variant="outline" aria-pressed={flipY} onClick={()=>setFlipY(!flipY)}>Flip vertically</Button>
    <Button variant="outline" aria-pressed={pickFocal} onClick={()=>setPickFocal(!pickFocal)}>Choose focal point</Button>
    <Button variant="outline" onClick={reset}>Reset</Button>
    <Button variant="outline" onClick={()=>output(false)}>Preview crop</Button>
    <Button onClick={()=>output(true)}>Export derivative</Button>
   </div>
   {preview&&<img className="max-h-[480px] w-full object-contain" src={preview} alt="Edited image preview"/>}
  </>}
 </section>;
}

export default function MediaLibrary(){
 const [assets,setAssets]=useState<Entry[]>([]);
 const [local,setLocal]=useState<Source[]>([]);
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState('');
 const [shape,setShape]=useState('');
 const [order,setOrder]=useState('name');
 const [list,setList]=useState(false);
 const [thumb,setThumb]=useState(172);
 const [selected,setSelected]=useState<string[]>([]);
 const [editor,setEditor]=useState<Source|null>(null);
 const [preview,setPreview]=useState<ImageFile|null>(null);
 const [status,setStatus]=useState('');
 const localUrls=useRef<string[]>([]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/admin/media-inventory.json',{signal:controller.signal}).then(response=>{
   if(!response.ok)throw Error('The staging image inventory is unavailable.');
   return response.json();
  }).then(setAssets).catch(error=>{if(!controller.signal.aborted)setStatus(error.message);});
  return ()=>{controller.abort();for(const url of localUrls.current)URL.revokeObjectURL(url);};
 },[]);
 const categories=[...new Set(assets.flatMap(asset=>asset.files.map(file=>file.category)))].sort();
 const rows=assets.flatMap(asset=>{
  const file=asset.files.find(file=>(!category||file.category===category)&&(!shape||orientation(file)===shape)&&
   [file.filename,file.category,file.path,...file.uses].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  return file?[{...asset,file}]:[];
 }).sort((a,b)=>order==='date'?b.file.date.localeCompare(a.file.date):a.file.filename.localeCompare(b.file.filename));
 async function add(files:FileList){
  const next:Source[]=[];
  for(const file of Array.from(files).slice(0,30)){
   if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>20000000)continue;
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),byte=>byte.toString(16).padStart(2,'0')).join('');
   if(assets.some(asset=>asset.id===digest)||local.some(asset=>asset.id===digest)||next.some(asset=>asset.id===digest))continue;
   const url=URL.createObjectURL(file);localUrls.current.push(url);next.push({url,name:file.name,id:digest});
  }
  setLocal(old=>[...old,...next]);setStatus(next.length+' local images added for editing. Unsupported files and duplicates were skipped.');
 }
 return <div className="min-h-screen bg-background text-white">
  <Seo title="Media Library — Staging" noindex/><Header/>
  <main id="main-content" className="site-header-clearance"><div className="site-container space-y-5 px-6 py-12">
   <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="font-display text-4xl">Media Library</h1><a href="/admin/" className="text-primary underline">Return to CMS</a></div>
   <p>Browse staging website images and export separate crops for your page or article.</p>
   {status&&<p role="status">{status}</p>}
   <div className="grid gap-3 md:grid-cols-4">
    <label>Search images<input className={input} value={search} onChange={event=>setSearch(event.target.value)}/></label>
    <label>Category<select className={input} value={category} onChange={event=>setCategory(event.target.value)}><option value="">All categories</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
    <label>Orientation<select className={input} value={shape} onChange={event=>setShape(event.target.value)}><option value="">All orientations</option>{['Landscape','Portrait','Square','Unknown'].map(value=><option key={value}>{value}</option>)}</select></label>
    <label>Sort<select className={input} value={order} onChange={event=>setOrder(event.target.value)}><option value="name">Name</option><option value="date">Inventory date</option></select></label>
   </div>
   <div className="flex flex-wrap items-center gap-4"><Button variant="outline" onClick={()=>setList(!list)}>{list?'Grid view':'List view'}</Button>
    {!list&&<label>Thumbnail size <input type="range" min={110} max={280} value={thumb} onChange={event=>setThumb(Number(event.target.value))}/></label>}
    <p>{rows.length} images · {selected.length} selected</p>
    {!!selected.length&&<Button variant="outline" onClick={()=>download(new Blob([assets.filter(asset=>selected.includes(asset.id)).map(asset=>asset.files[0].url).join('\n')],{type:'text/plain'}),'selected-image-urls.txt')}>Export selected URLs</Button>}
   </div>
   <div className="space-y-3 rounded-lg border border-dashed border-white/30 p-4" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();void add(event.dataTransfer.files);}}>
    <label>Open images from this device for cropping<input className="mt-2 block max-w-full" type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" onChange={event=>{if(event.currentTarget.files)void add(event.currentTarget.files);}}/></label>
    {local.map(asset=><Button key={asset.id} variant="outline" onClick={()=>setEditor(asset)}>Edit {asset.name}</Button>)}
   </div>
   {editor&&<CropEditor key={editor.id} source={editor} onClose={()=>setEditor(null)}/>}
   {preview&&<section className="space-y-3 rounded border border-white/20 p-4" aria-label="Full image preview">
    <div className="flex flex-wrap justify-between gap-2"><strong>{preview.filename}</strong><Button variant="outline" onClick={()=>setPreview(null)}>Close preview</Button></div>
    <img src={preview.url} alt={preview.filename} className="max-h-[75vh] w-full object-contain"/>
    <p>{preview.width??'Unknown'} × {preview.height??'Unknown'} · {Math.round(preview.size/1024)} KB</p>
    <p>{preview.uses.length?'Reference matches: '+preview.uses.join(', '):'No matching source references found.'}</p>
    <a className="text-primary underline" href={preview.url}>Open original</a>
   </section>}
   <div className={list?'space-y-2':'grid gap-3'} style={!list?{gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,var(--thumb)),1fr))','--thumb':thumb+'px'} as CSSProperties:undefined}>
    {rows.map(({id,file})=><article key={id} className={'rounded-lg border border-white/15 p-3 '+(list?'flex flex-wrap items-center gap-4':'space-y-2')}>
     <button type="button" onClick={()=>setPreview(file)} className={list?'w-24':'w-full'} aria-label={'Preview '+file.filename}><img src={file.url} loading="lazy" alt="" className="aspect-[4/3] w-full bg-[#102630] object-contain"/></button>
     <label className="flex min-w-0 items-start gap-2 text-sm"><input type="checkbox" checked={selected.includes(id)} onChange={event=>setSelected(event.target.checked?[...selected,id]:selected.filter(value=>value!==id))}/><span className="break-all">{file.filename}</span></label>
     <Button variant="outline" disabled={file.extension==='.svg'||file.extension==='.gif'} onClick={()=>setEditor({id,url:file.url,name:file.filename})}>Edit / crop</Button>
    </article>)}
   </div>
  </div></main><Footer hideAttendanceCTA/>
 </div>;
}
