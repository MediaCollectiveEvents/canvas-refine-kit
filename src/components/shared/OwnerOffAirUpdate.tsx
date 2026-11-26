import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  async function prepare(openDraft = false) {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const access = await client.sponsors();
      const addresses = [...new Set(access.filter(account => account.active && account.confirmed && !account.deletedAt)
        .map(account => account.email.trim().toLowerCase())
        .filter(email => /^[^\s@,;?&#]+@[^\s@,;?&#]+\.[^\s@,;?&#]+$/.test(email)))].sort();
      setRecipients(addresses);
      if (!openDraft || !addresses.length) return;
      if (addresses.join(',') !== recipients?.join(',')) {
        setStatus('The recipient list changed. Review it before opening the draft.');
        return;
      }
      const bcc = addresses.map(encodeURIComponent).join(',');
      const url = `mailto:?bcc=${bcc}&subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.replace(/\r?\n/g, '\r\n'))}`;
      if (url.length > 2000) {
        setStatus('This draft is too long for an email app link. Copy the BCC list, subject and message into a new draft.');
        return;
      }
      window.location.href = url;
      setStatus('Review the draft in your email app before sending.');
    } catch {
      setRecipients(null);
      setError('Could not load the latest OFF AIR access list. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyRecipients() {
    try {
      await navigator.clipboard.writeText(recipients?.join(', ') ?? '');
      setStatus('Recipient addresses copied. Paste them into BCC.');
    } catch {
      setStatus('Select the addresses in the BCC list and copy them into your email app.');
    }
  }

  return <section aria-labelledby="owner-offair-update" className="my-8 space-y-4 rounded-xl border border-white/15 p-6">
    <h2 id="owner-offair-update" className="font-display text-2xl">Email OFF AIR partners</h2>
    <p className="text-white/70">Prepare an update for confirmed accounts with current OFF AIR Event Hub access. Your email app opens a draft with the addresses in BCC.</p>
    <Button type="button" variant="outline" disabled={busy} onClick={() => void prepare()}>
      {recipients === null ? 'Preview recipients' : 'Refresh recipients'}
    </Button>
    {recipients && (recipients.length ? <>
      <details className="space-y-3">
        <summary className="cursor-pointer">{recipients.length} BCC {recipients.length === 1 ? 'recipient' : 'recipients'}</summary>
        <textarea aria-label="BCC email addresses" className="w-full rounded border border-white/25 bg-transparent p-3" rows={3} readOnly value={recipients.join(', ')} />
        <Button type="button" variant="outline" onClick={() => void copyRecipients()}>Copy BCC list</Button>
      </details>
      <label className="block">Subject
        <input className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3" value={subject}
          onChange={event => setSubject(event.target.value)} maxLength={160} />
      </label>
      <label className="block">Message
        <textarea className="mt-2 block w-full rounded border border-white/25 bg-transparent p-3" rows={12} value={message}
          onChange={event => setMessage(event.target.value)} />
      </label>
      <Button type="button" variant="brand" disabled={busy || !subject.trim() || !message.trim()}
        onClick={() => void prepare(true)}>Open email draft</Button>
    </> : <p role="status">There are no confirmed accounts with current OFF AIR access.</p>)}
    {error && <p role="alert" className="text-red-200">{error}</p>}
    {status && <p role="status" className="text-white/70">{status}</p>}
  </section>;
}
