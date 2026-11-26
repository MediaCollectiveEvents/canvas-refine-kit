import { useState } from 'react';

export function useIntroductionFlags() {
  const [flags, setFlags] = useState<Set<string>>(() => new Set());
  function toggle(key: string) {
    setFlags(previous => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }
  return { flags, toggle, clear: () => setFlags(new Set()) };
}

export function IntroductionFlag({ name, selected, onToggle }: { name: string; selected: boolean; onToggle: () => void }) {
  return <button type="button" aria-pressed={selected} aria-label={`${selected ? 'Remove introduction flag for' : 'Flag for introduction to'} ${name}`} onClick={onToggle} className={`min-h-11 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${selected ? 'border-primary bg-primary/15 text-primary' : 'border-white/25 text-white/75 hover:border-primary hover:text-primary'}`}>{selected ? '✓ Flagged for introduction' : '+ Flag for introduction'}</button>;
}

export function IntroductionFlagNotice({ count }: { count: number }) {
  return <p role="status" className="my-4 text-sm leading-relaxed text-white/60">{count} {count === 1 ? 'guest flagged' : 'guests flagged'} for an introduction. Local preview only: flags reset on reload and no request is sent to Chris or the guest. Click a flagged button to remove it.</p>;
}
