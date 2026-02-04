export default function RelatedContentSection({ section }) {
  return (
    <div className="my-12">
      <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
      <p className="text-gray-600">
        This section will soon show dynamic content.
      </p>
    </div>
  );
}
