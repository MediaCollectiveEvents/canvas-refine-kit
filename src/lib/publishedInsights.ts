import { useEffect, useState } from 'react';
import { isEventHubRehearsalReady, projectUrl, publishableKey } from './event-hub-backend';
import type { Article } from './contentMetadata';

export function usePublishedInsights(slug?: string) {
  const enabled = isEventHubRehearsalReady && (!slug || /^contributor-[a-f0-9-]{36}$/.test(slug));
  const [result, setResult] = useState<{ slug?: string; articles: Article[] }>();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch(projectUrl + '/rest/v1/rpc/insights_published', {
      method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
      headers: { apikey: publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug ?? null }),
    }).then(async response => {
      if (!response.ok) throw new Error('Published Insights unavailable');
      const articles: Article[] = await response.json();
      setResult({slug, articles: articles.map(article => ({
        ...article, author: article.author ?? article.profile?.name,
        organisation: article.organisation ?? article.profile?.company,
      }))});
    }).catch(() => { if (!controller.signal.aborted) setResult({slug, articles: []}); });
    return () => controller.abort();
  }, [enabled, slug]);
  return {articles: enabled && result?.slug === slug ? result?.articles ?? [] : [],
    loading: enabled && (!result || result.slug !== slug)};
}
