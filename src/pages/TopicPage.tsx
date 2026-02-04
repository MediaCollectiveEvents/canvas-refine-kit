import { useParams } from "react-router-dom";
import SectionRenderer from "../lib/sectionRenderer";

import topicsData from "../content/topics.json";
import blogData from "../content/blog.json";
import eventsData from "../content/events.json";

export default function TopicPage() {
  const { topicId } = useParams();

  // Find the matching topic entry
  const topic = topicsData.topics.find((t) => t.id === topicId);

  if (!topic) {
    return (
      <div className="p-8 text-center text-gray-500">Topic not found.</div>
    );
  }

  // -------------------------
  // Related Blog Posts
  // -------------------------
  const relatedPosts =
    blogData.posts?.filter((post) =>
      post.keywordIds?.some((k: string) => topic.keywordIds.includes(k)),
    ) || [];

  // -------------------------
  // Related Events
  // events.json now uses { events: [...] }
  // -------------------------
  const relatedEvents =
    eventsData.events?.filter((event: any) =>
      event.keywordIds?.some((k: string) => topic.keywordIds.includes(k)),
    ) || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Topic Header */}
      <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
      <p className="text-lg text-gray-700 mb-10">{topic.description}</p>

      {/* Render Dynamic Sections from topics.json */}
      <SectionRenderer sections={topic.sections} />

      {/* Related Blog Posts */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>

        {relatedPosts.length === 0 && (
          <p className="text-gray-500">No related posts found.</p>
        )}

        <div className="space-y-6">
          {relatedPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-4 border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-gray-600">{post.excerpt}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Related Events */}
      <div className="mt-16 mb-20">
        <h2 className="text-2xl font-semibold mb-6">Related Events</h2>

        {relatedEvents.length === 0 && (
          <p className="text-gray-500">No related events found.</p>
        )}

        <div className="space-y-4">
          {relatedEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 border border-gray-200 rounded bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-gray-600">{event.location}</p>
              <p className="text-gray-500 text-sm mt-1">{event.venue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
