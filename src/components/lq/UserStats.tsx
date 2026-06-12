import { Zap, Flame, Award, Trophy } from "lucide-react";
import type { ComponentType } from "react";

type Cell = { icon: ComponentType<{ className?: string }>; label: string; value: string; color: string };

function StatCell({ icon: Icon, label, value, color }: Cell) {
  return (
    <div className={`bg-gradient-to-br ${color} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <Icon className="w-10 h-10 opacity-60" />
      </div>
    </div>
  );
}

export default function UserStats({ xp, streak, level, badges }: { xp: number; streak: number; level: number; badges: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCell icon={Zap}    label="Total XP"       value={xp.toLocaleString()} color="from-blue-600/20 to-blue-900/20 border-blue-500/30" />
      <StatCell icon={Flame}  label="Current Streak" value={`${streak} days`}    color="from-orange-600/20 to-orange-900/20 border-orange-500/30" />
      <StatCell icon={Trophy} label="Level"          value={String(level)}       color="from-purple-600/20 to-purple-900/20 border-purple-500/30" />
      <StatCell icon={Award}  label="Badges"         value={String(badges)}      color="from-emerald-600/20 to-emerald-900/20 border-emerald-500/30" />
    </div>
  );
}