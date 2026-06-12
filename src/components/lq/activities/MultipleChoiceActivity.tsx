import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type Option = { id: string; text: string; isCorrect: boolean };

export default function MultipleChoiceActivity({
  activity,
  onComplete,
}: {
  activity: { question: string; options: Option[]; xpReward: number };
  onComplete: (correct: boolean, attempts: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const submit = () => {
    if (!selected) return;
    const correct = activity.options.find((o) => o.id === selected)?.isCorrect ?? false;
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onComplete(correct, 1), 1200);
  };

  return (
    <div className="space-y-4">
      <p className="text-foreground text-lg font-medium">{activity.question}</p>
      <div className="space-y-3">
        {activity.options.map((option) => (
          <button
            key={option.id}
            onClick={() => !submitted && setSelected(option.id)}
            disabled={submitted}
            className={`w-full p-4 rounded-lg border-2 transition text-left ${
              selected === option.id
                ? submitted
                  ? isCorrect ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                  : "border-primary bg-primary/20"
                : submitted && option.isCorrect
                  ? "border-emerald-500 bg-emerald-500/20"
                  : "border-border bg-muted hover:border-primary/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">{option.text}</span>
              {submitted && option.isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />}
              {submitted && selected === option.id && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto" />}
            </div>
          </button>
        ))}
      </div>
      {!submitted && <Button onClick={submit} disabled={!selected} className="w-full">Check Answer</Button>}
    </div>
  );
}