import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/lq/SortableList";
import {
  fetchLanguageByCode,
  fetchStagesByLanguage,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  type Stage,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/admin/$langCode/foundation")({
  head: () => ({ meta: [{ title: "Admin · Foundation roadmap" }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/admin" });
  },
  component: AdminFoundation,
});

function AdminFoundation() {
  const { langCode } = Route.useParams();
  const qc = useQueryClient();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
  const stages = useQuery({
    queryKey: ["admin-stages", langCode],
    queryFn: async () => (lang.data ? fetchStagesByLanguage(lang.data.id) : []),
    enabled: !!lang.data,
  });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", icon: "📚", color: "#3b82f6" });
  const [editId, setEditId] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-stages", langCode] });

  const addM = useMutation({
    mutationFn: () => createStage({ ...form, language_id: lang.data!.id }),
    onSuccess: () => { setCreating(false); setForm({ title: "", description: "", icon: "📚", color: "#3b82f6" }); invalidate(); },
  });
  const delM = useMutation({ mutationFn: (id: string) => deleteStage(id), onSuccess: invalidate });
  const reorderM = useMutation({ mutationFn: (ids: string[]) => reorderStages(ids) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin · {lang.data?.name} · Foundation roadmap</h1>
          <Link to="/admin/$langCode" params={{ langCode }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Features
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Stages</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder the learning path. Click a stage to edit its levels.</p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-1" /> New stage
            </Button>
          )}
        </div>

        {creating && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description (definition)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-32" />
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-20" />
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
              <Button onClick={() => addM.mutate()} disabled={!form.title.trim() || addM.isPending}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        {stages.isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (stages.data?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground">No stages yet.</p>
        ) : (
          <SortableList
            items={stages.data ?? []}
            onReorder={(ids) => reorderM.mutate(ids)}
            renderItem={(s) => (
              <StageRow
                stage={s}
                editing={editId === s.id}
                onEditToggle={() => setEditId(editId === s.id ? null : s.id)}
                onSaved={() => { setEditId(null); invalidate(); }}
                onDelete={() => { if (confirm(`Delete stage "${s.title}"? Levels will be deleted too.`)) delM.mutate(s.id); }}
                langCode={langCode}
              />
            )}
          />
        )}
      </main>
    </div>
  );
}

function StageRow({
  stage,
  editing,
  onEditToggle,
  onSaved,
  onDelete,
  langCode,
}: {
  stage: Stage;
  editing: boolean;
  onEditToggle: () => void;
  onSaved: () => void;
  onDelete: () => void;
  langCode: string;
}) {
  const [draft, setDraft] = useState(stage);
  const save = useMutation({
    mutationFn: () =>
      updateStage(stage.id, {
        title: draft.title,
        description: draft.description,
        icon: draft.icon,
        color: draft.color,
      }),
    onSuccess: onSaved,
  });

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="flex gap-2">
          <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="w-32" />
          <Input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="w-20" />
          <div className="flex-1" />
          <Button variant="ghost" onClick={onEditToggle}><X className="w-4 h-4" /></Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: stage.color + "33" }}>
        {stage.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{stage.title}</div>
        <div className="text-sm text-muted-foreground truncate">{stage.description}</div>
        <div className="text-xs text-muted-foreground mt-1">Stage {stage.stage_number} · {stage.lesson_count} levels</div>
      </div>
      <div className="flex gap-2">
        <Link to="/admin/$langCode/foundation/stage/$stageId" params={{ langCode, stageId: stage.id }}>
          <Button size="sm" variant="secondary">Levels</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onEditToggle}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-red-400" /></Button>
      </div>
    </div>
  );
}