import React from 'react';
import {getKeywordSnapshot,getTaxonomy} from '@/lib/taxonomy';
interface Props {
  value?: unknown;
  field: {get(name:string):unknown};
  className?:string;
  forID?:string;
  onChange(value:string[]):void;
}

export default class ApprovedTaxonomyControl extends React.Component<Props,{search:string}> {
  state={search:''};
  render(){
    const {value,field,className,forID,onChange}=this.props;
    const layer=field.get('layer');
    const taxonomy=getTaxonomy();
    const terms=layer==='area'?taxonomy.areas:layer==='theme'?taxonomy.topics:getKeywordSnapshot();
    const unpacked=value && typeof value==='object' && 'toJS' in value && typeof value.toJS==='function'?value.toJS():value;
    const ids=Array.isArray(unpacked)?unpacked.filter((id):id is string=>typeof id==='string'):[];
    const search=this.state.search.trim().toLowerCase();
    const matches=terms.filter(term=>term.active&&(term.label.toLowerCase().includes(search)||term.id.includes(search)));
    const historical=ids.filter(id=>!terms.some(term=>term.id===id&&term.active));
    return <div className={className}>
      <input id={forID} aria-label="Search approved terms" value={this.state.search} onChange={event=>this.setState({search:event.target.value})}/>
      <div style={{maxHeight:240,overflow:'auto'}}>
        {matches.map(term=><label key={term.id} style={{display:'block'}}>
          <input type="checkbox" checked={ids.includes(term.id)} onChange={event=>onChange(event.target.checked?[...ids,term.id]:ids.filter(id=>id!==term.id))}/>{term.label}
        </label>)}
      </div>
      {!matches.length&&<p>No active terms match.</p>}
      {historical.map(id=><label key={id} style={{display:'block'}}><input type="checkbox" checked onChange={()=>onChange(ids.filter(item=>item!==id))}/>{terms.find(term=>term.id===id)?.label??id} (historical)</label>)}
    </div>;
  }
}
