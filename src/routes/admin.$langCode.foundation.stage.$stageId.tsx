import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/lq/SortableList";
import {
  fetchLanguageByCode,
  fetchStageById,
  fetchLessonsByStage,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  type Lesson,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/admin/$langCode/foundation/stage/$stageId")({
  head: () => ({ meta: [{ title: "Admin · Levels" }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/admin" });
  },
  component: AdminStage,
});

function AdminStage() {
  const { langCode, stageId } = Route.useParams();
  const qc = useQueryClient();
  const lang = useQuery({ queryKey: ["language", langCode], queryFn: () => fetchLanguageByCode(langCode) });
  const stage = useQuery({ queryKey: ["stage-id", stageId], queryFn: () => fetchStageById(stageId) });
  const lessons = useQuery({
    queryKey: ["admin-lessons", langCode, stage.data?.stage_number],
    queryFn: async () =>
      lang.data && stage.data ? fetchLessonsByStage(lang.data.id, stage.data.stage_number) : [],
    enabled: !!lang.data && !!stage.data,
  });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", xp_reward: 50 });
  const [editId, setEditId] = useState<string | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin-lessons", langCode, stage.data?.stage_number] });

  const addM = useMutation({
    mutationFn: () =>
      createLesson({
        language_id: lang.data!.id,
        stage_number: stage.data!.stage_number,
        title: form.title,
        description: form.description,
        xp_reward: form.xp_reward,
      }),
    onSuccess: () => { setCreating(false); setForm({ title: "", description: "", xp_reward: 50 }); invalidate(); },
  });
  const delM = useMutation({ mutationFn: (id: string) => deleteLesson(id), onSuccess: invalidate });
  const reorderM = useMutation({ mutationFn: (ids: string[]) => reorderLessons(ids) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin · {stage.data?.title ?? "Stage"} · Levels</h1>
          <Link to="/admin/$langCode/foundation" params={{ langCode }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Roadmap
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Levels (stepping stones)</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder. Use “Activities” to author matching, tracing or multiple-choice.</p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-1" /> New level
            </Button>
          )}
        </div>

        {creating && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">XP reward:</span>
              <Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} className="w-24" />
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
              <Button onClick={() => addM.mutate()} disabled={!form.title.trim() || addM.isPending}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        {lessons.isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (lessons.data?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground">No levels yet.</p>
        ) : (
          <SortableList
            items={lessons.data ?? []}
            onReorder={(ids) => reorderM.mutate(ids)}
            renderItem={(l) => (
              <LessonRow
                lesson={l}
                langCode={langCode}
                editing={editId === l.id}
                onEditToggle={() => setEditId(editId === l.id ? null : l.id)}
                onSaved={() => { setEditId(null); invalidate(); }}
                onDelete={() => { if (confirm(`Delete level "${l.title}"?`)) delM.mutate(l.id); }}
              />
            )}
          />
        )}
      </main>
    </div>
  );
}

function LessonRow({
  lesson,
  langCode,
  editing,
  onEditToggle,
  onSaved,
  onDelete,
}: {
  lesson: Lesson;
  langCode: string;
  editing: boolean;
  onEditToggle: () => void;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(lesson);
  const save = useMutation({
    mutationFn: () =>
      updateLesson(lesson.id, {
        title: draft.title,
        description: draft.description,
        xp_reward: draft.xp_reward,
      }),
    onSuccess: onSaved,
  });

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">XP:</span>
          <Input type="number" value={draft.xp_reward} onChange={(e) => setDraft({ ...draft, xp_reward: parseInt(e.target.value) || 0 })} className="w-24" />
          <div className="flex-1" />
          <Button variant="ghost" onClick={onEditToggle}><X className="w-4 h-4" /></Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
        {lesson.lesson_number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{lesson.title}</div>
        <div className="text-sm text-muted-foreground truncate">{lesson.description}</div>
        <div className="text-xs text-muted-foreground mt-1">{lesson.activities.length} activities · {lesson.xp_reward} XP</div>
      </div>
      <div className="flex gap-2">
        <Link to="/admin/$langCode/foundation/lesson/$lessonId" params={{ langCode, lessonId: lesson.id }}>
          <Button size="sm" variant="secondary"><Wrench className="w-4 h-4 mr-1" /> Activities</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onEditToggle}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-red-400" /></Button>
      </div>
    </div>
  );
}