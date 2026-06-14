import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import StageCard from "@/components/lq/StageCard";
import {
  fetchLanguageByCode,
  fetchStagesByLanguage,
  fetchCompletedLessonIds,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/learn/$langCode/foundation")({
  head: () => ({ meta: [{ title: "Foundation — LinguisQuest" }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/" });
  },
  component: Foundation,
});

function Foundation() {
  const { langCode } = Route.useParams();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
  const stages = useQuery({
    queryKey: ["stages", langCode],
    queryFn: async () => (lang.data ? fetchStagesByLanguage(lang.data.id) : []),
    enabled: !!lang.data,
  });
  useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedLessonIds() });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation langCode={langCode} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link
          to="/learn/$langCode"
          params={{ langCode }}
          className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Foundation Roadmap</h1>
          <p className="text-muted-foreground">Follow the stepping-stone path from beginner letters to fluent phrases.</p>
        </div>

        {stages.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (stages.data?.length ?? 0) === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No stages yet. An admin needs to add some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.data?.map((stage) => (
              <Link
                key={stage.id}
                to="/lessons/$stageId"
                params={{ stageId: String(stage.stage_number) }}
              >
                <StageCard stage={stage} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}