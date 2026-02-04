import { Link } from "react-router-dom";
import {
  Cpu,
  Cloud,
  Users,
  Bookmark,
  Layers,
  Film,
  DollarSign,
  Shield,
} from "lucide-react";

import topicsData from "../../content/topics.json";

interface TopicsPreviewSectionProps {
  title: string;
  subtitle?: string;
}

const iconMap: Record<string, JSX.Element> = {
  "ai-automation": <Cpu className="h-8 w-8 text-primary" />,
  "cloud-supply-chain": <Cloud className="h-8 w-8 text-primary" />,
  "personalisation-experience": <Users className="h-8 w-8 text-primary" />,
  "metadata-search": <Bookmark className="h-8 w-8 text-primary" />,
  "storytelling-search": <Layers className="h-8 w-8 text-primary" />,
  "production-workflows": <Film className="h-8 w-8 text-primary" />,
  "monetisation-fast": <DollarSign className="h-8 w-8 text-primary" />,
  "rights-metadata": <Shield className="h-8 w-8 text-primary" />,
};

const TopicsPreviewSection: React.FC<TopicsPreviewSectionProps> = ({
  title,
  subtitle,
}) => {
  // ✅ topics.json has shape: { topics: [...] }
  const { topics } = topicsData;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-slate-600 mb-8 text-lg">{subtitle}</p>}

        <div className="grid gap-6 md:grid-cols-3">
          {topics.slice(0, 3).map((topic) => (
            <Link
              key={topic.id}
              to={`/topics/${topic.id}`}
              className="block p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition"
            >
              {/* Icon */}
              <div className="mb-4">
                {iconMap[topic.id] ?? (
                  <Layers className="h-8 w-8 text-primary" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-4">{topic.description}</p>

              <span className="text-primary font-medium">View Topic →</span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/topics"
            className="text-primary font-semibold hover:underline"
          >
            Browse all topics →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopicsPreviewSection;
