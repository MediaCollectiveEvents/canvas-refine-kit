import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { FrankfurtOwnerClient } from '@/lib/sponsor-reports/supabase-connection';

const panels = [
  { slug: 'the-debrief', title: 'The Debrief' },
  { slug: 'ai-survival-guide', title: 'AI Survival Guide' },
  { slug: 'faultline-futures', title: 'Faultline Futures' },
];

function Panel({ slug, title, client }: { slug: string; title: string; client: FrankfurtOwnerClient }) {
  const [audio, setAudio] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');

  async function open(format: 'm4a' | 'docx') {
    setPending(format);
    setError('');
    try {
      const url = await client.panelFile(slug, format);
      if (format === 'm4a') setAudio(url);
      else window.location.assign(url);
    } catch {
      setError('This file could not be opened. Please try again.');
    } finally {
      setPending('');
    }
  }

  return <li className="space-y-3 rounded-xl border border-white/15 p-5">
    <h3 className="font-display text-xl">{title}</h3>
    <div className="flex flex-wrap items-center gap-3">
      {audio
        ? <audio aria-label={`Recording of ${title}`} className="w-full max-w-md" src={audio} controls preload="none"
            onError={() => { setAudio(''); setError('Playback stopped. Open the recording again to retry.'); }} />
        : <Button type="button" variant="outline" disabled={!!pending} onClick={() => void open('m4a')}>
            {pending === 'm4a' ? 'Opening…' : 'Open recording'}
          </Button>}
      <Button type="button" variant="outline" disabled={!!pending} onClick={() => void open('docx')}>
        {pending === 'docx' ? 'Preparing…' : 'Download working transcript (Word)'}
      </Button>
    </div>
    {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
  </li>;
}

export default function OffAirPanelRecordings({ client, sponsor }: { client: FrankfurtOwnerClient; sponsor?: string }) {
  const [available, setAvailable] = useState<string[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let current = true;
    setAvailable(null);
    setError(false);
    client.panelRecordings(sponsor).then(
      result => { if (current) setAvailable(result); },
      () => { if (current) setError(true); },
    );
    return () => { current = false; };
  }, [client, sponsor]);

  if (sponsor && !error && available?.length === 0) return null;

  return <section aria-labelledby="off-air-panel-recordings" className="my-8 space-y-4">
    <h2 id="off-air-panel-recordings" className="font-display text-2xl font-semibold">Panel recordings and transcripts</h2>
    {error ? <p role="alert">Panel recordings could not be loaded. Open this section again to retry.</p>
      : available === null ? <p role="status">Loading panel recordings…</p>
      : available.length === 0 ? <p>No panel recordings have been published.</p>
      : <ul className="space-y-3">
          {panels.filter(panel => available.includes(panel.slug)).map(panel => <Panel key={panel.slug} {...panel} client={client} />)}
        </ul>}
  </section>;
}
