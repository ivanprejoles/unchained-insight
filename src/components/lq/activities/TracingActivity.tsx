import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TracingActivity({
  activity,
  onComplete,
}: {
  activity: { question: string; content: string; xpReward: number };
  onComplete: (correct: boolean, attempts: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const drawGuide = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "120px Arial";
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    ctx.fillText(activity.content, c.width / 2, c.height / 2 + 40);
  };

  useEffect(() => { drawGuide(); /* eslint-disable-next-line */ }, [activity.content]);

  const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div className="space-y-4">
      <p className="text-foreground">{activity.question}</p>
      <canvas
        ref={canvasRef}
        width={500}
        height={250}
        onMouseDown={(e) => { if (submitted) return; setDrawing(true); const ctx = canvasRef.current!.getContext("2d")!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }}
        onMouseMove={(e) => { if (!drawing || submitted) return; const ctx = canvasRef.current!.getContext("2d")!; const p = pos(e); ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineTo(p.x, p.y); ctx.stroke(); }}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        className={`w-full border-2 border-border rounded-lg bg-muted cursor-crosshair ${submitted ? "opacity-75" : ""}`}
      />
      <div className="flex gap-3">
        {!submitted ? (
          <>
            <Button variant="outline" className="flex-1" onClick={drawGuide}>Clear</Button>
            <Button className="flex-1" onClick={() => { setSubmitted(true); setTimeout(() => onComplete(true, 1), 800); }}>Check</Button>
          </>
        ) : (
          <div className="w-full p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
            <p className="text-emerald-400 font-semibold">Nice tracing!</p>
          </div>
        )}
      </div>
    </div>
  );
}