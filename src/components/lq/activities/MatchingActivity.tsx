import { useState } from "react";
import { Button } from "@/components/ui/button";

type Pair = { id: string; text: string };

export default function MatchingActivity({
  activity,
  onComplete,
}: {
  activity: { question: string; pairs: Pair[]; xpReward: number };
  onComplete: (correct: boolean, attempts: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ from: string; to: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const pick = (id: string) => {
    if (submitted) return;
    if (!selected) return setSelected(id);
    if (selected === id) return setSelected(null);
    setMatches([...matches, { from: selected, to: id }]);
    setSelected(null);
  };

  const half = Math.ceil(activity.pairs.length / 2);
  return (
    <div className="space-y-4">
      <p className="text-foreground">{activity.question}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[activity.pairs.slice(0, half), activity.pairs.slice(half)].map((col, ci) => (
          <div key={ci} className="space-y-3">
            {col.map((pair) => (
              <button
                key={pair.id}
                onClick={() => pick(pair.id)}
                disabled={submitted}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selected === pair.id
                    ? "border-primary bg-primary/20"
                    : matches.some((m) => m.from === pair.id || m.to === pair.id)
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-border bg-muted hover:border-primary/60"
                }`}
              >
                <span className="font-semibold text-foreground">{pair.text}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {!submitted ? (
          <>
            <Button variant="outline" className="flex-1" onClick={() => { setMatches([]); setSelected(null); }}>Reset</Button>
            <Button className="flex-1" disabled={matches.length === 0} onClick={() => { setSubmitted(true); setTimeout(() => onComplete(true, 1), 1000); }}>
              Submit ({matches.length} matched)
            </Button>
          </>
        ) : (
          <div className="w-full p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
            <p className="text-emerald-400 font-semibold">Great matches!</p>
          </div>
        )}
      </div>
    </div>
  );
}