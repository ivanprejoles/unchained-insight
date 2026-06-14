import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import { fetchLanguages } from "@/lib/linguisquest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinguisQuest — Choose a language" },
      { name: "description", content: "Pick a language to start learning. Guest mode, no login required." },
    ],
  }),
  component: Index,
});

function Index() {
  const langs = useQuery({ queryKey: ["languages"], queryFn: fetchLanguages });
  const active = (langs.data ?? []).filter((l) => l.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <nav className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold">⚡</div>
            <span className="font-bold text-lg">LinguisQuest</span>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-semibold hover:bg-muted/40">
            <Shield className="w-4 h-4" /> Admin
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose your language
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pick a language to begin. You'll get the dashboard with Foundation, Interactive Scenarios and AI Conversation.
          </p>
        </div>

        {langs.isLoading ? (
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : active.length === 0 ? (
          <p className="text-center text-muted-foreground">No languages available yet. Visit Admin to create one.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((lang) => (
              <Link
                key={lang.id}
                to="/learn/$langCode"
                params={{ langCode: lang.code }}
                className="rounded-xl border border-border bg-card p-8 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all flex flex-col items-center text-center gap-3"
              >
                <span className="text-6xl">{lang.flag}</span>
                <span className="text-2xl font-bold text-foreground">{lang.name}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{lang.code}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
