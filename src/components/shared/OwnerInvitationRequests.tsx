import { useCallback, useEffect, useRef, useState } from 'react';
import { partnershipEnquiriesEnabled } from '@/lib/enquiryTransport';
import { Button } from '@/components/ui/button';
import {
  websiteInvitationStatuses,
  type FrankfurtOwnerClient,
  type InvitationRequests,
  type PartnershipEnquiry,
  type WebsiteInvitation,
  type WebsiteInvitationStatus,
} from '@/lib/sponsor-reports/supabase-connection';

const selectClass = 'rounded border border-white/25 bg-background p-2 text-sm';
const websiteHeading = ['Event', 'Name', 'Company', 'Email', 'Requested', 'Decision'];
const legacyHeading = ['Name', 'Company', 'Email', 'Requested', 'Status', 'Action'];

export default function OwnerInvitationRequests({ client }: { client: FrankfurtOwnerClient }) {
  const [data, setData] = useState<InvitationRequests | null>(null);
  const [partnerships, setPartnerships] = useState<PartnershipEnquiry[] | null>(null);
  const [partnershipError, setPartnershipError] = useState(false);
  const [event, setEvent] = useState('');
  const [status, setStatus] = useState('');
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const requestVersion = useRef(0);
  const mutation = useRef(false);

  const refresh = useCallback(async () => {
    if (mutation.current) return;
    const version = ++requestVersion.current;
    if (partnershipEnquiriesEnabled) {
      void client.partnershipEnquiries().then(rows => {
        if (requestVersion.current !== version) return;
        setPartnerships(rows);
        setPartnershipError(false);
      }).catch(() => {
        if (requestVersion.current === version) setPartnershipError(true);
      });
    }
    try {
      const next = await client.invitations();
      if (requestVersion.current === version) {
        setData(next);
        setError('');
      }
    } catch {
      if (requestVersion.current === version) setError('Invitation requests could not be loaded. Please sign in again.');
    }
  }, [client]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    return () => {
      clearInterval(timer);
      requestVersion.current++;
    };
  }, [refresh]);

  async function save(id: string, work: () => Promise<void>) {
    if (mutation.current) return;
    mutation.current = true;
    requestVersion.current++;
    setSaving(id);
    setError('');
    setMessage('');
    try {
      await work();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Change could not be saved.');
    } finally {
      mutation.current = false;
      setSaving('');
    }
  }

  function updateWebsite(row: WebsiteInvitation, next: WebsiteInvitationStatus) {
    return save(row.sourceRef, async () => {
      setData(await client.websiteInvitationStatus(row.sourceRef, next, row.decisionVersion));
      setMessage(`${row.fullName} marked as ${next.toLowerCase()}.`);
    });
  }

  function updateOffAir(row: InvitationRequests['rows'][number]) {
    return save(row.sourceRef, async () => {
      const added = row.status !== 'Added to Eventbrite';
      setData(await client.invitationStatus(row.sourceRef, added, row.status));
      setMessage(added ? `${row.fullName} marked as added to Eventbrite.` : `Status restored for ${row.fullName}.`);
    });
  }

  function createKey() {
    return save('bridge-key', async () => {
      const result = await client.invitationKey();
      setKey(result.key);
      setData(current => current ? { ...current, configured: true } : current);
    });
  }

  const websiteRows = data?.websiteRows ?? [];
  const events = [...new Set(websiteRows.map(row => row.eventLabel))].sort((a, b) => a.localeCompare(b));
  const visibleRows = websiteRows.filter(row => (!event || row.eventLabel === event) && (!status || row.status === status));

  return (
    <section id="invitation-requests" className="my-8 scroll-mt-32 rounded-xl border border-white/15 p-6">
      <h2 className="font-display text-2xl">Invitation requests · Owner only</h2>
      <p className="my-3 text-sm text-white/65">These requests are visible only to owners. Recording a decision does not email the guest or create a registration.</p>
      {message && <p role="status" className="my-4 text-primary">{message}</p>}
      {error && <p role="alert" className="my-4 text-red-200">{error}</p>}
      <Button variant="outline" disabled={!!saving} onClick={() => void refresh()}>Refresh requests</Button>

      {partnershipEnquiriesEnabled && <div className="mt-6">
        <h3 className="font-display text-xl">Partnership enquiries</h3>
        {partnershipError && <p role="alert">Partnership enquiries could not be refreshed.</p>}
        {!partnershipError && partnerships?.length === 0 && <p className="text-sm text-white/65">No partnership enquiries received.</p>}
        {partnerships?.map(row => <details key={row.id} className="my-3 rounded border border-white/15 p-3">
          <summary>{row.fullName} · {row.company} · {new Date(row.receivedAt).toLocaleString('en-GB')}</summary>
          <p className="mt-2 break-words">{row.email}</p>
          <p>{row.eventLabel} · {row.engagement}</p>
        </details>)}
      </div>}

      {data?.websiteRows && <div className="mt-6">
        <h3 className="font-display text-xl">Website requests</h3>
        <div className="my-3 flex flex-wrap gap-3">
          <label className="grid gap-1 text-sm">Event
            <select className={selectClass} value={event} onChange={e => setEvent(e.target.value)}>
              <option value="">All events</option>
              {events.map(label => <option key={label}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Status
            <select className={selectClass} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {websiteInvitationStatuses.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        {visibleRows.length > 0 ? <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr>{websiteHeading.map(heading => <th key={heading} scope="col" className="p-3">{heading}</th>)}</tr></thead>
            <tbody>{visibleRows.map(row => <tr key={row.sourceRef} className="border-t border-white/15">
              <td className="p-3">{row.eventLabel}</td>
              <td className="p-3">{row.fullName}</td>
              <td className="p-3">{row.company}</td>
              <td className="p-3">{row.email}</td>
              <td className="p-3">{new Date(row.requestedAt).toLocaleString('en-GB')}</td>
              <td className="p-3">
                <select aria-label={`Decision for ${row.fullName} at ${row.eventLabel}`} className={selectClass}
                  value={row.status} disabled={!!saving} onChange={e => void updateWebsite(row, e.target.value as WebsiteInvitationStatus)}>
                  {websiteInvitationStatuses.map(value => <option key={value}>{value}</option>)}
                </select>
              </td>
            </tr>)}</tbody>
          </table>
        </div> : <p className="text-sm text-white/60">{websiteRows.length ? 'No requests match these filters.' : 'No website invitation requests yet.'}</p>}
      </div>}

      <div className="mt-8">
        <h3 className="font-display text-xl">OFF AIR 2026</h3>
        <p className="my-3 text-sm text-white/65">Mark a request as added only after you have added the guest in Eventbrite.</p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm">Google Sheets connection</summary>
          <p className="my-3 text-sm text-white/60">The connection imports historical requests from Google Sheets. Replacing its key requires updating the Apps Script property.</p>
          <Button variant="outline" disabled={!!saving} onClick={() => void createKey()}>{data?.configured ? 'Replace connection key' : 'Create connection key'}</Button>
          {key && <div className="mt-4 rounded border border-primary/40 p-4">
            <p className="mb-3 text-sm">Set <strong>SPONSOR_PORTAL_INVITE_KEY</strong> in Apps Script using this write-only key.</p>
            <input aria-label="Private invitation connection key" readOnly value={key} className="w-full rounded border border-white/25 bg-transparent p-3 text-sm" />
            <Button variant="outline" className="mr-3 mt-3" onClick={() => void navigator.clipboard.writeText(key).catch(() => setError('Select and copy the key manually.'))}>Copy key</Button>
            <Button variant="outline" className="mt-3" onClick={() => setKey('')}>Hide key</Button>
          </div>}
        </details>
        {data?.rows.length ? <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr>{legacyHeading.map(heading => <th key={heading} scope="col" className="p-3">{heading}</th>)}</tr></thead>
            <tbody>{data.rows.map(row => <tr key={row.sourceRef} className="border-t border-white/15">
              <td className="p-3">{row.fullName}</td>
              <td className="p-3">{row.company}</td>
              <td className="p-3">{row.email}</td>
              <td className="p-3">{new Date(row.requestedAt).toLocaleString('en-GB')}</td>
              <td className="p-3">{row.status}</td>
              <td className="p-3">
                <Button variant="outline" disabled={!!saving} onClick={() => void updateOffAir(row)}>
                  {saving === row.sourceRef ? 'Saving…' : row.status === 'Added to Eventbrite' ? 'Undo added status' : 'Mark as added to Eventbrite'}
                </Button>
              </td>
            </tr>)}</tbody>
          </table>
        </div> : data && <p className="text-sm text-white/60">No OFF AIR invitation requests yet.</p>}
      </div>
    </section>
  );
}
