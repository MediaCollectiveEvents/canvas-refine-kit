/**
 * Production source for the website's Apps Script Web App.
 *
 * Configure RECAPTCHA_SECRET in Script Properties before deploying. Do not put
 * secrets in source, spreadsheet cells, browser code, or logs. This handler
 * forwards only explicit event-updates subscriptions to the configured HubSpot
 * form. Ordinary invitation/contact requests never write to HubSpot.
 */
function doPost(e) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var captchaSecret = properties.getProperty("RECAPTCHA_SECRET");
    if (!captchaSecret) return jsonResponse_({ success: false, error: "Server verification is not configured" });
    if (!e || !e.postData || typeof e.postData.contents !== "string" || e.postData.contents.length > 20000) {
      return jsonResponse_({ success: false, error: "Invalid request" });
    }

    var data = JSON.parse(e.postData.contents);
    validateEnquiry_(data);

    var captchaToken = data["g-recaptcha-response"];
    if (typeof captchaToken !== "string" || !captchaToken.trim() || captchaToken.length > 4096) {
      return jsonResponse_({ success: false, error: "Missing CAPTCHA" });
    }
    var captchaResponse = UrlFetchApp.fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "post",
      payload: { secret: captchaSecret, response: captchaToken },
      muteHttpExceptions: true
    });
    var captchaResult = JSON.parse(captchaResponse.getContentText());
    if (captchaResponse.getResponseCode() < 200 || captchaResponse.getResponseCode() >= 300 || captchaResult.success !== true) {
      return jsonResponse_({ success: false, error: "CAPTCHA verification failed" });
    }

    var allowedHosts = (properties.getProperty("RECAPTCHA_ALLOWED_HOSTNAMES") || "").split(",").map(function(host) { return host.trim().toLowerCase(); }).filter(Boolean);
    if (!allowedHosts.length || typeof captchaResult.hostname !== "string" || allowedHosts.indexOf(captchaResult.hostname.toLowerCase()) === -1) {
      return jsonResponse_({ success: false, error: "CAPTCHA hostname verification failed" });
    }

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet && spreadsheet.getSheetByName("EventRegistrations");
    if (!sheet) throw new Error("Registration sheet is unavailable");
    if (data.formType === "event-updates") return jsonResponse_(submitEventUpdates_(spreadsheet, sheet, data));
    appendEnquiry(sheet, data);
    return jsonResponse_({ success: true });
  } catch (error) {
    // Avoid returning request data, credentials, or provider response bodies.
    console.error("Enquiry processing failed");
    return jsonResponse_({ success: false, error: "Unable to process this request" });
  }
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function validateEnquiry_(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid request");
  if (data.formType !== undefined && data.formType !== "contact" && data.formType !== "event-updates") throw new Error("Invalid form type");
  var allowed = data.formType === "contact"
    ? ["formType", "fullName", "emailAddress", "message", "g-recaptcha-response", "token"]
    : ["fullName", "companyName", "emailAddress", "event", "howEngage", "consent", "g-recaptcha-response", "token"];
  if (data.formType === "event-updates") allowed = allowed.concat(["formType", "consentVersion", "requestId"]);
  if (Object.keys(data).some(function(key) { return data[key] !== undefined && allowed.indexOf(key) === -1; })) throw new Error("Unexpected field");
  var singleLineFields = ["fullName", "emailAddress", "companyName", "event", "howEngage"];
  singleLineFields.forEach(function(key) {
    if (data[key] !== undefined && (typeof data[key] !== "string" || /[\u0000-\u001f\u007f]/.test(data[key]))) throw new Error("Invalid field");
  });
  var name = typeof data.fullName === "string" ? data.fullName.trim() : "";
  var email = typeof data.emailAddress === "string" ? data.emailAddress.trim() : "";
  if (!name || data.fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || data.emailAddress.length > 255) {
    throw new Error("Invalid contact details");
  }
  if (data.formType === "contact") {
    var message = typeof data.message === "string" ? data.message.trim() : "";
    if (!message || data.message.length > 5000) throw new Error("Invalid contact message");
    return;
  }
  var company = typeof data.companyName === "string" ? data.companyName.trim() : "";
  var event = typeof data.event === "string" ? data.event.trim() : "";
  var engagement = typeof data.howEngage === "string" ? data.howEngage.trim() : "";
  if (!company || data.companyName.length > 100 || !event || data.event.length > 1000 || !engagement || data.howEngage.length > 500) {
    throw new Error("Invalid registration request");
  }
  var choices = engagement.split(", ");
  var supported = ["Attend", "Sponsor", "Co-host", "Receive new event notifications"];
  if (choices.some(function(choice, i) { return supported.indexOf(choice) === -1 || choices.indexOf(choice) !== i; })) throw new Error("Invalid engagement");
  if (data.formType === "event-updates") validateEventUpdates_(data);
  // Only the dedicated, versioned event-updates flow supplies email consent.
  // All other requests retain processing consent only.
  if (data.consent !== "Y") throw new Error("Processing consent is required");
}

