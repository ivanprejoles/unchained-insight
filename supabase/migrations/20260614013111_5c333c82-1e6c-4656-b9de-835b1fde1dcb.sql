
-- Languages table
CREATE TABLE public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  flag text NOT NULL DEFAULT '🌐',
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.languages TO anon, authenticated;
GRANT ALL ON public.languages TO service_role;

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open" ON public.languages FOR ALL USING (true) WITH CHECK (true);

-- Seed Tagalog
INSERT INTO public.languages (code, name, flag, display_order)
VALUES ('tl', 'Tagalog', '🇵🇭', 0);

-- Link stages and lessons to language
ALTER TABLE public.stages ADD COLUMN language_id uuid REFERENCES public.languages(id) ON DELETE CASCADE;
ALTER TABLE public.lessons ADD COLUMN language_id uuid REFERENCES public.languages(id) ON DELETE CASCADE;

UPDATE public.stages SET language_id = (SELECT id FROM public.languages WHERE code='tl');
UPDATE public.lessons SET language_id = (SELECT id FROM public.languages WHERE code='tl');

CREATE INDEX idx_stages_language ON public.stages(language_id, display_order);
CREATE INDEX idx_lessons_language_stage ON public.lessons(language_id, stage_number, display_order);
