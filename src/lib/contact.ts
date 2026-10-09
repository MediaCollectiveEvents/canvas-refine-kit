import { sendEnquiry } from "./enquiryTransport";
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
  await sendEnquiry(contactPayload(data, captchaToken));
}
