import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trophy, Plus, Trash2, Save, Users, Target, Calendar } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | '';
  awayScore: number | '';
  matchTime: string;
  day: number;
}

interface TeamStanding {
  id: string;
  teamName: string;
  position: number | '';
  matchesPlayed: number | '';
  wins: number | '';
  draws: number | '';
  losses: number | '';
  goalsFor: number | '';
  goalsAgainst: number | '';
  goalDifference: number | '';
  points: number | '';
}

interface PlayerStats {
  id: string;
  playerName: string;
  teamName: string;
  totalGoals: number | '';
  goals_j1: number | '';
  goals_j2: number | '';
  goals_j3: number | '';
  goals_j4: number | '';
  goals_j5: number | '';
  goals_j6: number | '';
}

export const AdminChampionships = () => {
  const [saving, setSaving] = useState(false);
  const [championshipName, setChampionshipName] = useState('');
  const [seasonYear, setSeasonYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('info');
  
  // États pour les matchs
  const [matches, setMatches] = useState<Match[]>([]);
  
  // États pour le classement
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  
  // États pour les statistiques joueuses
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  
  const { toast } = useToast();

  // Gestion des matchs
  const addMatch = () => {
    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeam: '',
      awayTeam: '',
      homeScore: '',
      awayScore: '',
      matchTime: '',
      day: 1
    };
    setMatches([...matches, newMatch]);
  };

  const removeMatch = (id: string) => {
    setMatches(matches.filter(match => match.id !== id));
  };

  const updateMatch = (id: string, field: keyof Match, value: any) => {
    setMatches(matches.map(match => 
      match.id === id ? { ...match, [field]: value } : match
    ));
  };

  // Gestion du classement
  const addTeamStanding = () => {
    const newStanding: TeamStanding = {
      id: Date.now().toString(),
      teamName: '',
      position: '',
      matchesPlayed: '',
      wins: '',
      draws: '',
      losses: '',
      goalsFor: '',
      goalsAgainst: '',
      goalDifference: '',
      points: ''
    };
    setStandings([...standings, newStanding]);
  };

  const removeTeamStanding = (id: string) => {
    setStandings(standings.filter(standing => standing.id !== id));
  };

  const updateTeamStanding = (id: string, field: keyof TeamStanding, value: any) => {
    setStandings(standings.map(standing => 
      standing.id === id ? { ...standing, [field]: value } : standing
    ));
  };

  // Gestion des statistiques joueuses
  const addPlayerStat = () => {
    const newPlayerStat: PlayerStats = {
      id: Date.now().toString(),
      playerName: '',
      teamName: '',
      totalGoals: '',
      goals_j1: '',
      goals_j2: '',
      goals_j3: '',
      goals_j4: '',
      goals_j5: '',
      goals_j6: ''
    };
    setPlayerStats([...playerStats, newPlayerStat]);
  };

  const removePlayerStat = (id: string) => {
    setPlayerStats(playerStats.filter(stat => stat.id !== id));
  };

  const updatePlayerStat = (id: string, field: keyof PlayerStats, value: any) => {
    setPlayerStats(playerStats.map(stat => 
      stat.id === id ? { ...stat, [field]: value } : stat
    ));
  };

  // Sauvegarde du championnat
  const saveChampionship = async () => {
    if (!championshipName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du championnat",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      // Créer le championnat
      const { data: championship, error: championshipError } = await supabase
        .from('championships')
        .insert({
          name: championshipName.trim(),
          season_year: seasonYear.trim()
        })
        .select()
        .single();

      if (championshipError) throw championshipError;

      // Sauvegarder les matchs par journée
      const dayGroups = matches.reduce((acc, match) => {
        if (!acc[match.day]) acc[match.day] = [];
        acc[match.day].push(match);
        return acc;
      }, {} as Record<number, Match[]>);

      for (const [dayNumber, dayMatches] of Object.entries(dayGroups)) {
        // Créer la journée
        const { data: day, error: dayError } = await supabase
          .from('championship_days')
          .insert({
            championship_id: championship.id,
            day_number: parseInt(dayNumber),
            day_name: `Journée ${dayNumber}`
          })
          .select()
          .single();

        if (dayError) throw dayError;

        // Ajouter les matchs de cette journée
        const matchesToInsert = dayMatches
          .filter(match => match.homeTeam && match.awayTeam)
          .map(match => ({
            championship_day_id: day.id,
            home_team: match.homeTeam,
            away_team: match.awayTeam,
            home_score: match.homeScore || null,
            away_score: match.awayScore || null,
            match_time: match.matchTime || null,
            match_number: `M${dayMatches.indexOf(match) + 1}`
          }));

        if (matchesToInsert.length > 0) {
          const { error: matchesError } = await supabase
            .from('championship_matches')
            .insert(matchesToInsert);

          if (matchesError) throw matchesError;
        }
      }

      // Sauvegarder le classement
      const standingsToInsert = standings
        .filter(standing => standing.teamName)
        .map(standing => ({
          championship_id: championship.id,
          team_name: standing.teamName,
          position: standing.position || null,
          matches_played: standing.matchesPlayed || null,
          wins: standing.wins || null,
          draws: standing.draws || null,
          losses: standing.losses || null,
          goals_for: standing.goalsFor || null,
          goals_against: standing.goalsAgainst || null,
          goal_difference: standing.goalDifference || null,
          points: standing.points || null
        }));

      if (standingsToInsert.length > 0) {
        const { error: standingsError } = await supabase
          .from('championship_team_standings')
          .insert(standingsToInsert);

        if (standingsError) throw standingsError;
      }

      // Sauvegarder les statistiques joueuses
      const playerStatsToInsert = playerStats
        .filter(stat => stat.playerName && stat.teamName)
        .map(stat => ({
          championship_id: championship.id,
          player_name: stat.playerName,
          team_name: stat.teamName,
          total_goals: stat.totalGoals || null,
          goals_j1: stat.goals_j1 || null,
          goals_j2: stat.goals_j2 || null,
          goals_j3: stat.goals_j3 || null,
          goals_j4: stat.goals_j4 || null,
          goals_j5: stat.goals_j5 || null,
          goals_j6: stat.goals_j6 || null
        }));

      if (playerStatsToInsert.length > 0) {
        const { error: playerStatsError } = await supabase
          .from('championship_player_stats')
          .insert(playerStatsToInsert);

        if (playerStatsError) throw playerStatsError;
      }

      toast({
        title: "Championnat créé",
        description: `Le championnat "${championshipName}" a été créé avec succès`,
      });

      // Reset du formulaire
      setChampionshipName('');
      setSeasonYear('2024-2025');
      setMatches([]);
      setStandings([]);
      setPlayerStats([]);
      setActiveTab('info');

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Création de Championnat
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Créez et gérez manuellement les résultats, classements et statistiques 
              des championnats de goalball.
            </p>
          </div>

          {/* Formulaire principal */}
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Informations
                  </TabsTrigger>
                  <TabsTrigger value="matches" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Matchs
                  </TabsTrigger>
                  <TabsTrigger value="standings" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Classement
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Statistiques
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Informations */}
                <TabsContent value="info" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="championshipName">Nom du Championnat</Label>
                      <Input
                        id="championshipName"
                        placeholder="ex: Championnat de France Féminin de Goalball"
                        value={championshipName}
                        onChange={(e) => setChampionshipName(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="seasonYear">Saison</Label>
                      <Input
                        id="seasonYear"
                        placeholder="ex: 2024-2025"
                        value={seasonYear}
                        onChange={(e) => setSeasonYear(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Matchs */}
                <TabsContent value="matches" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Résultats des Matchs</h3>
                    <Button onClick={addMatch} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter un match
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {matches.map((match) => (
                      <Card key={match.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Journée</Label>
                            <Select
                              value={match.day.toString()}
                              onValueChange={(value) => updateMatch(match.id, 'day', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map(day => (
                                  <SelectItem key={day} value={day.toString()}>
                                    Journée {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Équipe Domicile</Label>
                            <Input
                              placeholder="Équipe domicile"
                              value={match.homeTeam}
                              onChange={(e) => updateMatch(match.id, 'homeTeam', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Score</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={match.homeScore}
                              onChange={(e) => updateMatch(match.id, 'homeScore', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="text-center text-muted-foreground font-bold text-lg">
                            VS
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Score</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={match.awayScore}
                              onChange={(e) => updateMatch(match.id, 'awayScore', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Équipe Extérieur</Label>
                            <Input
                              placeholder="Équipe extérieur"
                              value={match.awayTeam}
                              onChange={(e) => updateMatch(match.id, 'awayTeam', e.target.value)}
                            />
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeMatch(match.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {matches.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun match ajouté. Cliquez sur "Ajouter un match" pour commencer.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Onglet Classement */}
                <TabsContent value="standings" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Classement des Équipes</h3>
                    <Button onClick={addTeamStanding} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter une équipe
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {standings.map((standing) => (
                      <Card key={standing.id} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Position</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              value={standing.position}
                              onChange={(e) => updateTeamStanding(standing.id, 'position', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label>Équipe</Label>
                            <Input
                              placeholder="Nom de l'équipe"
                              value={standing.teamName}
                              onChange={(e) => updateTeamStanding(standing.id, 'teamName', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>MJ</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.matchesPlayed}
                              onChange={(e) => updateTeamStanding(standing.id, 'matchesPlayed', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>V</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.wins}
                              onChange={(e) => updateTeamStanding(standing.id, 'wins', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>N</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.draws}
                              onChange={(e) => updateTeamStanding(standing.id, 'draws', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>D</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.losses}
                              onChange={(e) => updateTeamStanding(standing.id, 'losses', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>BP</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.goalsFor}
                              onChange={(e) => updateTeamStanding(standing.id, 'goalsFor', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>BC</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.goalsAgainst}
                              onChange={(e) => updateTeamStanding(standing.id, 'goalsAgainst', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Pts</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={standing.points}
                              onChange={(e) => updateTeamStanding(standing.id, 'points', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeTeamStanding(standing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {standings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune équipe ajoutée. Cliquez sur "Ajouter une équipe" pour commencer.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Onglet Statistiques */}
                <TabsContent value="stats" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Statistiques des Joueuses</h3>
                    <Button onClick={addPlayerStat} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter une joueuse
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {playerStats.map((stat) => (
                      <Card key={stat.id} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4 items-end">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Joueuse</Label>
                            <Input
                              placeholder="Prénom Nom"
                              value={stat.playerName}
                              onChange={(e) => updatePlayerStat(stat.id, 'playerName', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Équipe</Label>
                            <Input
                              placeholder="Équipe"
                              value={stat.teamName}
                              onChange={(e) => updatePlayerStat(stat.id, 'teamName', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Total</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.totalGoals}
                              onChange={(e) => updatePlayerStat(stat.id, 'totalGoals', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>J1</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.goals_j1}
                              onChange={(e) => updatePlayerStat(stat.id, 'goals_j1', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>J2</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.goals_j2}
                              onChange={(e) => updatePlayerStat(stat.id, 'goals_j2', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>J3</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.goals_j3}
                              onChange={(e) => updatePlayerStat(stat.id, 'goals_j3', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>J4</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.goals_j4}
                              onChange={(e) => updatePlayerStat(stat.id, 'goals_j4', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>J5</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={stat.goals_j5}
                              onChange={(e) => updatePlayerStat(stat.id, 'goals_j5', e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removePlayerStat(stat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {playerStats.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune joueuse ajoutée. Cliquez sur "Ajouter une joueuse" pour commencer.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6 border-t">
                <Button 
                  onClick={saveChampionship}
                  disabled={saving || !championshipName.trim()}
                  className="min-w-[200px]"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 animate-spin mr-2" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Créer le championnat
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};