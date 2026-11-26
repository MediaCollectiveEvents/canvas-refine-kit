import { useState } from 'react';
import { articleParagraphs, type Article, type InsightPicture } from '@/lib/contentMetadata';
import { wordCount } from '@/lib/speakers/profiles';
import ArticleContent from '@/components/shared/ArticleContent';
import SpeakerBioCard from '@/components/speakers/SpeakerBioCard';
import { Button } from '@/components/ui/button';

const time = (text: string) => Math.max(1, Math.ceil(wordCount(text) / 225));

function Figure({ picture }: { picture: InsightPicture }) {
  return <figure className="my-6">
    <img src={picture.src} alt={picture.alt} className="w-full max-h-[600px] object-contain" />
    {(picture.caption || picture.credit) && <figcaption className="mt-2 text-sm text-slate-400">{[picture.caption, picture.credit].filter(Boolean).join(' · ')}</figcaption>}
  </figure>;
}

export default function InsightArticleBody({ article }: { article: Article }) {
  const [quick, setQuick] = useState(false);
  const cover = article.images?.find(image => image.placement === 'cover');
  const paragraphs = articleParagraphs(article.body);
  const split = Math.ceil(paragraphs.length / 2);
  const inline = article.images?.filter(image => image.placement === 'inline') ?? [];
  const end = article.images?.filter(image => image.placement === 'end') ?? [];

  return <div className="space-y-6">
    {cover && <Figure picture={cover}/>}
    {article.summary && <div className="flex flex-wrap gap-3">
      <Button type="button" variant={quick ? 'brand' : 'outline'} onClick={() => setQuick(true)}>Quick Read · {time(article.summary)} min</Button>
      <Button type="button" variant={quick ? 'outline' : 'brand'} onClick={() => setQuick(false)}>Full article · {time(article.body ?? '')} min</Button>
    </div>}
    {quick && article.summary ? <ArticleContent body={article.summary}/> : <>
      <ArticleContent body={inline.length ? paragraphs.slice(0, split).join('\n\n') : article.body}/>
      {inline.map((picture, index) => <Figure key={index} picture={picture}/>)}
      {inline.length > 0 && split < paragraphs.length && <ArticleContent body={paragraphs.slice(split).join('\n\n')}/>}
      {end.map((picture, index) => <Figure key={index} picture={picture}/>)}
    </>}
    {article.profile && <SpeakerBioCard profile={article.profile}/>}
    {article.logo && <img src={article.logo} alt={`${article.profile?.company ?? 'Company'} logo`} className="max-h-24 max-w-48 object-contain"/>}
  </div>;
}
