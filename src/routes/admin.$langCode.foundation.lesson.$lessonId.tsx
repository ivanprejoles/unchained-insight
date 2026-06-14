import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Loader2, Save, Volume2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchLanguageByCode,
  fetchLesson,
  updateLesson,
  type Activity,
} from "@/lib/linguisquest";

export const Route = createFileRoute("/admin/$langCode/foundation/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Admin · Activities" }] }),
  beforeLoad: async ({ params }) => {
    const l = await fetchLanguageByCode(params.langCode);
    if (!l) throw redirect({ to: "/admin" });
  },
  component: AdminLessonEditor,
});

const newId = () => Math.random().toString(36).slice(2, 10);

function emptyActivity(type: Activity["type"]): Activity {
  if (type === "tracing")
    return { type: "tracing", question: "Trace the letter or word", content: "A", font: "Arial", audioUrl: "", xpReward: 10 };
  if (type === "matching")
    return {
      type: "matching",
      question: "Match the pairs",
      pairs: [
        { id: newId(), text: "", kind: "text", definition: "", pairKey: "p1" },
        { id: newId(), text: "", kind: "text", definition: "", pairKey: "p1" },
      ],
      xpReward: 15,
    };
  return {
    type: "multipleChoice",
    question: "",
    image: "",
    subject: { kind: "text", value: "", definition: "" },
    options: [
      { id: newId(), text: "", isCorrect: true },
      { id: newId(), text: "", isCorrect: false },
    ],
    definition: "",
    xpReward: 10,
  };
}

function AdminLessonEditor() {
  const { langCode, lessonId } = Route.useParams();
  const qc = useQueryClient();
  const lesson = useQuery({ queryKey: ["lesson-edit", lessonId], queryFn: () => fetchLesson(lessonId) });
  const [acts, setActs] = useState<Activity[]>([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson.data) { setActs(lesson.data.activities ?? []); setDirty(false); }
  }, [lesson.data]);

  const save = useMutation({
    mutationFn: async () => {
      const err = validate(acts);
      if (err) { setError(err); throw new Error(err); }
      setError(null);
      await updateLesson(lessonId, { activities: normalize(acts) });
    },
    onSuccess: () => { setDirty(false); qc.invalidateQueries({ queryKey: ["lesson-edit", lessonId] }); },
  });

  const update = (i: number, patch: Partial<Activity>) => {
    setActs(acts.map((a, idx) => (idx === i ? ({ ...a, ...patch } as Activity) : a)));
    setDirty(true);
  };
  const remove = (i: number) => { setActs(acts.filter((_, idx) => idx !== i)); setDirty(true); };
  const add = (type: Activity["type"]) => { setActs([...acts, emptyActivity(type)]); setDirty(true); };

  if (lesson.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold truncate">Admin · {lesson.data?.title} · Activities</h1>
          <div className="flex items-center gap-3">
            <Link to="/admin/$langCode/foundation" params={{ langCode }} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Roadmap
            </Link>
            <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>
        </div>
        {error && <div className="bg-red-500/20 border-t border-red-500/40 text-red-200 text-sm px-6 py-2">{error}</div>}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => add("matching")}><Plus className="w-4 h-4 mr-1" /> Matching</Button>
          <Button variant="secondary" onClick={() => add("tracing")}><Plus className="w-4 h-4 mr-1" /> Tracing</Button>
          <Button variant="secondary" onClick={() => add("multipleChoice")}><Plus className="w-4 h-4 mr-1" /> Multiple choice</Button>
        </div>

        {acts.length === 0 && <p className="text-muted-foreground">No activities yet. Add one above.</p>}

        {acts.map((a, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-primary font-bold">{a.type}</span>
              <Button size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
            </div>
            {a.type === "tracing" && <TracingEditor a={a} onChange={(p) => update(i, p)} />}
            {a.type === "matching" && <MatchingEditor a={a} onChange={(p) => update(i, p)} />}
            {a.type === "multipleChoice" && <MCQEditor a={a} onChange={(p) => update(i, p)} />}
          </div>
        ))}
      </main>
    </div>
  );
}

function validate(acts: Activity[]): string | null {
  return _validate(acts);
}

function normalize(acts: Activity[]): Activity[] {
  return acts.map((a) => {
    if (a.type !== "matching") return a;
    const keys = Array.from(new Set(a.pairs.map((p) => p.pairKey ?? "")));
    const asA = keys.map((k) => a.pairs.find((p) => p.pairKey === k)!);
    const asB = keys.map((k) => [...a.pairs].reverse().find((p) => p.pairKey === k)!);
    return { ...a, pairs: [...asA, ...asB] };
  });
}