/** Read-only exact-email lookup. It never creates or updates a CRM record. */
function findHubSpotContactByExactEmail(email) {
  var normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 255) {
    return { status: "held", reason: "invalid_email" };
  }

  var serviceKey = PropertiesService.getScriptProperties().getProperty("HUBSPOT_SERVICE_KEY");
  if (!serviceKey) return { status: "held", reason: "service_key_not_configured" };

  // Pin the current date-based API release; do not fall back to numeric v3.
  var response = UrlFetchApp.fetch("https://api.hubapi.com/crm/objects/2026-09/contacts/search", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + serviceKey },
    payload: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: normalizedEmail }] }],
      properties: ["email"],
      limit: 3
    }),
    muteHttpExceptions: true
  });
  var statusCode = response.getResponseCode();
  if (statusCode < 200 || statusCode >= 300) {
    return { status: "held", reason: "hubspot_lookup_failed", httpStatus: statusCode };
  }

  var result = JSON.parse(response.getContentText());
  var matches = result && Array.isArray(result.results) ? result.results : [];
  if (matches.length === 0) return { status: "held", reason: "no_exact_match" };
  if (matches.length !== 1 || !matches[0].id) return { status: "held", reason: "multiple_exact_matches" };
  return { status: "matched_existing", contactId: String(matches[0].id) };
}

// Keep deployed Version 4 registration columns A:G unchanged.
function appendEnquiry(sheet, data) {
  var asText = function(value) {
    var text = typeof value === "string" ? value : String(value || "");
    return /^[=+\-@]/.test(text) ? "'" + text : text;
  };
  if (data.formType === "contact") {
    var name = typeof data.fullName === "string" ? data.fullName.trim() : "";
    var email = typeof data.emailAddress === "string" ? data.emailAddress.trim() : "";
    var message = typeof data.message === "string" ? data.message.trim() : "";
    if (!name || data.fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || data.emailAddress.length > 255 || !message || data.message.length > 5000) {
      throw new Error("Invalid contact details");
    }
    // Store contact messages in H; do not repurpose event/engagement columns.
    // Leading apostrophes keep user-supplied text from being interpreted as formulas.
    sheet.appendRow([asText(name), "", asText(email), "", "", "", new Date(), asText(message)]);
  } else {
    sheet.appendRow([
      asText(data.fullName),
      asText(data.companyName),
      asText(data.emailAddress),
      asText(data.event),
      asText(data.howEngage),
      data.consent || "",
      new Date()
    ]);
  }

}


/** Exact copy/version shown in the website's dedicated event-updates flow. */
var EVENT_UPDATES_CONSENT_VERSION_ = "event-updates-v1";
var EVENT_UPDATES_CONSENT_TEXT_ = "I agree to receive emails about new Media Collective events and to the processing of my details for this purpose. I can withdraw consent at any time.";

