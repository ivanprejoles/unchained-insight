import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import LessonCard from "@/components/lq/LessonCard";
import { fetchLessonsForStage, fetchStage, fetchCompletedLessonIds } from "@/lib/linguisquest";

export const Route = createFileRoute("/lessons/$stageId")({
  head: () => ({ meta: [{ title: "Lessons — LinguisQuest" }] }),
  component: LessonsForStage,
});

function LessonsForStage() {
  const { stageId } = Route.useParams();
  const n = parseInt(stageId, 10);
  const stage = useQuery({ queryKey: ["stage", n], queryFn: () => fetchStage(n) });
  const lessons = useQuery({ queryKey: ["lessons", n], queryFn: () => fetchLessonsForStage(n) });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedLessonIds() });
  const doneSet = new Set(done.data ?? []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8">
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        {stage.data && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">{stage.data.title}</h1>
            <p className="text-muted-foreground">{stage.data.description}</p>
          </div>
        )}
        {lessons.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : lessons.data && lessons.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.data.map((l) => (
              <Link key={l.id} to="/lesson/$lessonId" params={{ lessonId: l.id }}>
                <LessonCard lesson={l} done={doneSet.has(l.id)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No lessons in this stage yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}