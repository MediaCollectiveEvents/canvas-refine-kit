import { Fragment } from "react";

export type ContextualLink = { text: string; href: string };

// Add explicit internal links to plain content without interpreting CMS text as HTML.
export default function ContextualText({ text, links }: { text: string; links: ContextualLink[] }) {
  if (!text) return null;
  const matches = links.flatMap(link => {
    const index = text.indexOf(link.text);
    return index < 0 ? [] : [{ ...link, index }];
  }).sort((a, b) => a.index - b.index);
  let cursor = 0;
  return <>{matches.map(link => {
    if (link.index < cursor) return null;
    const before = text.slice(cursor, link.index);
    cursor = link.index + link.text.length;
    return <Fragment key={`${link.href}-${link.index}`}>{before}<a href={link.href} className="underline decoration-primary underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{link.text}</a></Fragment>;
  })}{text.slice(cursor)}</>;
}
