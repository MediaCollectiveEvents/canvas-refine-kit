import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { isEventHubStaging } from '@/lib/event-hub-backend';
import type { FrankfurtOwnerClient } from '@/lib/sponsor-reports/supabase-connection';

const defaultSubject = 'OFF AIR recordings and transcripts are now available';
const defaultMessage = `Hi,

The three OFF AIR panel recordings and their working transcripts are now available in the Event Hub.

• The Debrief
• AI Survival Guide
• Faultline Futures

Sign in with the email address you use for OFF AIR and open Event information → Panel recordings and transcripts:
https://www.mediacollective.events/eventhub/

If you use an event-specific sign-in link, you can continue to use that link.

Best,
Chris
The Media Collective`;

export default function OwnerOffAirUpdate({ client }: { client: FrankfurtOwnerClient }) {
  const [recipients, setRecipients] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [tested, setTested] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const retry = useRef<{ fingerprint: string; requestId: string } | null>(null);
  const content = JSON.stringify([subject.trim(), message]);
  const canSend = !!subject.trim() && !!message.trim() && !busy && !isEventHubStaging;

  async function refreshRecipients() {
    setBusy(true);
    setError('');
    setConfirmSend(false);
    try {
      const access = await client.sponsors();
      const addresses = [...new Set(access.filter(account => account.active && account.confirmed && !account.deletedAt)
        .map(account => account.email.trim().toLowerCase()).filter(Boolean))].sort();
      setRecipients(addresses);
      setSelected(previous => previous.filter(email => addresses.includes(email)));
    } catch {
      setRecipients(null);
      setSelected([]);
      setError('Could not load the latest OFF AIR access list. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function send(action: 'test' | 'send') {
    if (!canSend || (action === 'send' && (tested !== content || !confirmSend || !selected.length))) return;
    const addresses = action === 'test' ? [] : [...selected].sort();
    const fingerprint = JSON.stringify([action, content, addresses]);
    if (retry.current?.fingerprint !== fingerprint) retry.current = { fingerprint, requestId: crypto.randomUUID() };
    const requestId = retry.current.requestId;
    setBusy(true);
    setStatus('');
    setError('');
    try {
      const accepted = await client.sendOffAirUpdate({ action, subject: subject.trim(), message, recipients: addresses, requestId });
      retry.current = null;
      if (action === 'test') {
        setTested(content);
        setStatus('Test accepted for delivery. Check your inbox before sending to partners.');
      } else {
        setConfirmSend(false);
        setSelected([]);
        setStatus(`Email accepted for delivery to ${accepted} ${accepted === 1 ? 'recipient' : 'recipients'}.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Email acceptance could not be confirmed.');
    } finally {
      setBusy(false);
    }
  }

  return <section aria-labelledby="owner-offair-update" className="my-8 space-y-4 rounded-xl border border-white/15 p-6">
    <h2 id="owner-offair-update" className="font-display text-2xl">Email OFF AIR partners</h2>
    <p className="text-white/70">Write your update, send a test to your owner email, then choose which OFF AIR partners should receive it.</p>
    {isEventHubStaging && <p role="status">Email delivery is disabled on staging.</p>}
    <label className="block">Subject
      <input className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3" value={subject} disabled={busy}
        onChange={event => { setSubject(event.target.value); setConfirmSend(false); }} maxLength={160} />
    </label>
    <label className="block">Message
      <textarea className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3" rows={12} value={message} disabled={busy}
        onChange={event => { setMessage(event.target.value); setConfirmSend(false); }} maxLength={10000} />
    </label>
    <Button type="button" variant="outline" disabled={!canSend} onClick={() => void send('test')}>Send test to my email</Button>
    <fieldset className="space-y-3" disabled={busy}>
      <legend className="font-medium">Recipients</legend>
      <Button type="button" variant="outline" disabled={busy} onClick={() => void refreshRecipients()}>
        {recipients === null ? 'Load recipients' : 'Refresh recipients'}
      </Button>
      {recipients && (recipients.length ? <>
        <ul className="max-h-60 space-y-2 overflow-auto">
          {recipients.map(email => <li key={email}><label className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(email)} disabled={selected.length >= 100 && !selected.includes(email)}
              onChange={event => {
                const checked = event.target.checked;
                setConfirmSend(false);
                setSelected(previous => checked ? [...previous, email] : previous.filter(value => value !== email));
              }} />
            <span className="break-all">{email}</span>
          </label></li>)}
        </ul>
        {selected.length > 0 && tested === content && <label className="flex items-start gap-2">
          <input type="checkbox" checked={confirmSend} onChange={event => setConfirmSend(event.target.checked)} />
          <span>I’ve checked the test email and want to send this message to the selected recipients.</span>
        </label>}
      </> : <p role="status">There are no confirmed accounts with current OFF AIR access.</p>)}
    </fieldset>
    <Button type="button" variant="brand" disabled={!canSend || tested !== content || !confirmSend || !selected.length}
      onClick={() => void send('send')}>Send to selected recipients{selected.length ? ` (${selected.length})` : ''}</Button>
    {error && <p role="alert" className="text-red-200">{error}</p>}
    {status && <p role="status" className="text-white/70">{status}</p>}
  </section>;
}
