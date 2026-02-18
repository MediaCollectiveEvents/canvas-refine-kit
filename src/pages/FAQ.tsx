// src/pages/FAQ.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/sections/FAQSection";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Match top spacing of other pages */}
      <main className="pt-20 sm:pt-24 lg:pt-28">
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
