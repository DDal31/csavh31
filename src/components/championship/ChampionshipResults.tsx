import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Trophy, Target, Users, Calendar } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Championship {
  id: string;
  name: string;
  season_year: string;
  sport_id?: string;
  team_id?: string;
  created_at: string;
}

interface ChampionshipResultsProps {
  sportId?: string;
  teamId?: string;
}

interface Match {
  id: string;
  match_number: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  referees: string | null;
  championship_day: {
    day_name: string;
    day_number: number;
    match_date: string | null;
  };
}

interface TeamStanding {
  id: string;
  team_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number | null;
}

interface PlayerStats {
  id: string;
  team_name: string;
  player_name: string;
  first_name: string;
  total_goals: number;
  goals_j1: number;
  goals_j2: number;
  goals_j3: number;
  goals_j4: number;
  goals_j5: number;
  goals_j6: number;
}

export const ChampionshipResults = ({ sportId, teamId }: ChampionshipResultsProps = {}) => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChampionship, setSelectedChampionship] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChampionships();
  }, [sportId, teamId]);

  useEffect(() => {
    if (selectedChampionship) {
      loadChampionshipData(selectedChampionship);
    }
  }, [selectedChampionship]);

  const loadChampionships = async () => {
    try {
      let query = supabase
        .from('championships')
        .select('*');

      // Filtrer par sport et équipe si fournis
      if (sportId) {
        query = query.eq('sport_id', sportId);
      }
      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChampionships(data || []);
      if (data && data.length > 0) {
        setSelectedChampionship(data[0].id);
      } else {
        // Aucun championnat trouvé, réinitialiser les données
        setSelectedChampionship('');
        setMatches([]);
        setStandings([]);
        setPlayerStats([]);
      }
    } catch (error) {
      console.error('Erreur chargement championnats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChampionshipData = async (championshipId: string) => {
    setLoading(true);
    try {
      console.log('Chargement des données pour le championnat:', championshipId);

      // Charger les matchs - corriger la requête
      const { data: matchesData, error: matchesError } = await supabase
        .from('championship_matches')
        .select(`
          *,
          championship_day:championship_days!inner(*)
        `)
        .eq('championship_day.championship_id', championshipId);

      if (matchesError) {
        console.error('Erreur matchs:', matchesError);
        throw matchesError;
      }

      console.log('Matchs chargés:', matchesData);

      // Charger le classement
      const { data: standingsData, error: standingsError } = await supabase
        .from('championship_team_standings')
        .select('*')
        .eq('championship_id', championshipId)
        .order('points', { ascending: false });

      if (standingsError) {
        console.error('Erreur classement:', standingsError);
        throw standingsError;
      }

      console.log('Classement chargé:', standingsData);

      // Charger les stats joueurs
      const { data: playerStatsData, error: playerStatsError } = await supabase
        .from('championship_player_stats')
        .select('*')
        .eq('championship_id', championshipId)
        .order('total_goals', { ascending: false });

      if (playerStatsError) {
        console.error('Erreur stats joueurs:', playerStatsError);
        throw playerStatsError;
      }

      console.log('Stats joueurs chargées:', playerStatsData);

      setMatches(matchesData || []);
      setStandings(standingsData || []);
      setPlayerStats(playerStatsData || []);
    } catch (error) {
      console.error('Erreur chargement données championnat:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatusBadge = (match: Match) => {
    if (match.home_score !== null && match.away_score !== null) {
      return <Badge variant="default">Terminé</Badge>;
    }
    return <Badge variant="secondary">À venir</Badge>;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'text-yellow-600 font-bold';
    if (position === 2) return 'text-gray-600 font-bold';
    if (position === 3) return 'text-amber-600 font-bold';
    return 'text-foreground';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (championships.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Résultats des Championnats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucun championnat disponible pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedChampData = championships.find(c => c.id === selectedChampionship);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Résultats des Championnats
        </CardTitle>
        <CardDescription>
          {selectedChampData && (
            <>
              {selectedChampData.name} - Saison {selectedChampData.season_year}
            </>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Sélecteur de championnat */}
        {championships.length > 1 && (
          <div className="mb-6">
            <select
              value={selectedChampionship}
              onChange={(e) => setSelectedChampionship(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              aria-label="Sélectionner un championnat"
            >
              {championships.map(champ => (
                <option key={champ.id} value={champ.id}>
                  {champ.name} - {champ.season_year}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs defaultValue="classement" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classement" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Classement
            </TabsTrigger>
            <TabsTrigger value="matchs" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Matchs
            </TabsTrigger>
            <TabsTrigger value="buteuses" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Buteuses
            </TabsTrigger>
          </TabsList>

          {/* Classement */}
          <TabsContent value="classement" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Pos.</th>
                    <th className="text-left p-2 font-semibold">Équipe</th>
                    <th className="text-center p-2 font-semibold">J</th>
                    <th className="text-center p-2 font-semibold">G</th>
                    <th className="text-center p-2 font-semibold">N</th>
                    <th className="text-center p-2 font-semibold">P</th>
                    <th className="text-center p-2 font-semibold">BP</th>
                    <th className="text-center p-2 font-semibold">BC</th>
                    <th className="text-center p-2 font-semibold">Diff</th>
                    <th className="text-center p-2 font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => (
                    <tr key={team.id} className="border-b hover:bg-muted/50">
                      <td className={`p-2 ${getPositionColor(index + 1)}`}>
                        {index + 1}
                      </td>
                      <td className="p-2 font-medium">{team.team_name}</td>
                      <td className="text-center p-2">{team.matches_played}</td>
                      <td className="text-center p-2">{team.wins}</td>
                      <td className="text-center p-2">{team.draws}</td>
                      <td className="text-center p-2">{team.losses}</td>
                      <td className="text-center p-2">{team.goals_for}</td>
                      <td className="text-center p-2">{team.goals_against}</td>
                      <td className="text-center p-2">
                        <span className={team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="text-center p-2 font-bold">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Matchs */}
          <TabsContent value="matchs" className="space-y-4">
            {Object.entries(
              matches.reduce((acc, match) => {
                const dayName = match.championship_day.day_name;
                if (!acc[dayName]) acc[dayName] = [];
                acc[dayName].push(match);
                return acc;
              }, {} as Record<string, Match[]>)
            ).map(([dayName, dayMatches]) => (
              <div key={dayName} className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {dayName}
                </h4>
                <div className="grid gap-2">
                  {dayMatches.map(match => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{match.home_team}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-medium">{match.away_team}</span>
                        </div>
                        {match.referees && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Arbitres: {match.referees}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {match.home_score !== null && match.away_score !== null ? (
                          <div className="text-xl font-bold">
                            {match.home_score} - {match.away_score}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            {match.match_time || 'Heure à définir'}
                          </div>
                        )}
                        {getMatchStatusBadge(match)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Buteuses */}
          <TabsContent value="buteuses" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Pos.</th>
                    <th className="text-left p-2 font-semibold">Joueuse</th>
                    <th className="text-left p-2 font-semibold">Équipe</th>
                    <th className="text-center p-2 font-semibold">Total</th>
                    <th className="text-center p-2 font-semibold">J1</th>
                    <th className="text-center p-2 font-semibold">J2</th>
                    <th className="text-center p-2 font-semibold">J3</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.slice(0, 20).map((player, index) => (
                    <tr key={player.id} className="border-b hover:bg-muted/50">
                      <td className={`p-2 ${getPositionColor(index + 1)}`}>
                        {index + 1}
                      </td>
                      <td className="p-2 font-medium">
                        {player.first_name} {player.player_name}
                      </td>
                      <td className="p-2">{player.team_name}</td>
                      <td className="text-center p-2 font-bold">{player.total_goals}</td>
                      <td className="text-center p-2">{player.goals_j1}</td>
                      <td className="text-center p-2">{player.goals_j2}</td>
                      <td className="text-center p-2">{player.goals_j3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};