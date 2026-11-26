import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {FrankfurtOwnerClient} from '@/lib/sponsor-reports/supabase-connection';
import {emptyBio, type SpeakerBio, type SpeakerProfile} from '@/lib/speakers/profiles';
import SpeakerBioFields from '@/components/speakers/SpeakerBioFields';
import InsightArticleBody from './InsightArticleBody';
import type {InsightPicture} from '@/lib/contentMetadata';
import InsightTaxonomyFields from './InsightTaxonomyFields';

type Draft = {
  profile: SpeakerBio; title: string; standfirst: string; body: string; summary: string;
  quick: boolean; category: string; series: string; keywords: string; selected: string[]; keywordIds?: string[];
  logo: string; images: (InsightPicture & {permission: boolean})[]; featured?: boolean; relatedEventIds?: number[];
};
type Row = { id: string; draft: Draft; revision: number; status: string; feedback: string; publishedSlug?: string; expiresAt?: string };

const categories = ['Industry Analysis', 'Perspectives', 'Event Insights', 'Research & Intelligence', 'Community Stories'];
const field = 'mt-2 block w-full rounded border border-white/20 bg-[#102630] p-3';
const tommyProfile = {
  ...emptyBio, name: 'Tommy Flanagan', jobTitle: 'Editor', company: 'Faultline',
  companyUrl: 'https://rethinkresearch.biz/',
  linkedinUrl: 'https://www.linkedin.com/in/tomflan01/',
  bio: 'Tommy Flanagan edits Faultline at Rethink Research, covering the technology behind video delivery. He leads webinars and podcast discussions, contributes to Rethink TV research and has consulted for technology vendors and investors.',
};

