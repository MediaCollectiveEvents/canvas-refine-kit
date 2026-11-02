import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import EventsPreview from '../src/cms/previews/EventsPreview';
import {getAllEvents} from '../src/lib/events';
test('individual preview renders draft summary and description without saving or leaking listing CTA',()=>{
 const before=JSON.stringify(getAllEvents());
 const entry={getIn:()=>({toJS:()=>({events:[{id:99,title:'Unsaved event',date:'2099-01-01',summary:'Unsaved summary',description:'Unsaved body'}]})})};
 const html=renderToStaticMarkup(createElement(EventsPreview,{entry,initialEventId:99}));
 assert.doesNotMatch(html,/Unsaved summary/);assert.match(html,/Unsaved body/);
 assert.match(html,/Keep event ID 1/, 'upstream protected-ID diagnostics remain visible');
 assert.doesNotMatch(html,/Want to attend our next event\?/);
 assert.equal(JSON.stringify(getAllEvents()),before);
});
