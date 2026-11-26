import {useEffect,type RefObject} from 'react';
/** Label simple owner tables for phone cards using their existing column headings. */
export function useOwnerMobileTables(root:RefObject<HTMLElement>){
 useEffect(()=>{const node=root.current;if(!node)return;let frame=0;
 const label=()=>{node.querySelectorAll('table').forEach(table=>{const headers=Array.from(table.querySelectorAll('thead th'));const rows=Array.from(table.querySelectorAll('tbody tr'));if(!headers.length||rows.some(row=>row.children.length!==headers.length||Array.from(row.children).some(cell=>cell.hasAttribute('colspan')||cell.hasAttribute('rowspan'))))return;
 table.setAttribute('data-mobile-table','');table.setAttribute('role','table');table.querySelectorAll('tr').forEach(row=>row.setAttribute('role','row'));headers.forEach(cell=>cell.setAttribute('role','columnheader'));rows.forEach(row=>Array.from(row.children).forEach((cell,index)=>{cell.setAttribute('data-cell-label',headers[index].textContent?.trim()??'');cell.setAttribute('role','cell');}));});};
 label();const observer=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(label);});observer.observe(node,{childList:true,subtree:true,characterData:true});return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[root]);
}
