import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Google appends its challenge iframe outside the form's portal. These two
// forms use inert background elements so the challenge can receive input
// without opening the rest of the page to clicks or keyboard focus.
const VerificationDialogLayer = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(({ children }, ref) => {
  const layer = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => layer.current!);
  React.useLayoutEffect(() => {
    const portal = layer.current;
    if (!portal) return;

    const blocked = new Set<HTMLElement>();
    const body = portal.ownerDocument.body;
    const trigger = portal.ownerDocument.activeElement;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const allowChallenge = (element: HTMLElement) =>
      (element instanceof HTMLIFrameElement ? [element] : Array.from(element.querySelectorAll("iframe"))).some(frame => {
        const source = new URL(frame.src || "about:blank", portal.ownerDocument.baseURI);
        return source.protocol === "https:" &&
          ["www.google.com", "www.recaptcha.net"].includes(source.hostname) &&
          /^\/recaptcha\/(api2|enterprise)\/bframe$/.test(source.pathname);
      });

    const updateBackground = () => {
      for (const child of body.children) {
        if (!(child instanceof HTMLElement) || child === portal || child.matches("script, style, link")) continue;
        if (allowChallenge(child)) {
          if (blocked.delete(child)) child.inert = false;
        } else if (!child.inert) {
          child.inert = true;
          blocked.add(child);
        }
      }
    };

    updateBackground();
    const observer = new MutationObserver(updateBackground);
    observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });

    return () => {
      observer.disconnect();
      for (const child of blocked) child.inert = false;
      body.style.overflow = previousOverflow;
      requestAnimationFrame(() => {
        if (trigger instanceof HTMLElement && trigger.isConnected &&
            portal.ownerDocument.activeElement === body) trigger.focus();
      });
    };
  }, []);

  return <div ref={layer}>
    <div data-verification-backdrop aria-hidden="true" className="fixed inset-0 z-50 bg-black/80" />
    {children}
  </div>;
});
VerificationDialogLayer.displayName = "VerificationDialogLayer";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { externalVerification?: boolean }
>(({ className, children, externalVerification, onInteractOutside, ...props }, ref) => {
  const content = <DialogPrimitive.Content
      onInteractOutside={event => {
        onInteractOutside?.(event);
        if (externalVerification &&
            !(event.target instanceof HTMLElement && event.target.hasAttribute("data-verification-backdrop"))) {
          event.preventDefault();
        }
      }}
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>;

  if (externalVerification) {
    return <DialogPortal><VerificationDialogLayer>{content}</VerificationDialogLayer></DialogPortal>;
  }
  return <DialogPortal>
    <DialogOverlay />
    {content}
  </DialogPortal>;
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-base text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
