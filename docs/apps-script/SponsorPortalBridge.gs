/**
 * Owner-only Sheet -> OFF AIR portal bridge. Add as a NEW file in the existing
 * spreadsheet-bound Apps Script project. Existing doPost/deployment is unchanged.
 * Script Property: SPONSOR_PORTAL_INVITE_KEY (owner-created write-only bridge key).
 * Install a time-driven trigger for syncOffAirInvitationsToPortal every 15 minutes.
 * No data is emailed, no original rows changed, no HubSpot writes are made.
 */
function syncOffAirInvitationsToPortal() {
  var properties = PropertiesService.getScriptProperties();
  var key = properties.getProperty('SPONSOR_PORTAL_INVITE_KEY');
  if (!key || !/^[a-f0-9]{64}$/.test(key)) throw new Error('Set SPONSOR_PORTAL_INVITE_KEY in Script Properties.');
  var sourceId = properties.getProperty('SPONSOR_PORTAL_SOURCE_SHEET');
  var spreadsheet = sourceId ? SpreadsheetApp.openById(sourceId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Run once from the spreadsheet-bound script editor to identify the source.');
  if (!sourceId) properties.setProperty('SPONSOR_PORTAL_SOURCE_SHEET', spreadsheet.getId());
  var sheet = spreadsheet.getSheetByName('EventRegistrations');
  if (!sheet) throw new Error('EventRegistrations sheet is unavailable.');
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues() : [];
  var requests = buildOffAirPortalRequests_(rows, spreadsheet.getId());
  var added = 0;
  // Include an empty batch when there are no matches: verifies connection without fabricated records.
  var chunks = Math.max(1, Math.ceil(requests.length / 100));
  for (var index = 0; index < chunks; index++) {
    var response = UrlFetchApp.fetch('https://qtmbioguefmtwtngbava.supabase.co/rest/v1/rpc/portal_record_invitations', {
      method: 'post', contentType: 'application/json',
      headers: { apikey: 'sb_publishable_yTuMYDTaCUuwamUptdI4xA_-ZBQRtVz' },
      payload: JSON.stringify({ p_key: key, p_requests: requests.slice(index * 100, (index + 1) * 100) }),
      muteHttpExceptions: true
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error('Private invitation sync failed. Original requests remain in the sheet; the next run will retry.');
    var receipt = JSON.parse(response.getContentText());
    if (receipt.success !== true || typeof receipt.added !== 'number') throw new Error('Invitation sync returned an invalid receipt.');
    added += receipt.added;
  }
  // Counts only: never log names, email addresses, the bridge key or provider response bodies.
  console.log('OFF AIR invitation sync: ' + requests.length + ' source requests; ' + added + ' newly stored.');
  return { sourceRequests: requests.length, added: added };
}
function buildOffAirPortalRequests_(rows, spreadsheetId) {
  return rows.reduce(function(result, row) {
    var text = function(v) { return typeof v === 'string' ? v.trim() : ''; };
    var name = text(row[0]), company = text(row[1]), email = text(row[2]);
    var event = text(row[3]), engagement = text(row[4]), consent = text(row[5]);
    if (!/\bOFF\s+AIR\b[^,]*\b2026\b/i.test(event) || engagement.split(', ').indexOf('Attend') === -1 || consent !== 'Y') return result;
    if (!name || name.length > 100 || !company || company.length > 100 || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || event.length > 1000 || engagement.length > 500) return result;
    var received = row[6] instanceof Date ? row[6] : new Date(row[6]);
    if (isNaN(received.getTime())) return result;
    var canonical = [spreadsheetId, 'EventRegistrations', received.toISOString(), name, company, email, event, engagement].join('\u0000');
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonical, Utilities.Charset.UTF_8);
    var sourceRef = digest.map(function(b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
    result.push({ sourceRef: sourceRef, fullName: name, company: company, email: email, event: event, engagement: engagement, requestedAt: received.toISOString() });
    return result;
  }, []);
}