export default function OwnerInsights({client}: {client: FrankfurtOwnerClient}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>([]);
  const [speaker, setSpeaker] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [feedback, setFeedback] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [related, setRelated] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function select(row: Row | null) {
    setSelected(row);
    setDraft(row?.draft ?? null);
    setFeedback('');
    setEditing(false);
    setRelated(row?.draft.relatedEventIds?.join(', ') ?? '');
  }

  async function run(action: string, data: object = {}) {
    setBusy(true);
    setError('');
    setMessage('');
    setLink('');
    try {
      if (action === 'load') {
        setSpeakers(await client.speakers({p_action:'list'}) as unknown as SpeakerProfile[]);
      } else {
        const result = await client.insights({p_action:action,p_data:data}) as unknown as {token?:string};
        if (result.token) setLink(location.origin + '/insights/submit#key=' + result.token);
      }
      const result = await client.insights({p_action:'list',p_data:{}}) as unknown as {rows: Row[]};
      setRows(result.rows);
      select(result.rows.find(row => row.id === selected?.id) ?? null);
      setMessage(({approve:'Approved. Use Publish to put this article on staging Insights.',publish:'Published on staging Insights.',unpublish:'Removed from staging Insights.'} as Record<string,string>)[action] ?? 'Saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Staging database unavailable.');
    } finally {
      setBusy(false);
    }
  }

  function change(values: Partial<Draft>) { setDraft(previous => previous ? {...previous, ...values} : previous); }

  const args = selected ? {id:selected.id,revision:selected.revision} : {};
  const matchingTommy = speakers.find(item => item.profile.name.trim().toLowerCase() === 'tommy flanagan');
  const canEdit = selected?.status === 'pending' || selected?.status === 'approved';

  return <section className="my-8 space-y-5 rounded-xl border border-white/15 p-6">
    <h2 className="font-display text-2xl">Insights Management</h2>
    <p>Private staging invitations expire after 30 days. Each link opens one submission.</p>
    <Button disabled={busy} onClick={()=>void run('load')}>Load speaker profiles and submissions</Button>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {message && <p role="status" className="text-primary">{message}</p>}
    <label className="block">Contributor profile
      <select className={field} value={speaker} onChange={event=>setSpeaker(event.target.value)}>
        <option value="">New contributor (blank profile)</option>
        {!matchingTommy && <option value="tommy-public">Tommy Flanagan · Faultline (public profile)</option>}
        {speakers.map(item => <option key={item.id} value={item.id}>{item.profile.name || 'Unnamed'} · {item.profile.company}</option>)}
      </select>
    </label>
    <Button disabled={busy} onClick={()=>void run('invite', speaker === 'tommy-public' ? {profile:tommyProfile,logo:'/uploads/featured-faultline.png'} : {speakerId:speaker||null})}>Generate private invitation</Button>
    {link && <div className="space-y-2">
      <label>Private invitation link<input className={field} readOnly value={link}/></label>
      <Button variant="outline" onClick={()=>void navigator.clipboard.writeText(link).then(()=>setMessage('Link copied.')).catch(()=>setError('Copy the displayed link manually.'))}>Copy link</Button>
    </div>}
    <h3 className="font-display text-xl">Submissions</h3>
    {rows.map(row => <button type="button" key={row.id} onClick={()=>{select(row);setLink('');}} className="block w-full border border-white/20 p-3 text-left">
      {row.draft.title || 'Untitled draft'} · {row.draft.profile.name || 'New contributor'} · {row.status.replaceAll('_',' ')}{row.publishedSlug && ' · Published'}
    </button>)}
    {selected && draft && <section className="space-y-4 border-t border-white/15 pt-5">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={()=>setMobile(false)}>Desktop</Button>
        <Button variant="outline" onClick={()=>setMobile(true)}>Mobile</Button>
        <Button variant="outline" disabled={!canEdit || busy} onClick={()=>setEditing(!editing)}>{editing ? 'Preview article' : 'Edit article and profile'}</Button>
      </div>
      {editing ? <div className="space-y-4">
        <SpeakerBioFields value={draft.profile} onChange={profile=>change({profile})} onBusy={setBusy}/>
        {(['title','standfirst','body','summary' ,'series'] as const).map(key =>
          <label className="block capitalize" key={key}>{key}<textarea className={field} rows={key === 'body' ? 12 : 2} value={draft[key]} onChange={event=>change({[key]:event.target.value})}/></label>)}
        <label className="block">Category<select className={field} value={draft.category} onChange={event=>change({category:event.target.value})}>{categories.map(category=><option key={category}>{category}</option>)}</select></label>
        <label className="flex gap-2"><input type="checkbox" checked={draft.quick} onChange={event=>change({quick:event.target.checked})}/>Include Quick Read</label>
        <label className="flex gap-2"><input type="checkbox" checked={!!draft.featured} onChange={event=>change({featured:event.target.checked})}/>Feature on Insights</label>
        <InsightTaxonomyFields text={[draft.title,draft.standfirst,draft.body].join('\n')} themes={draft.selected} keywords={draft.keywordIds??[]}
          onChange={(themes,keywords)=>change({selected:themes,keywordIds:keywords})}/>
        <label className="block">Related event IDs<input className={field} value={related} onChange={event=>setRelated(event.target.value)}/></label>
        <Button disabled={busy || (related.trim() !== '' && !/^\s*[1-9]\d{0,8}(\s*,\s*[1-9]\d{0,8}){0,9}\s*$/.test(related))} onClick={()=>void run('edit',{...args,draft:{...draft,relatedEventIds:related.trim()?related.split(',').map(Number):[]}})}>Save editorial edits for review</Button>
      </div> : <article className={'mx-auto space-y-5 bg-[#101d24] p-5 '+(mobile?'max-w-[375px]':'max-w-3xl')}>
        <p className="text-primary">{[draft.series,draft.category].filter(Boolean).join(' · ')}</p>
        <h3 className="font-display text-3xl">{draft.title || 'Untitled draft'}</h3><p>{draft.standfirst}</p>
        <InsightArticleBody key={selected.id} article={{slug:'preview',date:'',title:draft.title,excerpt:draft.standfirst,category:draft.category,body:draft.body,summary:draft.quick?draft.summary:'',profile:draft.profile,logo:draft.logo,images:draft.images}}/>
      </article>}
      <label>Editorial feedback<textarea className={field} maxLength={2000} value={feedback} onChange={event=>setFeedback(event.target.value)}/></label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy||editing||selected.status!=='pending'} onClick={()=>void run('approve',args)}>Approve article</Button>
        <Button variant="outline" disabled={busy||editing||selected.status!=='pending'||!feedback.trim()} onClick={()=>void run('return',{...args,feedback})}>Request amendments</Button>
        <Button disabled={busy||editing||selected.status!=='approved'} onClick={()=>void run('publish',args)}>Publish to staging</Button>
        {selected.publishedSlug && <><a className="underline" href={'/insights/'+selected.publishedSlug}>View published article</a><Button variant="outline" disabled={busy} onClick={()=>void run('unpublish',args)}>Unpublish</Button></>}
        <Button variant="outline" disabled={busy} onClick={()=>void run('revoke',args)}>Revoke invitation</Button>
        <Button variant="outline" disabled={busy} onClick={()=>void run('renew',args)}>Renew invitation</Button>
      </div>
    </section>}
  </section>;
}
