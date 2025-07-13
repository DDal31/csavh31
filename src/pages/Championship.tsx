
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Target, Calendar } from "lucide-react";

interface Team {
  id: string;
  name: string;
}

interface Standing {
  id: string;
  team: Team;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
}

interface Match {
  id: string;
  home_team: Team;
  away_team: Team;
  home_score: number | null;
  away_score: number | null;
  match_date: string | null;
  round: {
    round_number: number;
  };
}

interface Player {
  id: string;
  name: string;
  team: Team | null;
}

interface ScorerStanding {
  id: string;
  player: Player;
  goals: number;
  matches_played: number;
  position: number;
}

const Championship = () => {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<ScorerStanding[]>([]);
  const [currentSeason, setCurrentSeason] = useState("2024-2025");

  useEffect(() => {
    loadChampionshipData();
  }, [currentSeason]);

  const loadChampionshipData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStandings(),
        loadMatches(),
        loadScorers()
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStandings = async () => {
    const { data, error } = await supabase
      .from("championship_standings")
      .select(`
        *,
        team:team_id (
          id,
          name
        )
      `)
      .eq("season_year", currentSeason)
      .order("position", { ascending: true });

    if (error) {
      console.error("Erreur classement:", error);
      return;
    }

    setStandings(data || []);
  };

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:home_team_id (
          id,
          name
        ),
        away_team:away_team_id (
          id,
          name
        ),
        round:round_id (
          round_number
        )
      `)
      .order("match_date", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Erreur matchs:", error);
      return;
    }

    setMatches(data || []);
  };

  const loadScorers = async () => {
    const { data, error } = await supabase
      .from("scorer_standings")
      .select(`
        *,
        player:player_id (
          id,
          name,
          team:team_id (
            id,
            name
          )
        )
      `)
      .eq("season_year", currentSeason)
      .order("position", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Erreur buteurs:", error);
      return;
    }

    setScorers(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            Championnat {currentSeason}
          </h1>

          <Tabs defaultValue="standings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="standings" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Classement
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Matchs
              </TabsTrigger>
              <TabsTrigger value="scorers" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Buteurs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standings">
              <Card>
                <CardHeader>
                  <CardTitle>Classement Général</CardTitle>
                </CardHeader>
                <CardContent>
                  {standings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun classement disponible pour cette saison
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pos.</TableHead>
                            <TableHead>Équipe</TableHead>
                            <TableHead>MJ</TableHead>
                            <TableHead>V</TableHead>
                            <TableHead>N</TableHead>
                            <TableHead>D</TableHead>
                            <TableHead>BP</TableHead>
                            <TableHead>BC</TableHead>
                            <TableHead>Diff</TableHead>
                            <TableHead>Pts</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standings.map((standing, index) => (
                            <TableRow key={standing.id}>
                              <TableCell className="font-medium">
                                <Badge variant={index < 3 ? "default" : "secondary"}>
                                  {standing.position || index + 1}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {standing.team?.name}
                              </TableCell>
                              <TableCell>{standing.matches_played}</TableCell>
                              <TableCell>{standing.wins}</TableCell>
                              <TableCell>{standing.draws}</TableCell>
                              <TableCell>{standing.losses}</TableCell>
                              <TableCell>{standing.goals_for}</TableCell>
                              <TableCell>{standing.goals_against}</TableCell>
                              <TableCell className={standing.goal_difference >= 0 ? "text-green-600" : "text-red-600"}>
                                {standing.goal_difference > 0 ? "+" : ""}{standing.goal_difference}
                              </TableCell>
                              <TableCell className="font-bold">{standing.points}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>Résultats des Matchs</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun match disponible
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match) => (
                        <div key={match.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <Badge variant="outline">
                                J{match.round?.round_number}
                              </Badge>
                              <div className="flex items-center gap-4 flex-1">
                                <div className="text-right flex-1">
                                  <p className="font-medium">{match.home_team?.name}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded">
                                  <span className="font-bold text-lg">
                                    {match.home_score ?? "-"}
                                  </span>
                                  <span>-</span>
                                  <span className="font-bold text-lg">
                                    {match.away_score ?? "-"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{match.away_team?.name}</p>
                                </div>
                              </div>
                            </div>
                            {match.match_date && (
                              <div className="text-sm text-muted-foreground">
                                {new Date(match.match_date).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scorers">
              <Card>
                <CardHeader>
                  <CardTitle>Classement des Buteurs</CardTitle>
                </CardHeader>
                <CardContent>
                  {scorers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun buteur enregistré pour cette saison
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pos.</TableHead>
                            <TableHead>Joueur</TableHead>
                            <TableHead>Équipe</TableHead>
                            <TableHead>Buts</TableHead>
                            <TableHead>Matchs</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scorers.map((scorer, index) => (
                            <TableRow key={scorer.id}>
                              <TableCell>
                                <Badge variant={index < 3 ? "default" : "secondary"}>
                                  {scorer.position || index + 1}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {scorer.player?.name}
                              </TableCell>
                              <TableCell>
                                {scorer.player?.team?.name || "-"}
                              </TableCell>
                              <TableCell className="font-bold text-lg">
                                {scorer.goals}
                              </TableCell>
                              <TableCell>{scorer.matches_played}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Championship;
