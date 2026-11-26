export type GalleryImage={id:string;path:string;filename:string;caption:string;createdAt:string;size:number;archivedAt?:string|null};
export async function validateGalleryImage(file:File){
 if(!file.size||file.size>10*1024*1024)throw new Error('Choose an image up to 10 MB.');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const type=png?'image/png':jpeg?'image/jpeg':webp?'image/webp':'';
 if(!type||file.type!==type)throw new Error('Choose a valid JPEG, PNG or WebP image. SVG and other formats are not supported.');
 return type;
}
