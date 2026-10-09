import { sendEnquiry, EnquiryDeliveryError } from "@/lib/enquiryTransport";
import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

import { getRegistrationOptions, type EventItem } from "@/lib/events";
import { getAttendanceOptions, getAttendanceSelection, getAttendanceStages } from "@/lib/attendance";

const legacyEventOptions = getRegistrationOptions();
const engagementOptions = [{
  id: "attend",
  label: "Attend"
}, {
  id: "sponsor",
  label: "Sponsor"
}, {
  id: "co-host",
  label: "Co-host"
}, {
  id: "notifications",
  label: "Receive new event notifications"
}];

// Form schemas for each stage
const stage1Schema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  companyName: z.string().trim().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters")
});
const stage2Schema = z.object({
  interestedEvents: z.array(z.string()).min(1, "Please select at least one event")
});
const stage3Schema = z.object({
  engagementTypes: z.array(z.string()).min(1, "Please select at least one engagement type")
});
const stage4Schema = z.object({
  gdprConsent: z.boolean().refine(val => val === true, "You must consent to continue")
});
const fullSchema = stage1Schema.merge(stage2Schema).merge(stage3Schema).merge(stage4Schema);
type FormData = z.infer<typeof fullSchema>;
interface EventRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedEvent?: string;
  attendanceOnly?: boolean;
  event?: EventItem;
}
const stageLabels = ["Details", "Events", "Engagement", "Consent"];
const ProgressIndicator = ({
  currentStage,
  totalStages,
  labels = stageLabels
}: {
  currentStage: number;
  totalStages: number;
  labels?: string[];
}) => <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({
    length: totalStages
  }, (_, i) => <div key={i} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${i + 1 < currentStage ? "bg-primary text-primary-foreground" : i + 1 === currentStage ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-muted text-muted-foreground"}`}>
            {i + 1 < currentStage ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-sm mt-1.5 transition-colors duration-300 ${i + 1 <= currentStage ? "text-foreground" : "text-muted-foreground"}`}>
            {labels[i]}
          </span>
        </div>
        {i < totalStages - 1 && <div className={`w-8 h-0.5 mx-1 mb-5 transition-all duration-300 ${i + 1 < currentStage ? "bg-primary" : "bg-muted"}`} />}
      </div>)}
  </div>;
const EventRegistrationForm = ({
  open,
  onOpenChange,
  preselectedEvent,
  attendanceOnly = false,
  event
}: EventRegistrationFormProps) => {
  const eventOptions = useMemo(() => attendanceOnly ? getAttendanceOptions() : legacyEventOptions, [attendanceOnly]);
  const selectedId = attendanceOnly ? getAttendanceSelection(event) ?? preselectedEvent : preselectedEvent;
  const stages = attendanceOnly ? getAttendanceStages(!!getAttendanceSelection(event)) : [1, 2, 3, 4];
  const labels = stages.map(stage => stage === 1 ? "Details" : stage === 2 ? "Event" : stage === 3 ? "Engagement" : "Consent");
  const [currentStage, setCurrentStage] = useState(1);
  const reducedMotion = useReducedMotion();
  const [captchaReady, setCaptchaReady] = useState(false);
  const submissionLock = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      engagementTypes: attendanceOnly ? ["attend"] : [],
      interestedEvents: eventOptions.some(option => option.id === selectedId) ? [selectedId] : [],
      gdprConsent: false
    },
    mode: "onChange"
  });
  const { setValue } = form;
  useEffect(() => {
    if (open) {
      if (attendanceOnly) setValue("engagementTypes", ["attend"], { shouldValidate: false });
      setValue("interestedEvents", eventOptions.some(option => option.id === selectedId) ? [selectedId] : [], { shouldValidate: false });
    }
  }, [open, selectedId, attendanceOnly, eventOptions, setValue]);

  const validateCurrentStage = async () => {
    let isValid = false;
    if (currentStage === 1) {
      isValid = await form.trigger(["fullName", "companyName", "email"]);
    } else if (currentStage === 2) {
      isValid = await form.trigger(["interestedEvents"]);
    } else if (currentStage === 3) {
      isValid = await form.trigger(["engagementTypes"]);
    } else if (currentStage === 4) {
      isValid = await form.trigger(["gdprConsent"]);
    }
    return isValid;
  };
  const nextStage = async () => {
    const isValid = await validateCurrentStage();
    if (isValid && currentStage < 4) {
      setCurrentStage(stages[stages.indexOf(currentStage) + 1]);
    }
  };
  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(stages[stages.indexOf(currentStage) - 1]);
    }
  };
  const handleFormSubmit = async () => {
    if (submissionLock.current || !captchaReady) return;
    submissionLock.current = true;
    let verificationTimeout: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!await form.trigger()) return;
      setIsSubmitting(true);
      const token = await Promise.race([
        captchaRef.current?.executeAsync(),
        new Promise<never>((_, reject) => {
          verificationTimeout = setTimeout(() => reject(new Error("Verification timed out")), 60000);
        }),
      ]);
      if (!token) throw new Error("Verification unavailable");
      await submitForm(form.getValues(), token);
    } catch {
      toast({ title: "Unable to verify", description: "Verification could not be completed. Please try again.", variant: "destructive" });
    } finally {
      clearTimeout(verificationTimeout);
      captchaRef.current?.reset();
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const submitForm = async (data: Omit<FormData, 'captchaToken'>, captchaToken: string) => {
    try {
      const eventLabels = data.interestedEvents
        .map(id => eventOptions.find(e => e.id === id)?.label || id)
        .join(", ");

      const engagementLabels = data.engagementTypes
        .map(id => engagementOptions.find(e => e.id === id)?.label || id)
        .join(", ");

      const webhookData = {
        fullName: data.fullName,
        companyName: data.companyName,
        emailAddress: data.email,
        event: eventLabels,
        howEngage: engagementLabels,
        consent: data.gdprConsent ? "Y" : "N",
        "g-recaptcha-response": captchaToken,
        token: "3Fv9XqT7bLpK2zR8YwS6dN1mHjUaV5eG"
      };

      await sendEnquiry(webhookData);

      setSubmitted(true);
      captchaRef.current?.reset();
    } catch (error) {
      console.error("Webhook submission error:", error);
      toast({
        title: "Unable to send",
        description: error instanceof EnquiryDeliveryError ? error.message : "We couldn’t send your enquiry. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleClose = () => {
    if (isSubmitting) return;
    setSubmitted(false);
    form.reset();
    setCurrentStage(1);
    captchaRef.current?.reset();
    onOpenChange(false);
  };
  const slideVariants = {
    enter: (direction: number) => ({
      x: reducedMotion ? 0 : direction > 0 ? 50 : -50,
      opacity: reducedMotion ? 1 : 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: reducedMotion ? 0 : direction < 0 ? 50 : -50,
      opacity: reducedMotion ? 1 : 0
    })
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader className={attendanceOnly ? "" : "sr-only"}>
          <DialogTitle>{attendanceOnly ? "Request an invitation" : "Register interest or enquire"}</DialogTitle>
          <DialogDescription>Send your details so we can review your request. Submitting does not confirm attendance.</DialogDescription>
        </DialogHeader>

        {submitted ? <div role="status" className="space-y-4 py-4">
          <h3 className="font-display text-xl">{attendanceOnly ? "Request sent" : "Enquiry sent"}</h3>
          <p>Your request has been received.</p>
          <p>{attendanceOnly ? "Requests are reviewed. If accepted, you receive a link to register. Sending a request does not confirm attendance." : "Sending an enquiry does not confirm attendance or a partnership. Your details are used to respond to your enquiry."}</p>
          <Button variant="brand" onClick={handleClose}>Close</Button>
        </div> : <>
        {attendanceOnly && <div className="mb-6"><p className="mt-2 text-base text-muted-foreground">{event && getAttendanceSelection(event) ? eventOptions.find(option => option.id === selectedId)?.displayLabel : "Choose an upcoming event or express interest in future gatherings."}</p><p className="mt-2 text-base text-muted-foreground">A request does not confirm attendance. Invitations are subject to event curation.</p></div>}
        <ProgressIndicator currentStage={stages.indexOf(currentStage) + 1} totalStages={stages.length} labels={labels} />

        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
            <fieldset disabled={isSubmitting} className="space-y-6">
            <AnimatePresence mode="wait" custom={currentStage}>
              {/* Stage 1: Personal Details */}
              {currentStage === 1 && <motion.div key="stage1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: reducedMotion ? 0 : 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">Your details</h3>
                  </div>

                  <FormField control={form.control} name="fullName" render={({
                field
              }) => <FormItem>
                        <FormLabel className="text-foreground">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} className="bg-background border-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="companyName" render={({
                field
              }) => <FormItem>
                        <FormLabel className="text-foreground">Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your company name" {...field} className="bg-background border-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                        <FormLabel className="text-foreground">Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} className="bg-background border-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </motion.div>}

              {/* Stage 2: Event Interest */}
              {currentStage === 2 && <motion.div key="stage2" custom={2} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: reducedMotion ? 0 : 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">{attendanceOnly ? "Which event interests you?" : "Which event series interest you?"}</h3>
                    <p className="text-muted-foreground text-base mt-2">{attendanceOnly ? "Select the upcoming events you would like to attend, or choose future gatherings." : "Select the event series you’re interested in hearing about for future editions. Select all that apply."}</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-base text-muted-foreground leading-relaxed text-center">
                    <p>{attendanceOnly ? "Submitting a request does not guarantee an invitation." : "This records interest in future editions, not attendance at a past event. Dates and invitations are not confirmed by submitting this form."}</p>
                  </div>

                  <FormField control={form.control} name="interestedEvents" render={() => <FormItem>
                        <div className="grid grid-cols-1 gap-3">
                          {eventOptions.map(event => <FormField key={event.id} control={form.control} name="interestedEvents" render={({
                    field
                  }) => <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-lg border border-input hover:border-primary transition-colors cursor-pointer">
                                  <FormControl>
                                    <Checkbox checked={field.value?.includes(event.id)} onCheckedChange={checked => {
                        const selected = field.value || [];
                        const newValue = checked
                          ? attendanceOnly
                            ? event.id === "all-events" ? [event.id] : [...selected.filter(id => id !== "all-events"), event.id]
                            : [...selected, event.id]
                          : selected.filter(id => id !== event.id);
                        field.onChange(newValue);
                      }} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1 text-base text-foreground">
                                    {event.displayLabel}
                                  </FormLabel>
                                </FormItem>} />)}
                        </div>
                        <FormMessage />
                      </FormItem>} />
                </motion.div>}

              {/* Stage 3: Engagement Types */}
              {currentStage === 3 && <motion.div key="stage3" custom={3} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: reducedMotion ? 0 : 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">What are you interested in?</h3>
                    <p className="text-muted-foreground text-base mt-2">Select all that apply. These choices express your interest; they do not confirm attendance or a partnership.</p>
                  </div>

                  <FormField control={form.control} name="engagementTypes" render={() => <FormItem>
                        <div className="grid grid-cols-1 gap-3">
                          {engagementOptions.filter(option => option.id !== "notifications").map(option => <FormField key={option.id} control={form.control} name="engagementTypes" render={({
                    field
                  }) => <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-lg border border-input hover:border-primary transition-colors cursor-pointer">
                                  <FormControl>
                                    <Checkbox checked={field.value?.includes(option.id)} onCheckedChange={checked => {
                        const newValue = checked ? [...(field.value || []), option.id] : field.value?.filter(val => val !== option.id) || [];
                        field.onChange(newValue);
                      }} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1 text-foreground">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>} />)}
                        </div>
                        <FormMessage />
                      </FormItem>} />
                </motion.div>}

              {/* Stage 4: GDPR Consent & Submit */}
              {currentStage === 4 && <motion.div key="stage4" custom={4} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: reducedMotion ? 0 : 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">Privacy and consent</h3>
                  </div>


                  <div className="p-4 bg-muted/50 rounded-lg text-base text-muted-foreground leading-relaxed">
                    <p>
                      We use the details you provide to handle your enquiry and any relevant event follow-up. Contact information is not automatically shared with all partners. Any sharing remains subject to explicit consent and our Privacy Policy. You can withdraw your consent at any time by contacting us. For full details, please review our{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>
                  </div>

                  <FormField control={form.control} name="gdprConsent" render={({
                field
              }) => <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-foreground">
                            I consent to the processing of my personal data to handle this enquiry, as described above.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>} />

                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey="6LeBiU8sAAAAAOmWadJe4sFM-0UaOBkFk-19GyIc"
                    size="invisible"
                    asyncScriptOnLoad={() => setCaptchaReady(true)}
                    onErrored={() => { setCaptchaReady(false); toast({ title: "Verification unavailable", description: "Please reload and try again.", variant: "destructive" }); }}
                  />
                </motion.div>}
            </AnimatePresence>

            {currentStage === 4 && !captchaReady && <p role="status" className="text-base text-muted-foreground">Loading verification. If it does not load, check your connection and reload.</p>}
            {isSubmitting && <p role="status" className="text-base text-muted-foreground">Verifying and sending your request. Please wait.</p>}
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-border">
              {currentStage > 1 ? <Button type="button" disabled={isSubmitting} variant="ghost" onClick={prevStage} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button> : <div />}

              {currentStage < 4 ? <Button key="next" type="button" onClick={nextStage} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button> : <Button key="submit" type="submit" disabled={isSubmitting || !captchaReady} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? "Sending…" : attendanceOnly ? "Request an invitation" : "Submit enquiry"}
                </Button>}
            </div>
            </fieldset>
          </form>
        </Form>
        </>}
      </DialogContent>
    </Dialog>;
};
export default EventRegistrationForm;
