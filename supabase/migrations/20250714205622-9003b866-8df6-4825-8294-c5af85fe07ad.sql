-- Disable RLS and drop all policies

-- Sports table
ALTER TABLE public.sports DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view sports" ON public.sports;
DROP POLICY IF EXISTS "Admins can manage sports" ON public.sports;

-- Teams table  
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;

-- Championship rounds
ALTER TABLE public.championship_rounds DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view championship rounds" ON public.championship_rounds;
DROP POLICY IF EXISTS "Admins can manage championship rounds" ON public.championship_rounds;

-- Championship standings
ALTER TABLE public.championship_standings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view standings" ON public.championship_standings;
DROP POLICY IF EXISTS "Admins can manage standings" ON public.championship_standings;

-- Matches
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;

-- Players
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view players" ON public.players;
DROP POLICY IF EXISTS "Admins can manage players" ON public.players;

-- Teams championship
ALTER TABLE public.teams_championship DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view teams" ON public.teams_championship;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams_championship;

-- Scorer standings
ALTER TABLE public.scorer_standings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view scorer standings" ON public.scorer_standings;
DROP POLICY IF EXISTS "Admins can manage scorer standings" ON public.scorer_standings;

-- Excel imports
ALTER TABLE public.excel_imports DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage excel imports" ON public.excel_imports;

-- Profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "execute_get_player_attendance_ranking" ON public.profiles;