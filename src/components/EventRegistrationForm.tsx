import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// Define the events list
const upcomingEvents = [{
  id: "networking-breakfast",
  label: "Networking Breakfast - IBC Amsterdam (14th Sept 2025)"
}, {
  id: "nab-review",
  label: "NAB Review - London (24th April 2025)"
}, {
  id: "mpts-drinks",
  label: "MPTS Drinks Reception - London (12th March 2025)"
}, {
  id: "all-events",
  label: "All Events"
}];
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
}
const stageLabels = ["Details", "Events", "Engagement", "Consent"];
const ProgressIndicator = ({
  currentStage,
  totalStages
}: {
  currentStage: number;
  totalStages: number;
}) => <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({
    length: totalStages
  }, (_, i) => <div key={i} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${i + 1 < currentStage ? "bg-primary text-primary-foreground" : i + 1 === currentStage ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-muted text-muted-foreground"}`}>
            {i + 1 < currentStage ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs mt-1.5 transition-colors duration-300 ${i + 1 <= currentStage ? "text-foreground" : "text-muted-foreground"}`}>
            {stageLabels[i]}
          </span>
        </div>
        {i < totalStages - 1 && <div className={`w-8 h-0.5 mx-1 mb-5 transition-all duration-300 ${i + 1 < currentStage ? "bg-primary" : "bg-muted"}`} />}
      </div>)}
  </div>;
const EventRegistrationForm = ({
  open,
  onOpenChange,
  preselectedEvent
}: EventRegistrationFormProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      engagementTypes: [],
      interestedEvents: preselectedEvent ? [preselectedEvent] : [],
      gdprConsent: false
    },
    mode: "onChange"
  });
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
      setCurrentStage(prev => prev + 1);
    }
  };
  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => prev - 1);
    }
  };
  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      // Execute the actual form submission after captcha verification
      const formData = form.getValues();
      submitForm(formData, token);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      // Execute invisible reCAPTCHA
      captchaRef.current?.execute();
    }
  };

  const submitForm = async (data: Omit<FormData, 'captchaToken'>, captchaToken: string) => {
    setIsSubmitting(true);
    try {
      const eventLabels = data.interestedEvents
        .map(id => upcomingEvents.find(e => e.id === id)?.label || id)
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

      await fetch(
        "https://script.google.com/macros/s/AKfycbxDtoPvPsdOwB-j06Cf3WluKBY6v33Jndyvly5FMQr0Y0V4pmACrYHR0OyR1ieVSs1E/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        }
      );

      toast({
        title: "Thank You for Registering!",
        description: "Your registration has been received. We'll be in touch with event details soon."
      });

      form.reset();
      setCurrentStage(1);
      captchaRef.current?.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Webhook submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClose = () => {
    form.reset();
    setCurrentStage(1);
    captchaRef.current?.reset();
    onOpenChange(false);
  };
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-script text-3xl text-center text-foreground">
            Register Interest
          </DialogTitle>
        </DialogHeader>

        <ProgressIndicator currentStage={currentStage} totalStages={4} />

        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
            <AnimatePresence mode="wait" custom={currentStage}>
              {/* Stage 1: Personal Details */}
              {currentStage === 1 && <motion.div key="stage1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">Your Details</h3>
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
              duration: 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">WHICH EVENTS ARE YOU INTERESTED IN?</h3>
                    <p className="text-muted-foreground text-sm mt-2">Select all that apply</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground leading-relaxed text-center">
                    <p>Please note: Registering interest does not guarantee entry. All events are free and by invitation only.</p>
                  </div>

                  <FormField control={form.control} name="interestedEvents" render={() => <FormItem>
                        <div className="grid grid-cols-1 gap-3">
                          {upcomingEvents.map(event => <FormField key={event.id} control={form.control} name="interestedEvents" render={({
                    field
                  }) => <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-lg border border-input hover:border-primary transition-colors cursor-pointer">
                                  <FormControl>
                                    <Checkbox checked={field.value?.includes(event.id)} onCheckedChange={checked => {
                        const newValue = checked ? [...(field.value || []), event.id] : field.value?.filter(val => val !== event.id) || [];
                        field.onChange(newValue);
                      }} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1 text-sm text-foreground">
                                    {event.label}
                                  </FormLabel>
                                </FormItem>} />)}
                        </div>
                        <FormMessage />
                      </FormItem>} />
                </motion.div>}

              {/* Stage 3: Engagement Types */}
              {currentStage === 3 && <motion.div key="stage3" custom={3} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
              duration: 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">How would you like to engage?</h3>
                    <p className="text-muted-foreground text-sm mt-2">Select all that apply</p>
                  </div>

                  <FormField control={form.control} name="engagementTypes" render={() => <FormItem>
                        <div className="grid grid-cols-1 gap-3">
                          {engagementOptions.map(option => <FormField key={option.id} control={form.control} name="engagementTypes" render={({
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
              duration: 0.3
            }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl uppercase tracking-wide text-foreground">Consent & Verification</h3>
                  </div>

                  {/* Dev-only: Display hostname for reCAPTCHA debugging */}
                  {import.meta.env.DEV && (
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200 font-mono">
                      <strong>DEV:</strong> window.location.hostname = <code>{typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</code>
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground leading-relaxed">
                    <p>
                      We respect your privacy. By submitting this form, you agree that we may store and process your personal data to manage your event registration and notify you about relevant opportunities. Your data will not be shared with third parties without your consent. You can withdraw your consent at any time by contacting us. For full details, please review our{" "}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
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
                            I consent to the processing of my personal data for the purposes described above. *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>} />

                  <ReCAPTCHA 
                    ref={captchaRef} 
                    sitekey="6LeBiU8sAAAAAOmWadJe4sFM-0UaOBkFk-19GyIc"
                    size="invisible"
                    onChange={handleCaptchaChange} 
                  />
                </motion.div>}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-border">
              {currentStage > 1 ? <Button type="button" variant="outline" onClick={prevStage} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button> : <div />}

              {currentStage < 4 ? <Button type="button" onClick={nextStage} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button> : <Button type="submit" disabled={isSubmitting} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? "Submitting..." : "Register Interest"}
                </Button>}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default EventRegistrationForm;