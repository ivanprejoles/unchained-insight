import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, MessageSquare, Bot } from "lucide-react";
import Navigation from "@/components/lq/Navigation";
import UserStats from "@/components/lq/UserStats";
import {
  fetchLanguageByCode,
  fetchPlayer,
  fetchBadges,
  fetchCompletedLessonIds,
  computeEarnedBadges,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/learn/$langCode")({
  head: ({ params }) => ({ meta: [{ title: `Learn ${params.langCode} — LinguisQuest` }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/" });
  },
  component: LearnHome,
});

function LearnHome() {
  const { langCode } = Route.useParams();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
  const player = useQuery({ queryKey: ["player"], queryFn: () => fetchPlayer() });
  const badges = useQuery({ queryKey: ["badges"], queryFn: fetchBadges });
  const done = useQuery({ queryKey: ["done"], queryFn: () => fetchCompletedLessonIds() });
  const earned =
    player.data && badges.data && done.data
      ? computeEarnedBadges(player.data, badges.data, done.data.length).length
      : 0;

  const features = [
    {
      id: "foundation",
      title: "Foundation",
      description: "Stage-by-stage learning roadmap with tracing, matching and multiple-choice activities.",
      icon: BookOpen,
      enabled: true,
    },
    {
      id: "scenario",
      title: "Interactive Scenario",
      description: "Practice real-world dialogues. (Coming soon.)",
      icon: MessageSquare,
      enabled: false,
    },
    {
      id: "ai",
      title: "AI Conversation",
      description: "Free-form chat with an AI tutor. (Coming soon.)",
      icon: Bot,
      enabled: false,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation langCode={langCode} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-10 flex items-center gap-4">
          <span className="text-5xl">{lang.data?.flag ?? "🌐"}</span>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Welcome, {player.data?.username ?? "Learner"}! 👋
            </h1>
            <p className="text-muted-foreground">
              Learning <span className="text-foreground font-semibold">{lang.data?.name ?? langCode}</span>
            </p>
          </div>
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
          <h2 className="text-2xl font-bold text-foreground mb-6">Choose a feature</h2>
          {lang.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f) => {
                const Card = (
                  <div
                    className={`h-full rounded-xl border bg-card p-8 transition-all ${
                      f.enabled
                        ? "border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                        : "border-border/60 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <f.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                    {!f.enabled && (
                      <span className="inline-block mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </div>
                );
                return f.enabled ? (
                  <Link key={f.id} to="/learn/$langCode/foundation" params={{ langCode }}>
                    {Card}
                  </Link>
                ) : (
                  <div key={f.id}>{Card}</div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}