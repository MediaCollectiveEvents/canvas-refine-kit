import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { contactSchema, sendContact, type ContactData } from "@/lib/contact";

export default function ContactForm({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", message: "" },
  });

  const changeOpen = (value: boolean) => {
    if (isSubmitting) return;
    if (!value) {
      form.reset();
      captchaRef.current?.reset();
    }
    onOpenChange(value);
  };

  const submit = async (data: ContactData) => {
    setIsSubmitting(true);
    let timeout: ReturnType<typeof setTimeout>;
    try {
      const token = await Promise.race([
        captchaRef.current?.executeAsync(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("Verification timed out")), 60000);
        }),
      ]);
      if (!token) throw new Error("Verification unavailable");
      await sendContact(data, token);
      toast({ title: "Enquiry sent", description: "Your enquiry was sent, but we cannot confirm receipt here." });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Unable to send", description: "We couldn’t send your message. Please try again.", variant: "destructive" });
    } finally {
      clearTimeout(timeout!);
      captchaRef.current?.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Contact us</DialogTitle>
          <DialogDescription>Send us a general enquiry.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input autoComplete="name" maxLength={100} required disabled={isSubmitting} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" autoComplete="email" maxLength={255} required disabled={isSubmitting} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl><Textarea rows={5} maxLength={5000} required disabled={isSubmitting} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use your details to respond to your enquiry. Read our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
            <ReCAPTCHA ref={captchaRef} sitekey="6LeBiU8sAAAAAOmWadJe4sFM-0UaOBkFk-19GyIc" size="invisible" asyncScriptOnLoad={() => setCaptchaReady(true)} onErrored={() => setCaptchaReady(false)} />
            {!captchaReady && <p role="status" className="text-sm text-muted-foreground">Verification is loading. If it stays unavailable, please reload and try again.</p>}
            <Button type="submit" variant="brand" className="rounded-full" disabled={isSubmitting || !captchaReady}>
              {isSubmitting ? "Sending…" : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
