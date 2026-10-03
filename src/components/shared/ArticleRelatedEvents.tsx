import { Link } from "react-router-dom";
import type { Article } from "@/lib/contentMetadata";
import { getArticleEvents } from "@/lib/articles";
import { formatEventDate, isPastEvent } from "@/lib/events";

export default function ArticleRelatedEvents({ article }: { article: Article }) {
  const events = getArticleEvents(article);
  if (!events.length) return null;
  return <section aria-label="Related Media Collective events" className="mt-10">
    <h2 className="mb-4 font-display text-2xl font-light">Related Media Collective events</h2>
    <ul className="space-y-5">{events.map(event => <li key={event.id}>
      <Link to={`/events/${event.id}`} className="font-medium underline decoration-primary underline-offset-4 hover:text-primary">{event.title}</Link>
      <p className="mt-2 text-sm text-slate-300"><time dateTime={event.date}>{formatEventDate(event.date)}</time> · {isPastEvent(event) ? "Past event" : "Upcoming event"}</p>
    </li>)}</ul>
  </section>;
}
