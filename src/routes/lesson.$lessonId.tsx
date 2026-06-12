import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import { Button } from "@/components/ui/button";
import TracingActivity from "@/components/lq/activities/TracingActivity";
import MatchingActivity from "@/components/lq/activities/MatchingActivity";
import MultipleChoiceActivity from "@/components/lq/activities/MultipleChoiceActivity";
import { fetchLesson, recordLessonCompletion } from "@/lib/linguisquest";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — LinguisQuest" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const qc = useQueryClient();
  const lesson = useQuery({ queryKey: ["lesson", lessonId], queryFn: () => fetchLesson(lessonId) });

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [xp, setXp] = useState(0);
  const [saved, setSaved] = useState(false);

  if (lesson.isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!lesson.data) {
    return (
      <div className="min-h-screen"><Navigation />
        <main className="max-w-7xl mx-auto px-4 pt-24"><p className="text-muted-foreground">Lesson not found</p></main>
      </div>
    );
  }

  const L = lesson.data;
  const complete = done.length === L.activities.length;
  const cur = L.activities[idx];

  const onActivityComplete = async (correct: boolean) => {
    if (!correct) return;
    const nextDone = [...done, idx];
    setDone(nextDone);
    const earned = (cur as { xpReward: number }).xpReward;
    setXp(xp + earned);
    if (nextDone.length === L.activities.length) {
      if (!saved) {
        setSaved(true);
        await recordLessonCompletion({ lessonId: L.id, xpEarned: L.xp_reward });
        qc.invalidateQueries({ queryKey: ["player"] });
        qc.invalidateQueries({ queryKey: ["done"] });
      }
    } else {
      setTimeout(() => setIdx(idx + 1), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-4">
          <ChevronLeft className="w-5 h-5" />Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-2">{L.title}</h1>
        <p className="text-muted-foreground mb-8">{L.description}</p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Activity {Math.min(idx + 1, L.activities.length)} of {L.activities.length}</span>
            <span className="text-sm font-semibold text-yellow-400">+{xp} XP</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(done.length / L.activities.length) * 100}%` }} />
          </div>
        </div>

        {L.vocabulary.length > 0 && (
          <div className="mb-8 bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Vocabulary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {L.vocabulary.map((v, i) => (
                <div key={i} className="bg-muted rounded-lg p-4">
                  <p className="font-bold text-foreground">{v.word}</p>
                  <p className="text-sm text-muted-foreground">{v.translation}</p>
                  {v.example && <p className="text-xs text-muted-foreground/80 mt-2 italic">"{v.example}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!complete ? (
          <div className="bg-card border border-border rounded-lg p-8">
            {cur.type === "tracing" && <TracingActivity activity={cur} onComplete={onActivityComplete} />}
            {cur.type === "matching" && <MatchingActivity activity={cur} onComplete={onActivityComplete} />}
            {cur.type === "multipleChoice" && <MultipleChoiceActivity activity={cur} onComplete={onActivityComplete} />}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/50 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-emerald-400 mb-4">Lesson Complete! 🎉</h2>
            <p className="text-muted-foreground mb-6">You earned <span className="font-bold text-yellow-400">{L.xp_reward} XP</span></p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">Back to Dashboard</Link>
              <Button variant="outline" onClick={() => { setIdx(0); setDone([]); setXp(0); setSaved(false); }}>Review Lesson</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}