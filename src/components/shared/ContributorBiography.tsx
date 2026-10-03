import { useState } from "react";
import type { Article, Contributor } from "@/lib/contentMetadata";
import { getArticleContributor } from "@/lib/contributors";

function ContributorImage({ contributor }: { contributor: Contributor }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!contributor.image || failed) return null;
  return <img src={contributor.image} alt={contributor.displayName}
    onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
    className={loaded ? "mb-4 h-20 w-20 rounded-full object-cover" : "hidden"} />;
}

export default function ContributorBiography({ article, contributors }: { article: Article; contributors?: Contributor[] }) {
  const contributor = getArticleContributor(article, contributors);
  if (!contributor) return null;
  return <section aria-label="About the contributor" className="mt-10 max-w-2xl">
    <ContributorImage key={contributor.image} contributor={contributor} />
    <h2 className="font-display text-2xl font-light">{contributor.displayName}</h2>
    {(contributor.role || contributor.organisation) && <p className="mt-2 text-sm text-muted-foreground">{[contributor.role, contributor.organisation].filter(Boolean).join(" · ")}</p>}
    {contributor.biography && <p className="mt-4 whitespace-pre-line text-base leading-relaxed">{contributor.biography}</p>}
  </section>;
}
