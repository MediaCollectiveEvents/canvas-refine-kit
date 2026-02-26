import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Content Manager</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Your website now uses <strong>JSON files</strong> and
              <strong> Decap CMS</strong> as the single source of truth for all
              editable content, including the Homepage, About page, Events, FAQ,
              Navigation, Footer, Partners, Sponsors, and Settings.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              The original Canvas Refine Kit included a demo visual editor that
              stored content inside an in-memory <code>contentStore</code>.
              Because your project now uses real JSON files, Git commits, and
              the Decap CMS dashboard, that editor has been retired.
            </p>

            <div>
              {/* Keep this page OFF the /admin route to avoid path conflicts.
                 The Decap app lives at /admin/ (note trailing slash). */}
              <Button asChild size="lg" className="mt-4">
                <a href="/admin/" target="_self" rel="noopener">
                  Open Decap CMS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground border-t pt-6">
              If you ever want this page to evolve into a custom editor that
              writes directly to your JSON files, we can build that. For now,
              Decap CMS at <code>/admin/</code> is your official, Git-backed
              content system.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
