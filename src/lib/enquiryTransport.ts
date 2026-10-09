const endpoint = "https://script.google.com/macros/s/AKfycbxDtoPvPsdOwB-j06Cf3WluKBY6v33Jndyvly5FMQr0Y0V4pmACrYHR0OyR1ieVSs1E/exec";

export class EnquiryDeliveryError extends Error {
  constructor(public readonly confirmedRejection: boolean) {
    super(confirmedRejection
      ? "Your request was not accepted. Please check your details and try again."
      : "We could not confirm receipt. Please contact us before sending the same request again.");
  }
}

/** The deployed handler acknowledges only after appendEnquiry has completed. */
export async function sendEnquiry(payload: unknown): Promise<void> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok || response.type === "opaque") throw new EnquiryDeliveryError(false);
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== "object" || !("success" in receipt)) throw new EnquiryDeliveryError(false);
    if (receipt.success === false) throw new EnquiryDeliveryError(true);
    if (receipt.success !== true) throw new EnquiryDeliveryError(false);
  } catch (error) {
    if (error instanceof EnquiryDeliveryError) throw error;
    throw new EnquiryDeliveryError(false);
  }
}
