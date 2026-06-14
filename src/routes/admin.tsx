import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchLanguages,
  createLanguage,
  deleteLanguage,
  updateLanguage,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Languages" }] }),
  component: AdminLanguages,
});

function AdminLanguages() {
  const qc = useQueryClient();
  const langs = useQuery({ queryKey: ["languages"], queryFn: fetchLanguages });
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("");

  const add = useMutation({
    mutationFn: () => createLanguage({ code: code.trim(), name: name.trim(), flag: flag.trim() || undefined }),
    onSuccess: () => {
      setCode(""); setName(""); setFlag("");
      qc.invalidateQueries({ queryKey: ["languages"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteLanguage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["languages"] }),
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateLanguage(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["languages"] }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin · Languages</h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to user app
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">Add a language</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card border border-border rounded-lg p-4">
            <Input placeholder="Code (e.g. tl)" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input placeholder="Name (e.g. Tagalog)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Flag emoji 🇵🇭" value={flag} onChange={(e) => setFlag(e.target.value)} />
            <Button onClick={() => add.mutate()} disabled={!code.trim() || !name.trim() || add.isPending}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Pick a language to manage</h2>
          {langs.isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (langs.data?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">No languages yet. Add one above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {langs.data?.map((l) => (
                <div key={l.id} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
                  <Link
                    to="/admin/$langCode"
                    params={{ langCode: l.code }}
                    className="flex-1 flex items-center gap-3 hover:opacity-80"
                  >
                    <span className="text-4xl">{l.flag}</span>
                    <div>
                      <div className="font-bold">{l.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{l.code}</div>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant={l.active ? "secondary" : "outline"}
                      onClick={() => toggle.mutate({ id: l.id, active: !l.active })}
                    >
                      {l.active ? "Active" : "Hidden"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${l.name}? This wipes all stages and lessons.`)) del.mutate(l.id); }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}