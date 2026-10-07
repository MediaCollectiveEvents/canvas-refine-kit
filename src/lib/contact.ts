import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be 5,000 characters or fewer"),
});

export type ContactData = z.infer<typeof contactSchema>;

export function contactPayload(data: ContactData, captchaToken: string) {
  const values = contactSchema.parse(data);
  return {
    formType: "contact",
    fullName: values.fullName,
    emailAddress: values.email,
    message: values.message,
    "g-recaptcha-response": captchaToken,
    token: "3Fv9XqT7bLpK2zR8YwS6dN1mHjUaV5eG",
  };
}

export async function sendContact(data: ContactData, captchaToken: string) {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbxDtoPvPsdOwB-j06Cf3WluKBY6v33Jndyvly5FMQr0Y0V4pmACrYHR0OyR1ieVSs1E/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(contactPayload(data, captchaToken)),
    },
  );
  // Apps Script's cross-origin opaque response cannot confirm delivery.
  if (response.type !== "opaque" && !response.ok) throw new Error("Unable to send enquiry");
}
