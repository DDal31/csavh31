
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, UserPlus, FileText } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

type LowAttendanceTraining = {
  id: string;
  date: string;
  registered_players_count: number;
};

type MonthlyStats = {
  month: string;
  present: number;
  total: number;
  percentage: number;
};

export function DashboardCharts({ sport }: { sport: TrainingType }) {
  const [loading, setLoading] = useState(true);
  const [lowAttendanceTrainings, setLowAttendanceTrainings] = useState<LowAttendanceTraining[]>([]);
  const [report, setReport] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState<string>("");
  const [allSportsStats, setAllSportsStats] = useState<{[key: string]: MonthlyStats[]}>({});
  const navigate = useNavigate();

  const fetchStatsAndGenerateReport = async () => {
    try {
      console.log("=== DÉBUT FETCH STATS DASHBOARD ===");
      setError("");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("Aucune session utilisateur trouvée");
        setError("Vous devez être connecté pour voir vos statistiques");
        setLoading(false);
        return;
      }

      console.log(`Récupération des stats globales pour l'utilisateur: ${session.user.id}`);
      
      // Récupérer le profil pour connaître les sports pratiqués
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("sport")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
        setError("Impossible de récupérer votre profil");
        setLoading(false);
        return;
      }

      // Déterminer les sports à analyser en fonction du profil
      let sportsToAnalyze: TrainingType[] = [];
      if (profile.sport === 'both') {
        sportsToAnalyze = ['goalball', 'torball'];
      } else if (profile.sport.includes('goalball')) {
        sportsToAnalyze.push('goalball');
      } else if (profile.sport.includes('torball')) {
        sportsToAnalyze.push('torball');
      }

      console.log(`Sports à analyser: ${sportsToAnalyze.join(', ')}`);

      // Calcul simple de l'année sportive : septembre de l'année dernière à juillet de cette année
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-based (0 = Janvier)
      
      // Si on est entre janvier et juillet, l'année sportive a commencé en septembre de l'année précédente
      // Si on est entre août et décembre, l'année sportive a commencé en septembre de cette année
      const sportsYearStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;
      const sportsYearEndYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
      
      console.log(`Année sportive: septembre ${sportsYearStartYear} - juillet ${sportsYearEndYear}`);

      const monthsToCheck = [
        { month: 8, year: sportsYearStartYear },  // Septembre
        { month: 9, year: sportsYearStartYear },  // Octobre
        { month: 10, year: sportsYearStartYear }, // Novembre
        { month: 11, year: sportsYearStartYear }, // Décembre
        { month: 0, year: sportsYearEndYear },    // Janvier
        { month: 1, year: sportsYearEndYear },    // Février
        { month: 2, year: sportsYearEndYear },    // Mars
        { month: 3, year: sportsYearEndYear },    // Avril
        { month: 4, year: sportsYearEndYear },    // Mai
        { month: 5, year: sportsYearEndYear },    // Juin
        { month: 6, year: sportsYearEndYear },    // Juillet
      ];

      // Collecte des statistiques pour tous les sports pratiqués
      const allStats: {[key: string]: MonthlyStats[]} = {};
      let allLowAttendanceTrainings: LowAttendanceTraining[] = [];

      for (const sportType of sportsToAnalyze) {
        const monthlyStats: MonthlyStats[] = [];

        for (const { month, year } of monthsToCheck) {
          const monthStart = startOfMonth(new Date(year, month, 1));
          const monthEnd = endOfMonth(new Date(year, month, 1));
          
          console.log(`Vérification du mois: ${format(monthStart, 'MMMM yyyy', { locale: fr })} pour ${sportType}`);

          // Mes présences ce mois-ci
          const { data: myAttendance, error: myError } = await supabase
            .from("trainings")
            .select(`
              id,
              date,
              registrations!inner (
                user_id
              )
            `)
            .eq("type", sportType)
            .eq("registrations.user_id", session.user.id)
            .gte("date", monthStart.toISOString().split('T')[0])
            .lte("date", monthEnd.toISOString().split('T')[0]);

          if (myError) {
            console.error(`Erreur lors de la récupération des présences pour ${format(monthStart, 'MMMM yyyy', { locale: fr })} ${sportType}:`, myError);
            continue;
          }

          // Total des entraînements ce mois-ci
          const { data: totalTrainings, error: totalError } = await supabase
            .from("trainings")
            .select("id")
            .eq("type", sportType)
            .gte("date", monthStart.toISOString().split('T')[0])
            .lte("date", monthEnd.toISOString().split('T')[0]);

          if (totalError) {
            console.error(`Erreur lors de la récupération du total pour ${format(monthStart, 'MMMM yyyy', { locale: fr })} ${sportType}:`, totalError);
            continue;
          }

          const presentCount = myAttendance?.length || 0;
          const totalCount = totalTrainings?.length || 0;
          const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

          console.log(`${format(monthStart, 'MMMM yyyy', { locale: fr })} ${sportType}: ${presentCount}/${totalCount} (${percentage}%)`);

          monthlyStats.push({
            month: format(monthStart, 'MMMM yyyy', { locale: fr }),
            present: presentCount,
            total: totalCount,
            percentage
          });
        }

        allStats[sportType] = monthlyStats;

        // Recherche des entraînements avec peu d'inscrits pour ce sport
        const { data: lowAttendanceData, error: lowAttendanceError } = await supabase
          .from("trainings")
          .select(`
            id,
            date,
            registered_players_count
          `)
          .eq("type", sportType)
          .gte("date", now.toISOString().split('T')[0])
          .lt("registered_players_count", 6)
          .order("date", { ascending: true })
          .limit(3);

        if (lowAttendanceError) {
          console.error(`Erreur lors de la récupération des entraînements à faible participation pour ${sportType}:`, lowAttendanceError);
        } else {
          allLowAttendanceTrainings = [...allLowAttendanceTrainings, ...(lowAttendanceData || [])];
        }
      }

      setAllSportsStats(allStats);
      setLowAttendanceTrainings(allLowAttendanceTrainings);

      // Génération d'un rapport global pour tous les sports
      const hasData = Object.values(allStats).some(stats => stats.some(stat => stat.total > 0));
      if (hasData) {
        console.log("Génération du rapport IA global...");
        setGeneratingReport(true);
        
        const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-user-attendance-report', {
          body: {
            allSportsStats: allStats,
            sportsYear: `${sportsYearStartYear}-${sportsYearEndYear}`,
            userSports: sportsToAnalyze
          }
        });

        console.log("Réponse du rapport:", reportData, reportError);

        if (reportError) {
          console.error("Erreur lors de la génération du rapport:", reportError);
          setReport(`Erreur lors de la génération du rapport: ${reportError.message}`);
        } else {
          setReport(reportData?.report || "Aucun rapport généré");
        }
      } else {
        setReport("Aucune donnée de présence trouvée pour cette année sportive. Inscrivez-vous à des entraînements pour voir vos statistiques !");
      }

      setGeneratingReport(false);
      setLoading(false);
      console.log("=== FIN FETCH STATS DASHBOARD ===");

    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setGeneratingReport(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndGenerateReport();

    // Écoute des changements d'inscriptions
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Changement d\'inscription détecté:', payload);
          fetchStatsAndGenerateReport();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sport]);

  const handleRegistrationClick = () => {
    navigate("/training");
  };

  const formatTrainingMessage = (trainings: LowAttendanceTraining[]) => {
    if (trainings.length === 0) return null;

    if (trainings.length === 1) {
      const training = trainings[0];
      return `L'entraînement du ${format(new Date(training.date), 'dd MMMM yyyy', { locale: fr })} 
              n'a que ${training.registered_players_count} joueur${training.registered_players_count > 1 ? 's' : ''} inscrit${training.registered_players_count > 1 ? 's' : ''}. 
              Cliquez ici pour vous inscrire et permettre son maintien !`;
    }

    const nextTraining = trainings[0];
    return `${trainings.length} entraînements à venir manquent de joueurs, dont celui du 
            ${format(new Date(nextTraining.date), 'dd MMMM yyyy', { locale: fr })} 
            avec ${nextTraining.registered_players_count} joueur${nextTraining.registered_players_count > 1 ? 's' : ''} inscrit${nextTraining.registered_players_count > 1 ? 's' : ''}. 
            Cliquez ici pour vous inscrire et permettre leur maintien !`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white">Chargement de vos statistiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto mb-36">
        <Card className="bg-red-900 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-200">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto mb-36">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bilan de vos présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatingReport ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-card-foreground">Génération du rapport en cours...</span>
            </div>
          ) : (
            <div className="max-w-none">
              <div 
                className="text-card-foreground whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {lowAttendanceTrainings.length > 0 && (
        <Alert 
          className="bg-gray-800 border-primary text-white z-10 relative mb-10"
          role="alert"
          aria-live="polite"
        >
          <UserPlus className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <button
              onClick={handleRegistrationClick}
              className="text-left hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-800 w-full py-2"
            >
              {formatTrainingMessage(lowAttendanceTrainings)}
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
