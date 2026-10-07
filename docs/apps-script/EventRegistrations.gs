// Called by doPost after the existing token/CAPTCHA checks.
// Keep deployed Version 4 registration columns A:G unchanged.
function appendEnquiry(sheet, data) {

  if (data.formType === "contact") {
    var name = typeof data.fullName === "string" ? data.fullName.trim() : "";
    var email = typeof data.emailAddress === "string" ? data.emailAddress.trim() : "";
    var message = typeof data.message === "string" ? data.message.trim() : "";
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || !message || message.length > 5000) {
      throw new Error("Invalid contact details");
    }
    // Store contact messages in H; do not repurpose event/engagement columns.
    // Leading apostrophes keep user-supplied text from being interpreted as formulas.
    var asText = function(value) { return /^[=+\-@]/.test(value) ? "'" + value : value; };
    sheet.appendRow([asText(name), "", asText(email), "", "", "", new Date(), asText(message)]);
  } else {
    sheet.appendRow([
      data.fullName || "",
      data.companyName || "",
      data.emailAddress || "",
      data.event || "",
      data.howEngage || "",
      data.consent || "",
      new Date()
    ]);
  }

}
