// src/pages/MyNewPage.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const MyNewPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-display mb-4">My New Page</h1>
        <p className="text-muted-foreground text-lg">
          This is a brand new route added to the Canvas Refine Kit.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default MyNewPage;
