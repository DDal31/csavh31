-- Créer les tables pour les championnats et résultats

-- Table pour les championnats
CREATE TABLE public.championships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table pour les journées de championnat
CREATE TABLE public.championship_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  location TEXT,
  match_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(championship_id, day_number)
);

-- Table pour les matchs
CREATE TABLE public.championship_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  championship_day_id UUID NOT NULL REFERENCES championship_days(id) ON DELETE CASCADE,
  match_number TEXT NOT NULL,
  match_time TIME,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  referees TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table pour le classement des équipes
CREATE TABLE public.championship_team_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(championship_id, team_name)
);

-- Table pour les statistiques individuelles (buteuses)
CREATE TABLE public.championship_player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  player_name TEXT NOT NULL,
  first_name TEXT,
  goals_j1 INTEGER DEFAULT 0,
  goals_j2 INTEGER DEFAULT 0,
  goals_j3 INTEGER DEFAULT 0,
  goals_j4 INTEGER DEFAULT 0,
  goals_j5 INTEGER DEFAULT 0,
  goals_j6 INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  match_1 INTEGER DEFAULT 0,
  match_2 INTEGER DEFAULT 0,
  match_3 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(championship_id, team_name, player_name)
);

-- Ajouter des triggers pour updated_at
CREATE TRIGGER update_championships_updated_at
  BEFORE UPDATE ON championships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_championship_days_updated_at
  BEFORE UPDATE ON championship_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_championship_matches_updated_at
  BEFORE UPDATE ON championship_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_championship_team_standings_updated_at
  BEFORE UPDATE ON championship_team_standings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_championship_player_stats_updated_at
  BEFORE UPDATE ON championship_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_team_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_player_stats ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS (lecture publique, écriture admin)
CREATE POLICY "Championnats visibles par tous" ON championships FOR SELECT USING (true);
CREATE POLICY "Admin peut gérer les championnats" ON championships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_role = 'admin')
);

CREATE POLICY "Journées visibles par tous" ON championship_days FOR SELECT USING (true);
CREATE POLICY "Admin peut gérer les journées" ON championship_days FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_role = 'admin')
);

CREATE POLICY "Matchs visibles par tous" ON championship_matches FOR SELECT USING (true);
CREATE POLICY "Admin peut gérer les matchs" ON championship_matches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_role = 'admin')
);

CREATE POLICY "Classements visibles par tous" ON championship_team_standings FOR SELECT USING (true);
CREATE POLICY "Admin peut gérer les classements" ON championship_team_standings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_role = 'admin')
);

CREATE POLICY "Stats joueurs visibles par tous" ON championship_player_stats FOR SELECT USING (true);
CREATE POLICY "Admin peut gérer les stats joueurs" ON championship_player_stats FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_role = 'admin')
);