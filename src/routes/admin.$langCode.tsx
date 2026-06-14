import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, MessageSquare, Bot, Shield } from "lucide-react";
import { fetchLanguageByCode } from "@/lib/linguisquest";

export const Route = createFileRoute("/admin/$langCode")({
  head: ({ params }) => ({ meta: [{ title: `Admin · ${params.langCode}` }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/admin" });
  },
  component: AdminLanguage,
});

function AdminLanguage() {
  const { langCode } = Route.useParams();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });

  const features = [
    { id: "foundation", title: "Foundation", description: "Manage the roadmap, levels, and activities.", icon: BookOpen, enabled: true },
    { id: "scenario", title: "Interactive Scenario", description: "Author dialogues and branching scenarios.", icon: MessageSquare, enabled: false },
    { id: "ai", title: "AI Conversation", description: "Configure the AI tutor.", icon: Bot, enabled: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin · {lang.data?.name ?? langCode}</h1>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Languages
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Choose a feature to manage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => {
            const inner = (
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
                  <span className="inline-block mt-4 text-xs uppercase tracking-wider text-muted-foreground">Coming soon</span>
                )}
              </div>
            );
            return f.enabled ? (
              <Link key={f.id} to="/admin/$langCode/foundation" params={{ langCode }}>{inner}</Link>
            ) : (
              <div key={f.id}>{inner}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}