import { supabase } from "@/integrations/supabase/client";

export const GUEST_ID = "guest";

export type Vocab = {
  word: string;
  translation: string;
  pronunciation?: string;
  example?: string;
};

export type Activity =
  | { type: "tracing"; question: string; content: string; xpReward: number }
  | {
      type: "matching";
      question: string;
      pairs: { id: string; text: string; audio?: string }[];
      xpReward: number;
    }
  | {
      type: "multipleChoice";
      question: string;
      options: { id: string; text: string; isCorrect: boolean }[];
      xpReward: number;
    };

export type Stage = {
  id: string;
  stage_number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  lesson_count: number;
  display_order: number;
};

export type Lesson = {
  id: string;
  stage_number: number;
  lesson_number: number;
  title: string;
  description: string;
  vocabulary: Vocab[];
  activities: Activity[];
  xp_reward: number;
  estimated_duration: number;
  display_order: number;
};

export type Player = {
  id: string;
  username: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: "xp" | "streak" | "lessons" | "level";
  requirement_value: number;
};

export async function fetchStages(): Promise<Stage[]> {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Stage[];
}

export async function fetchStage(stageNumber: number): Promise<Stage | null> {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("stage_number", stageNumber)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Stage | null;
}

export async function fetchLessonsForStage(stageNumber: number): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("stage_number", stageNumber)
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as unknown as Lesson[];
}

export async function fetchLesson(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Lesson | null;
}

export async function fetchPlayer(id = GUEST_ID): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Player;
  // Create on the fly if missing
  const insert = await supabase
    .from("players")
    .insert({ id, username: id === GUEST_ID ? "Guest Learner" : id })
    .select("*")
    .single();
  if (insert.error) throw insert.error;
  return insert.data as Player;
}

export async function fetchBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Badge[];
}

export async function fetchLeaderboard(
  sortBy: "xp" | "level" | "streak" = "xp",
): Promise<Player[]> {
  const column =
    sortBy === "level"
      ? "level"
      : sortBy === "streak"
        ? "current_streak"
        : "total_xp";
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order(column, { ascending: false })
    .order("total_xp", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Player[];
}

export async function recordLessonCompletion(args: {
  playerId?: string;
  lessonId: string;
  xpEarned: number;
  score?: number;
}) {
  const playerId = args.playerId ?? GUEST_ID;
  await supabase.from("player_progress").upsert(
    {
      player_id: playerId,
      lesson_id: args.lessonId,
      xp_earned: args.xpEarned,
      score: args.score ?? 100,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "player_id,lesson_id" },
  );

  const { data: p } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (p) {
    const newXp = (p.total_xp ?? 0) + args.xpEarned;
    const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);
    await supabase
      .from("players")
      .update({
        total_xp: newXp,
        level: newLevel,
        current_streak: Math.max(1, p.current_streak ?? 0),
        longest_streak: Math.max(p.longest_streak ?? 0, p.current_streak ?? 0, 1),
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId);
  }

  await supabase.from("activity_log").insert({
    player_id: playerId,
    action: "lesson_completed",
    details: { lesson_id: args.lessonId, xp: args.xpEarned },
  });
}

export async function fetchCompletedLessonIds(
  playerId = GUEST_ID,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("player_progress")
    .select("lesson_id")
    .eq("player_id", playerId);
  if (error) throw error;
  return (data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
}

export function computeEarnedBadges(player: Player, badges: Badge[], lessonsDone: number) {
  return badges
    .filter((b) => {
      switch (b.requirement_type) {
        case "xp":
          return player.total_xp >= b.requirement_value;
        case "streak":
          return player.longest_streak >= b.requirement_value;
        case "level":
          return player.level >= b.requirement_value;
        case "lessons":
          return lessonsDone >= b.requirement_value;
      }
    })
    .map((b) => b.id);
}