function validateEventUpdates_(data) {
  if (data.formType !== "event-updates" || data.consent !== "Y" ||
      data.consentVersion !== EVENT_UPDATES_CONSENT_VERSION_ ||
      data.howEngage !== "Receive new event notifications" ||
      typeof data.requestId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId)) {
    throw new Error("Explicit event-update consent is required");
  }
}

function buildEventUpdatesSubmission_(data) {
  validateEventUpdates_(data);
  return {
    fields: [{ objectTypeId: "0-1", name: "email", value: data.emailAddress.trim().toLowerCase() }],
    legalConsentOptions: { consent: {
      consentToProcess: true,
      text: EVENT_UPDATES_CONSENT_TEXT_,
      communications: [{ value: true, subscriptionTypeId: 183441347, text: EVENT_UPDATES_CONSENT_TEXT_ }]
    } }
  };
}

/**
 * Called only after the existing server-side CAPTCHA and input validation.
 * The separate audit tab preserves registration columns A:G and contact H.
 * A pending/ambiguous request is held for review, never automatically resent.
 */
function submitEventUpdates_(spreadsheet, registrationSheet, data) {
  var body = buildEventUpdatesSubmission_(data);
  var properties = PropertiesService.getScriptProperties();
  if (properties.getProperty("HUBSPOT_EVENT_UPDATES_ENABLED") !== "true") {
    return { success: false, error: "Event updates are not configured" };
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { success: false, outcomeUnknown: true, error: "Please contact us before retrying" };
  try {
    var audit = spreadsheet.getSheetByName("EventUpdateRequests");
    if (!audit) {
      audit = spreadsheet.insertSheet("EventUpdateRequests");
      audit.appendRow(["Request ID", "Email", "Consent version", "Consent wording", "Received at", "Status", "HTTP status"]);
    }
    var rows = audit.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.requestId) {
        var sameRequest = String(rows[i][1]).replace(/^'/, "") === body.fields[0].value && rows[i][2] === data.consentVersion;
        if (sameRequest && rows[i][5] === "ACCEPTED") return { success: true };
        return { success: false, outcomeUnknown: true, error: "Request held for review; do not resend" };
      }
    }
    // Prefix text defensively before writing untrusted fields into Sheets.
    var email = body.fields[0].value;
    var safeEmail = /^[=+\-@]/.test(email) ? "'" + email : email;
    audit.appendRow([data.requestId, safeEmail, data.consentVersion, EVENT_UPDATES_CONSENT_TEXT_, new Date(), "PENDING", ""]);
    var row = audit.getLastRow();
    try {
      // Public Forms submission endpoint; no API credential is sent to browsers.
      var response = UrlFetchApp.fetch("https://api.hsforms.com/submissions/v3/integration/submit/139602049/8c503e92-d086-4931-bacb-ab3ccde5dbfa", {
        method: "post", contentType: "application/json", payload: JSON.stringify(body), muteHttpExceptions: true
      });
      var status = response.getResponseCode();
      audit.getRange(row, 7).setValue(status);
      if (status !== 200) {
        // Even a failed attempt is not automatically replayed: review it first.
        audit.getRange(row, 6).setValue("REVIEW_REQUIRED");
        return { success: false, outcomeUnknown: true, error: "Subscription needs review; do not resend" };
      }
      audit.getRange(row, 6).setValue("HUBSPOT_ACCEPTED");
      appendEnquiry(registrationSheet, data);
      audit.getRange(row, 6).setValue("ACCEPTED");
      return { success: true };
    } catch (error) {
      // Do not return provider bodies, addresses, tokens, or raw exceptions.
      return { success: false, outcomeUnknown: true, error: "Subscription needs review; do not resend" };
    }
  } finally {
    lock.releaseLock();
  }
}
