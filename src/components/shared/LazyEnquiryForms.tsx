import { Component, lazy, Suspense, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ComponentType, type ReactNode, type RefObject } from "react";

type FormProps = { open: boolean; onOpenChange: (open: boolean) => void };

// This lightweight dialog deliberately does not import the deferred form UI kit.
function FormFallback({ open, onOpenChange, retry }: FormProps & { retry?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    return () => { if (element?.open) element.close(); };
  }, [open]);
  if (!open) return null;
  const button = "rounded-full border border-primary px-5 py-2 text-base font-medium text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
  return <dialog ref={dialog} aria-labelledby={title}
    onCancel={event => { event.preventDefault(); onOpenChange(false); }}
    className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-input bg-background p-6 text-foreground backdrop:bg-black/80">
    <h2 id={title} className="font-display text-xl">{retry ? "Unable to load the form" : "Loading form…"}</h2>
    {retry ? <p role="alert" className="mt-3 text-base leading-relaxed">Please try again. If the form still cannot load, reload this page.</p>
      : <p role="status" className="mt-3 text-base leading-relaxed">Please wait…</p>}
    <div className="mt-5 flex flex-wrap gap-3">
      {retry && <button type="button" className={button} onClick={retry}>Try again</button>}
      <button type="button" className={button} onClick={() => onOpenChange(false)}>Close</button>
    </div>
  </dialog>;
}

class FormLoadBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function deferredForm<P extends FormProps>(load: () => Promise<{ default: ComponentType<P> }>) {
  let request: ReturnType<typeof load> | undefined;
  const loadOnce = () => request ??= load().catch(error => { request = undefined; throw error; });
  const SharedForm = lazy(loadOnce);
  return function DeferredForm({ fallbackFocusRef, ...formProps }: P & { fallbackFocusRef?: RefObject<HTMLElement> }) {
    const props = formProps as P;
    const [hasOpened, setHasOpened] = useState(props.open);
    const [attempt, setAttempt] = useState(0);
    const previousOpen = useRef(false);
    const returnFocus = useRef<HTMLElement | null>(null);
    // Capture the trigger before the real dialog (or loading dialog) takes focus.
    if (props.open && !previousOpen.current && typeof document !== "undefined") {
      returnFocus.current = document.activeElement as HTMLElement | null;
    }
    previousOpen.current = props.open;
    if (props.open && !hasOpened) setHasOpened(true);
    const Form = useMemo(() => attempt === 0 ? SharedForm : lazy(loadOnce), [attempt]) as ComponentType<P>;
    useEffect(() => {
      if (props.open || !returnFocus.current) return;
      const frame = requestAnimationFrame(() => {
        const target = returnFocus.current?.isConnected ? returnFocus.current : fallbackFocusRef?.current;
        if (target?.isConnected) target.focus();
      });
      return () => cancelAnimationFrame(frame);
    }, [props.open, fallbackFocusRef]);
    if (!hasOpened && !props.open) return null;
    return <FormLoadBoundary key={attempt} fallback={<FormFallback {...props} retry={() => setAttempt(value => value + 1)} />}>
      <Suspense fallback={<FormFallback {...props} />}><Form {...props} /></Suspense>
    </FormLoadBoundary>;
  };
}

export const EventRegistrationForm = deferredForm<ComponentProps<typeof import("../EventRegistrationForm").default>>(
  () => import("../EventRegistrationForm"),
);
export const ContactForm = deferredForm<ComponentProps<typeof import("../ContactForm").default>>(
  () => import("../ContactForm"),
);
