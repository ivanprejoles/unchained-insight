import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import {
  fetchBadges, fetchPlayer, fetchCompletedLessonIds, computeEarnedBadges,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — LinguisQuest" }] }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const player = useQuery({ queryKey: ["player"], queryFn: () => fetchPlayer() });
  const badges = useQuery({ queryKey: ["badges"], queryFn: fetchBadges });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedLessonIds() });

  const earned = new Set(
    player.data && badges.data && done.data
      ? computeEarnedBadges(player.data, badges.data, done.data.length)
      : [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground mb-8">Unlock badges by reaching milestones</p>

        {player.data && badges.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Stat label="Badges Earned" value={`${earned.size}/${badges.data.length}`} color="text-yellow-400" />
            <Stat label="Total XP" value={player.data.total_xp.toLocaleString()} color="text-blue-400" />
            <Stat label="Level" value={String(player.data.level)} color="text-purple-400" />
            <Stat label="Best Streak" value={`${player.data.longest_streak} days`} color="text-orange-400" />
          </div>
        )}

        {badges.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.data?.map((b) => {
              const got = earned.has(b.id);
              return (
                <div key={b.id} className={`rounded-lg p-6 border-2 transition ${got ? "bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border-yellow-500/50" : "bg-card border-border opacity-60"}`}>
                  <div className="text-center">
                    <div className="text-6xl mb-4">{b.icon}</div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{b.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{b.description}</p>
                    {got ? (
                      <div className="mt-4 pt-4 border-t border-yellow-500/50">
                        <span className="text-sm font-semibold text-yellow-400">✓ Unlocked</span>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">
                          {b.requirement_type === "xp" && `Earn ${b.requirement_value} XP`}
                          {b.requirement_type === "streak" && `${b.requirement_value} day streak`}
                          {b.requirement_type === "lessons" && `Complete ${b.requirement_value} lessons`}
                          {b.requirement_type === "level" && `Reach level ${b.requirement_value}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-muted-foreground text-sm mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}