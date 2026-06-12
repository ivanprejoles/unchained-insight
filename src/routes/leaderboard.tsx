import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trophy, Flame, Loader2 } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import { fetchLeaderboard } from "@/lib/linguisquest";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — LinguisQuest" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<"xp" | "level" | "streak">("xp");
  const lb = useQuery({ queryKey: ["lb", sortBy], queryFn: () => fetchLeaderboard(sortBy) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-400" />Global Leaderboard
        </h1>
        <p className="text-muted-foreground mb-8">See how everyone is doing</p>

        <div className="flex gap-4 mb-8">
          {(["xp", "level", "streak"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)} className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}>
              By {s.toUpperCase()}
            </button>
          ))}
        </div>

        {lb.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {lb.data?.map((u, i) => {
              const rank = i + 1;
              const bg = rank === 1 ? "#FCD34D" : rank === 2 ? "#D1D5DB" : rank === 3 ? "#F97316" : "#475569";
              return (
                <div key={u.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: bg, color: rank <= 3 ? "#000" : "#fff" }}>{rank}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{u.username}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Level {u.level}</span>
                        {u.current_streak > 0 && (
                          <div className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3" /><span>{u.current_streak} day streak</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-yellow-400">{u.total_xp.toLocaleString()} XP</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}