function _validate(acts: Activity[]): string | null {
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const tag = `Activity #${i + 1} (${a.type})`;
    if (a.type === "matching") {
      const groups = new Map<string, string[]>();
      for (const p of a.pairs) {
        if (!p.text.trim()) return `${tag}: every option needs a value.`;
        const k = p.pairKey ?? "";
        if (!k) return `${tag}: every option needs a pair key.`;
        groups.set(k, [...(groups.get(k) ?? []), p.text.trim()]);
      }
      for (const [k, vs] of groups) {
        if (vs.length !== 2) return `${tag}: pair "${k}" must have exactly one Set A and one Set B option (got ${vs.length}).`;
      }
      const aVals: string[] = [];
      const bVals: string[] = [];
      const order = Array.from(groups.keys());
      order.forEach((k) => {
        const items = a.pairs.filter((p) => p.pairKey === k);
        aVals.push(items[0].text.trim());
        bVals.push(items[1].text.trim());
      });
      if (new Set(aVals).size !== aVals.length) return `${tag}: duplicate values in Set A.`;
      if (new Set(bVals).size !== bVals.length) return `${tag}: duplicate values in Set B.`;
    }
    if (a.type === "multipleChoice") {
      if (!a.question.trim()) return `${tag}: question required.`;
      if (a.options.length < 2) return `${tag}: need at least 2 options.`;
      const correct = a.options.filter((o) => o.isCorrect).length;
      if (correct !== 1) return `${tag}: exactly one option must be marked correct.`;
      const texts = a.options.map((o) => o.text.trim());
      if (texts.some((t) => !t)) return `${tag}: every option needs text.`;
      if (new Set(texts).size !== texts.length) return `${tag}: option text must be unique.`;
    }
    if (a.type === "tracing") {
      if (!a.content.trim()) return `${tag}: tracing content required.`;
    }
  }
  return null;
}

