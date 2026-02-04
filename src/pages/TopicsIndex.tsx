import { Link } from "react-router-dom";
import topicsData from "../content/topics.json";

export default function TopicsIndex() {
  // topics.json has shape: { topics: [...] }
  const topics = topicsData.topics;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Browse Topics</h1>
      <p className="text-lg text-slate-600 mb-10">
        Explore key themes shaping the future of media, technology, and
        production.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/topics/${topic.id}`}
            className="block p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{topic.title}</h2>
            <p className="text-slate-600 text-sm mb-4">{topic.description}</p>
            <span className="text-primary font-medium">View Topic →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
