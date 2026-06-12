
-- =========================================================
-- LinguisQuest demo schema — NO AUTH, fully public access.
-- =========================================================

-- Content tables
CREATE TABLE public.stages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number INT  NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  icon         TEXT NOT NULL,
  color        TEXT NOT NULL,
  lesson_count INT  NOT NULL DEFAULT 0,
  display_order INT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number INT  NOT NULL,
  lesson_number INT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  vocabulary   JSONB NOT NULL DEFAULT '[]'::jsonb,
  activities   JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward    INT  NOT NULL DEFAULT 50,
  estimated_duration INT NOT NULL DEFAULT 10,
  display_order INT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stage_number, lesson_number)
);

CREATE TABLE public.badges (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  icon         TEXT NOT NULL,
  requirement_type  TEXT NOT NULL,
  requirement_value INT  NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- Tracking tables (single guest player by default, but supports many "players")
CREATE TABLE public.players (
  id         TEXT PRIMARY KEY,
  username   TEXT NOT NULL,
  total_xp   INT  NOT NULL DEFAULT 0,
  level      INT  NOT NULL DEFAULT 1,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.player_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   TEXT NOT NULL,
  lesson_id   UUID NOT NULL,
  score       INT  NOT NULL DEFAULT 0,
  xp_earned   INT  NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, lesson_id)
);

CREATE TABLE public.activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  TEXT NOT NULL,
  action     TEXT NOT NULL,
  details    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRANTS — fully open to anon and authenticated for demo
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stages           TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons          TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges           TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players          TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_progress  TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log     TO anon, authenticated;
GRANT ALL ON public.stages, public.lessons, public.badges, public.players, public.player_progress, public.activity_log TO service_role;

-- RLS enabled with fully permissive policies (demo / no auth)
ALTER TABLE public.stages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo open"  ON public.stages          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo open"  ON public.lessons         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo open"  ON public.badges          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo open"  ON public.players         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo open"  ON public.player_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo open"  ON public.activity_log    FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- SEED DATA
-- =========================================================

INSERT INTO public.stages (stage_number, title, description, icon, color, lesson_count, display_order) VALUES
  (1,'Letters & Sounds','Learn the Filipino alphabet and basic pronunciation','🔤','#3B82F6',5,1),
  (2,'Basic Greetings','Master essential greetings and polite expressions','👋','#10B981',4,2),
  (3,'Everyday Vocabulary','Learn common words for daily interactions','💬','#F59E0B',6,3),
  (4,'Grammar Basics','Understand fundamental Filipino grammar','📖','#8B5CF6',5,4),
  (5,'Conversational Phrases','Build sentences and hold simple conversations','💭','#EC4899',5,5),
  (6,'Confidence & Communication','Master fluent conversations and cultural nuances','🌟','#14B8A6',5,6);

-- Stage 1 lessons
INSERT INTO public.lessons (stage_number, lesson_number, title, description, vocabulary, activities, xp_reward, estimated_duration, display_order) VALUES
(1,1,'Vowels (A, E, I, O, U)','Learn to pronounce Filipino vowels correctly',
 '[{"word":"A","translation":"pronounced \"ah\"","pronunciation":"/ɑ/"},
   {"word":"E","translation":"pronounced \"eh\"","pronunciation":"/ɛ/"},
   {"word":"I","translation":"pronounced \"ee\"","pronunciation":"/i/"},
   {"word":"O","translation":"pronounced \"oh\"","pronunciation":"/o/"},
   {"word":"U","translation":"pronounced \"oo\"","pronunciation":"/u/"}]'::jsonb,
 '[{"type":"tracing","question":"Trace the letter and learn its sound","content":"A","xpReward":10},
   {"type":"matching","question":"Match the letter to its sound","pairs":[{"id":"1","text":"A"},{"id":"2","text":"E"},{"id":"3","text":"ah"},{"id":"4","text":"eh"}],"xpReward":15}]'::jsonb,
 50,8,1),

(1,2,'Consonants (B, C, D)','Introduce common consonants',
 '[{"word":"B","translation":"pronounced \"beh\""},
   {"word":"C","translation":"pronounced \"keh\""},
   {"word":"D","translation":"pronounced \"deh\""}]'::jsonb,
 '[{"type":"tracing","question":"Trace and pronounce B","content":"B","xpReward":10},
   {"type":"multipleChoice","question":"Which is the correct pronunciation of D?","options":[{"id":"1","text":"deh","isCorrect":true},{"id":"2","text":"teh","isCorrect":false},{"id":"3","text":"peh","isCorrect":false}],"xpReward":15}]'::jsonb,
 50,8,2),

(1,3,'Common Words (Bahay, Puno, Araw)','Learn your first Filipino words',
 '[{"word":"Bahay","translation":"House","example":"Ang bahay ay malaki"},
   {"word":"Puno","translation":"Tree","example":"Ang puno ay berde"},
   {"word":"Araw","translation":"Day/Sun","example":"Mainit ang araw"}]'::jsonb,
 '[{"type":"matching","question":"Match Filipino words to English","pairs":[{"id":"1","text":"Bahay"},{"id":"2","text":"Puno"},{"id":"3","text":"House"},{"id":"4","text":"Tree"}],"xpReward":20},
   {"type":"multipleChoice","question":"What does Araw mean?","options":[{"id":"1","text":"Day/Sun","isCorrect":true},{"id":"2","text":"Moon","isCorrect":false},{"id":"3","text":"Star","isCorrect":false}],"xpReward":15}]'::jsonb,
 50,10,3),

