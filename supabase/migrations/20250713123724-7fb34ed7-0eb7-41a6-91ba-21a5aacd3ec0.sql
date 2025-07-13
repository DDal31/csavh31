
-- Créer une table pour les journées de championnat
CREATE TABLE public.championship_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INTEGER NOT NULL,
  round_date DATE,
  season_year VARCHAR(9) NOT NULL, -- Format: "2024-2025"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les équipes
CREATE TABLE public.teams_championship (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les matchs
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.championship_rounds(id) NOT NULL,
  home_team_id UUID REFERENCES public.teams_championship(id) NOT NULL,
  away_team_id UUID REFERENCES public.teams_championship(id) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour le classement général
CREATE TABLE public.championship_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams_championship(id) NOT NULL,
  season_year VARCHAR(9) NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, season_year)
);

-- Créer une table pour les joueurs
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_id UUID REFERENCES public.teams_championship(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, team_id)
);

-- Créer une table pour le classement des buteurs
CREATE TABLE public.scorer_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  season_year VARCHAR(9) NOT NULL,
  goals INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, season_year)
);

-- Créer une table pour les importations de fichiers Excel
CREATE TABLE public.excel_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  imported_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  records_imported INTEGER DEFAULT 0
);

-- Activer Row Level Security
ALTER TABLE public.championship_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams_championship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championship_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorer_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_imports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Lecture publique pour tous les utilisateurs connectés
CREATE POLICY "Users can view championship rounds" ON public.championship_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view teams" ON public.teams_championship FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view standings" ON public.championship_standings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view scorer standings" ON public.scorer_standings FOR SELECT TO authenticated USING (true);

-- Politiques RLS - Écriture pour les admins seulement
CREATE POLICY "Admins can manage championship rounds" ON public.championship_rounds FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage teams" ON public.teams_championship FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage matches" ON public.matches FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage standings" ON public.championship_standings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage players" ON public.players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage scorer standings" ON public.scorer_standings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);
CREATE POLICY "Admins can manage excel imports" ON public.excel_imports FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.site_role = 'admin')
);

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_championship_rounds_updated_at BEFORE UPDATE ON public.championship_rounds FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_teams_championship_updated_at BEFORE UPDATE ON public.teams_championship FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_championship_standings_updated_at BEFORE UPDATE ON public.championship_standings FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_scorer_standings_updated_at BEFORE UPDATE ON public.scorer_standings FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_matches_round_id ON public.matches(round_id);
CREATE INDEX idx_championship_standings_season ON public.championship_standings(season_year);
CREATE INDEX idx_scorer_standings_season ON public.scorer_standings(season_year);
CREATE INDEX idx_players_team ON public.players(team_id);
