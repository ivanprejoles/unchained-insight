import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/lq/Navigation";
import StageCard from "@/components/lq/StageCard";
import UserStats from "@/components/lq/UserStats";
import { Loader2 } from "lucide-react";
import {
  fetchStages, fetchPlayer, fetchBadges, fetchCompletedLessonIds, computeEarnedBadges,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LinguisQuest" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stages = useQuery({ queryKey: ["stages"], queryFn: fetchStages });
  const player = useQuery({ queryKey: ["player"], queryFn: () => fetchPlayer() });
  const badges = useQuery({ queryKey: ["badges"], queryFn: fetchBadges });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedLessonIds() });

  const earned = player.data && badges.data && done.data
    ? computeEarnedBadges(player.data, badges.data, done.data.length).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {player.data?.username ?? "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground">Continue your Filipino learning journey</p>
        </div>

        {player.data && (
          <UserStats
            xp={player.data.total_xp}
            streak={player.data.current_streak}
            level={player.data.level}
            badges={earned}
          />
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Learning Stages</h2>
          {stages.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.data?.map((stage) => (
                <Link key={stage.id} to="/lessons/$stageId" params={{ stageId: String(stage.stage_number) }}>
                  <StageCard stage={stage} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}