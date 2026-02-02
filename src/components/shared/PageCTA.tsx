interface PageCTAProps {
  title?: string;
  accentWord?: string;
  description?: string;
  buttonLabel?: string;
  onClick?: () => void;
  className?: string;
}

export default function PageCTA({
  title = "Connect with the collective",
  accentWord = "",
  description = "Sign up to join our community and stay updated with the latest news and events.",
  buttonLabel = "Contact us",
  onClick,
  className = "",
}: PageCTAProps) {
  return (
    <section
      className={
        "w-full py-12 md:py-16 flex flex-col items-center text-center gap-4 " +
        className
      }
    >
      <h2 className="text-3xl md:text-4xl font-semibold text-white">
        {title}{" "}
        {accentWord && (
          <span className="text-[#36e0c6] italic font-normal">
            {accentWord}
          </span>
        )}
      </h2>

      <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center px-6 py-3 rounded-full bg-[#36e0c6] text-black font-medium hover:opacity-90 transition"
      >
        {buttonLabel}
      </button>
    </section>
  );
}
