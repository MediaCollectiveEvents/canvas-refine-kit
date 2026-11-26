/** Render only LinkedIn profile URLs as links; never turn arbitrary spreadsheet text into a URL. */
export default function LinkedInProfileLink({ value,compact=false }: { value: string;compact?:boolean }) {
  const text = value.trim();
  const candidate = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  let href: string | undefined;
  try {
    const url = new URL(candidate);
    if (['https:', 'http:'].includes(url.protocol) && /^(?:(?:www|[a-z]{2})\.)?linkedin\.com$/i.test(url.hostname) && /^\/in\/[^/\s]+\/?$/.test(url.pathname) && !url.username && !url.password && !url.port) {
      url.protocol = 'https:';
      href = url.href;
    }
  } catch { /* Invalid values remain plain text for review. */ }
  if (!href) return <>{compact?'—':text || 'Not supplied'}</>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label={`${text} (opens in a new tab)`}>{compact?<span className="font-bold text-lg" aria-hidden="true">in</span>:text}</a>;
}