function TracingEditor({ a, onChange }: { a: Extract<Activity, { type: "tracing" }>; onChange: (p: Partial<Activity>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-muted-foreground">Instruction</label>
        <Input value={a.question} onChange={(e) => onChange({ question: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Character / word to trace</label>
        <Input value={a.content} onChange={(e) => onChange({ content: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Font family</label>
        <Input value={a.font ?? "Arial"} onChange={(e) => onChange({ font: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Audio URL (pronunciation)</label>
        <Input value={a.audioUrl ?? ""} onChange={(e) => onChange({ audioUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">XP reward</label>
        <Input type="number" value={a.xpReward} onChange={(e) => onChange({ xpReward: parseInt(e.target.value) || 0 })} />
      </div>
    </div>
  );
}

function MatchingEditor({ a, onChange }: { a: Extract<Activity, { type: "matching" }>; onChange: (p: Partial<Activity>) => void }) {
  // Group pairs by pairKey
  const keys = Array.from(new Set(a.pairs.map((p) => p.pairKey ?? "")));
  const rows = keys.map((k) => {
    const items = a.pairs.filter((p) => p.pairKey === k);
    return { key: k, A: items[0], B: items[1] };
  });

  const setPair = (key: string, side: "A" | "B", patch: Partial<typeof a.pairs[number]>) => {
    const idx = side === "A"
      ? a.pairs.findIndex((p) => p.pairKey === key)
      : a.pairs.map((p) => p.pairKey).lastIndexOf(key);
    const next = a.pairs.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onChange({ pairs: next });
  };

  const addRow = () => {
    const k = "p" + newId();
    onChange({
      pairs: [
        ...a.pairs,
        { id: newId(), text: "", kind: "text", definition: "", pairKey: k },
        { id: newId(), text: "", kind: "text", definition: "", pairKey: k },
      ],
    });
  };
  const removeRow = (key: string) => onChange({ pairs: a.pairs.filter((p) => p.pairKey !== key) });

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Question / instruction</label>
        <Input value={a.question} onChange={(e) => onChange({ question: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">XP reward</label>
        <Input type="number" value={a.xpReward} className="w-24" onChange={(e) => onChange({ xpReward: parseInt(e.target.value) || 0 })} />
      </div>

      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-2">
        <div className="col-span-5">Set A</div>
        <div className="col-span-5">Set B</div>
        <div className="col-span-2"></div>
      </div>

      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-12 gap-2 items-start">
          <SideEditor className="col-span-5" item={r.A} onPatch={(patch) => setPair(r.key, "A", patch)} />
          <SideEditor className="col-span-5" item={r.B} onPatch={(patch) => setPair(r.key, "B", patch)} />
          <div className="col-span-2 flex justify-end pt-2">
            <Button size="sm" variant="ghost" onClick={() => removeRow(r.key)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="secondary" onClick={addRow}>
        <Plus className="w-4 h-4 mr-1" /> Add pair
      </Button>
    </div>
  );
}

function SideEditor({
  item,
  onPatch,
  className,
}: {
  item: { id: string; text: string; kind?: "text" | "audio"; audioUrl?: string; definition?: string; pairKey?: string };
  onPatch: (p: Partial<typeof item>) => void;
  className?: string;
}) {
  return (
    <div className={`bg-muted/30 border border-border rounded-md p-2 space-y-2 ${className ?? ""}`}>
      <div className="flex gap-2">
        <Select value={item.kind ?? "text"} onValueChange={(v) => onPatch({ kind: v as "text" | "audio" })}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text"><span className="inline-flex items-center gap-1"><Type className="w-3 h-3" /> Text</span></SelectItem>
            <SelectItem value="audio"><span className="inline-flex items-center gap-1"><Volume2 className="w-3 h-3" /> Audio</span></SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Value" value={item.text} onChange={(e) => onPatch({ text: e.target.value })} className="flex-1" />
      </div>
      {item.kind === "audio" && (
        <Input placeholder="Audio URL" value={item.audioUrl ?? ""} onChange={(e) => onPatch({ audioUrl: e.target.value })} />
      )}
      <Input placeholder="Definition (optional)" value={item.definition ?? ""} onChange={(e) => onPatch({ definition: e.target.value })} />
    </div>
  );
}

function MCQEditor({ a, onChange }: { a: Extract<Activity, { type: "multipleChoice" }>; onChange: (p: Partial<Activity>) => void }) {
  const setOpt = (id: string, patch: Partial<typeof a.options[number]>) =>
    onChange({ options: a.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  const setCorrect = (id: string) =>
    onChange({ options: a.options.map((o) => ({ ...o, isCorrect: o.id === id })) });

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Question</label>
        <Input value={a.question} onChange={(e) => onChange({ question: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Subject type</label>
          <Select value={a.subject?.kind ?? "text"} onValueChange={(v) => onChange({ subject: { ...(a.subject ?? { kind: "text", value: "" }), kind: v as "text" | "audio" } })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Subject value {a.subject?.kind === "audio" ? "(audio URL)" : ""}</label>
          <Input value={a.subject?.value ?? ""} onChange={(e) => onChange({ subject: { ...(a.subject ?? { kind: "text", value: "" }), value: e.target.value } })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Subject definition</label>
          <Input value={a.subject?.definition ?? ""} onChange={(e) => onChange({ subject: { ...(a.subject ?? { kind: "text", value: "" }), definition: e.target.value } })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Image URL (optional)</label>
          <Input value={a.image ?? ""} onChange={(e) => onChange({ image: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Subject pronunciation audio (optional)</label>
          <Input value={a.subjectAudioUrl ?? ""} onChange={(e) => onChange({ subjectAudioUrl: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">XP reward</label>
          <Input type="number" value={a.xpReward} onChange={(e) => onChange({ xpReward: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Admin-only definition / notes</label>
        <Textarea value={a.definition ?? ""} onChange={(e) => onChange({ definition: e.target.value })} />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Options (exactly one correct)</label>
        <div className="space-y-2 mt-1">
          {a.options.map((o) => (
            <div key={o.id} className="flex gap-2 items-center">
              <input type="radio" checked={o.isCorrect} onChange={() => setCorrect(o.id)} className="accent-primary" />
              <Input value={o.text} onChange={(e) => setOpt(o.id, { text: e.target.value })} className="flex-1" placeholder="Option text" />
              <Button size="sm" variant="ghost" onClick={() => onChange({ options: a.options.filter((x) => x.id !== o.id) })}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => onChange({ options: [...a.options, { id: newId(), text: "", isCorrect: false }] })}>
            <Plus className="w-4 h-4 mr-1" /> Add option
          </Button>
        </div>
      </div>
    </div>
  );
}