(1,4,'Syllable Blending','Combine sounds to form words',
 '[{"word":"Ka","translation":"you/your"},{"word":"Tao","translation":"person"},{"word":"Bago","translation":"new"}]'::jsonb,
 '[{"type":"tracing","question":"Blend syllables: Ka + o","content":"kao","xpReward":15}]'::jsonb,
 50,10,4),

(1,5,'Letter Review & Assessment','Test your knowledge of letters and sounds',
 '[{"word":"Review","translation":"All letters A-Z"}]'::jsonb,
 '[{"type":"multipleChoice","question":"How is the letter P pronounced?","options":[{"id":"1","text":"peh","isCorrect":true},{"id":"2","text":"beh","isCorrect":false},{"id":"3","text":"teh","isCorrect":false}],"xpReward":25}]'::jsonb,
 75,12,5);

-- Stage 2 lessons
INSERT INTO public.lessons (stage_number, lesson_number, title, description, vocabulary, activities, xp_reward, estimated_duration, display_order) VALUES
(2,1,'Hello & Goodbye','Master essential greetings',
 '[{"word":"Kumusta","translation":"Hello/How are you?","example":"Kumusta ka?"},
   {"word":"Maayos","translation":"Good/Fine","example":"Maayos ako"},
   {"word":"Paalam","translation":"Goodbye","example":"Paalam na"}]'::jsonb,
 '[{"type":"matching","question":"Match the greeting to its meaning","pairs":[{"id":"1","text":"Kumusta"},{"id":"2","text":"Paalam"},{"id":"3","text":"Hello"},{"id":"4","text":"Goodbye"}],"xpReward":20}]'::jsonb,
 50,9,1),
(2,2,'Polite Expressions','Learn to be polite in Filipino',
 '[{"word":"Salamat","translation":"Thank you"},{"word":"Puwede po","translation":"May I?"},{"word":"Pasensya","translation":"Sorry"}]'::jsonb,
 '[{"type":"multipleChoice","question":"How do you say Thank you?","options":[{"id":"1","text":"Salamat","isCorrect":true},{"id":"2","text":"Maayos","isCorrect":false},{"id":"3","text":"Kumusta","isCorrect":false}],"xpReward":20}]'::jsonb,
 50,8,2),
(2,3,'Introductions','Introduce yourself in Filipino',
 '[{"word":"Ako si","translation":"I am (name)","example":"Ako si Maria"},
   {"word":"Ang pangalan ko ay","translation":"My name is"},
   {"word":"Kilala","translation":"Nice to meet you"}]'::jsonb,
 '[{"type":"matching","question":"Match phrases","pairs":[{"id":"1","text":"Ako si"},{"id":"2","text":"Kilala"},{"id":"3","text":"I am"},{"id":"4","text":"Meet you"}],"xpReward":20}]'::jsonb,
 50,9,3),
(2,4,'Greeting Practice & Assessment','Put it all together',
 '[{"word":"Complete","translation":"Full greeting exchange"}]'::jsonb,
 '[{"type":"multipleChoice","question":"Reply to: Kumusta ka?","options":[{"id":"1","text":"Maayos ako, salamat","isCorrect":true},{"id":"2","text":"Paalam","isCorrect":false},{"id":"3","text":"Puno","isCorrect":false}],"xpReward":25}]'::jsonb,
 75,10,4);

-- Badges
INSERT INTO public.badges (id, name, description, icon, requirement_type, requirement_value, display_order) VALUES
('first_steps','First Steps','Earn your first 100 XP','👣','xp',100,1),
('xp_500','Rising Star','Reach 500 XP','⭐','xp',500,2),
('xp_1000','XP Champion','Reach 1,000 XP','🏆','xp',1000,3),
('three_day_streak','On Fire','Maintain a 3-day streak','🔥','streak',3,4),
('week_warrior','Week Warrior','Maintain a 7-day streak','⚡','streak',7,5),
('month_master','Month Master','Reach a 30-day longest streak','🌙','streak',30,6),
('level_two','Level 2','Reach level 2','2️⃣','level',2,7),
('level_five','Level 5','Reach level 5','5️⃣','level',5,8),
('level_ten','Level 10','Reach level 10','🔟','level',10,9);

-- Default guest player
INSERT INTO public.players (id, username) VALUES ('guest','Guest Learner');

-- Seed a few other "players" for the leaderboard to feel alive
INSERT INTO public.players (id, username, total_xp, level, current_streak, longest_streak) VALUES
  ('demo_maria','Maria',  820, 4, 5, 12),
  ('demo_juan', 'Juan',   450, 2, 2,  6),
  ('demo_ana',  'Ana',   1280, 7, 8, 14),
  ('demo_jose', 'Jose',   210, 1, 0,  3);
