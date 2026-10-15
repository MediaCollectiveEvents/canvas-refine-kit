export type ContextualLink = { text: string; href: string; pattern?: RegExp };

export const COMMUNITY_CONTEXT_LINKS: ContextualLink[] = [
  { text: "our community", href: "/community", pattern: /\b(?:(?:our|the)\s+)?community\b/iu },
];

// Recognise destination terms, not particular questions or entire answers.
// Prefer one link per destination; preserve the matched text exactly as written.
export const FAQ_CONTEXT_LINKS: ContextualLink[] = [
  { text: "The Green Line", href: "/events/8", pattern: /\b(?:the\s+)?green[\s-]+line\b/iu },
  { text: "Privacy Policy", href: "/privacy-policy", pattern: /\bprivacy[\s-]+policy\b/iu },
  { text: "event page", href: "/events", pattern: /\b(?:(?:individual|specific|relevant)\s+)?events?[\s-]+(?:pages?|details|listing)\b/iu },
  { text: "request an invitation", href: "/events", pattern: /\b(?:request(?:ing)?|apply(?:ing)?\s+for)\s+(?:an?\s+)?invitations?\b/iu },
  { text: "partnership idea", href: "/partners", pattern: /\bpartnership\s+(?:idea|proposal|opportunit(?:y|ies))\b|\bpartnerships?\b|(?<=\bwith\s)partners\b|(?<=\balongside\s)partners\b/iu },
];

export function getContextualMatches(text: string, links: ContextualLink[]) {
  const destinations = new Set<string>();
  return links.flatMap(link => {
    if (destinations.has(link.href)) return [];
    const escaped = link.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const pattern = link.pattern ?? new RegExp(`\\b${escaped}\\b`, "iu");
    const match = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, "")).exec(text);
    if (!match) return [];
    destinations.add(link.href);
    return [{ href: link.href, text: match[0], index: match.index }];
  }).sort((a, b) => a.index - b.index || b.text.length - a.text.length);
}
