
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, UserPlus, FileText } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

type ChartData = {
  month: string;
  "Présences": number;
  "Total": number;
  "Taux": number;
};

export function DashboardCharts({ sport }: { sport: TrainingType }) {
  const [loading, setLoading] = useState(true);
  const [lowAttendanceTrainings, setLowAttendanceTrainings] = useState<LowAttendanceTraining[]>([]);
  const [report, setReport] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData[]>([]);
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

      console.log(`Récupération des stats pour le sport: ${sport} et l'utilisateur: ${session.user.id}`);
      const normalizedSport = sport.toLowerCase() as TrainingType;
      
      if (!isValidTrainingType(normalizedSport)) {
        console.error("Type de sport invalide:", sport);
        setError("Type de sport invalide");
        setLoading(false);
        return;
      }

      // Calcul simple de l'année sportive : septembre de l'année dernière à juillet de cette année
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-based (0 = Janvier)
      
      // Si on est entre janvier et juillet, l'année sportive a commencé en septembre de l'année précédente
      // Si on est entre août et décembre, l'année sportive a commencé en septembre de cette année
      const sportsYearStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;
      const sportsYearEndYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
      
      console.log(`Année sportive: septembre ${sportsYearStartYear} - juillet ${sportsYearEndYear}`);

      // Collecte des statistiques mensuelles (excluant juillet et août - pas d'accès au gymnase)
      const monthlyStats: MonthlyStats[] = [];
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
        // Juillet et août exclus (pas d'accès au gymnase)
      ];

      for (const { month, year } of monthsToCheck) {
        const monthStart = startOfMonth(new Date(year, month, 1));
        const monthEnd = endOfMonth(new Date(year, month, 1));
        
        console.log(`Vérification du mois: ${format(monthStart, 'MMMM yyyy', { locale: fr })}`);

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
          .eq("type", normalizedSport)
          .eq("registrations.user_id", session.user.id)
          .gte("date", monthStart.toISOString().split('T')[0])
          .lte("date", monthEnd.toISOString().split('T')[0]);

        if (myError) {
          console.error(`Erreur lors de la récupération des présences pour ${format(monthStart, 'MMMM yyyy', { locale: fr })}:`, myError);
          continue;
        }

        // Total des entraînements ce mois-ci
        const { data: totalTrainings, error: totalError } = await supabase
          .from("trainings")
          .select("id")
          .eq("type", normalizedSport)
          .gte("date", monthStart.toISOString().split('T')[0])
          .lte("date", monthEnd.toISOString().split('T')[0]);

        if (totalError) {
          console.error(`Erreur lors de la récupération du total pour ${format(monthStart, 'MMMM yyyy', { locale: fr })}:`, totalError);
          continue;
        }

        const presentCount = myAttendance?.length || 0;
        const totalCount = totalTrainings?.length || 0;
        const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        console.log(`${format(monthStart, 'MMMM yyyy', { locale: fr })}: ${presentCount}/${totalCount} (${percentage}%)`);

        monthlyStats.push({
          month: format(monthStart, 'MMMM yyyy', { locale: fr }),
          present: presentCount,
          total: totalCount,
          percentage
        });
      }

      console.log("Statistiques mensuelles collectées:", monthlyStats);

      // Préparer les données pour le graphique
      const chartDataFormatted: ChartData[] = monthlyStats
        .filter(stat => stat.total > 0)
        .map(stat => ({
          month: stat.month.split(' ')[0], // Garder seulement le nom du mois
          "Présences": stat.present,
          "Total": stat.total,
          "Taux": stat.percentage
        }));
      
      setChartData(chartDataFormatted);

      // Recherche des entraînements avec peu d'inscrits
      const { data: lowAttendanceData, error: lowAttendanceError } = await supabase
        .from("trainings")
        .select(`
          id,
          date,
          registered_players_count
        `)
        .eq("type", normalizedSport)
        .gte("date", now.toISOString().split('T')[0])
        .lt("registered_players_count", 6)
        .order("date", { ascending: true })
        .limit(5);

      if (lowAttendanceError) {
        console.error("Erreur lors de la récupération des entraînements à faible participation:", lowAttendanceError);
      } else {
        setLowAttendanceTrainings(lowAttendanceData || []);
      }

      // Génération du résumé statistique
      const hasData = monthlyStats.some(stat => stat.total > 0);
      if (hasData) {
        const totalPresences = monthlyStats.reduce((sum, stat) => sum + stat.present, 0);
        const totalTrainings = monthlyStats.reduce((sum, stat) => sum + stat.total, 0);
        const globalPercentage = totalTrainings > 0 ? Math.round((totalPresences / totalTrainings) * 100) : 0;
        
        const bestMonth = monthlyStats.reduce((best, stat) => 
          stat.percentage > best.percentage ? stat : best
        , { month: '', percentage: 0 });
        
        const recentMonths = monthlyStats.filter(stat => stat.total > 0).slice(-3);
        
        setReport(`📊 Résumé de votre saison ${sportsYearStartYear}-${sportsYearEndYear} en ${normalizedSport.charAt(0).toUpperCase() + normalizedSport.slice(1)}

📈 Statistiques globales :
• Taux de présence général : ${globalPercentage}%
• Total des présences : ${totalPresences}/${totalTrainings} entraînements
${bestMonth.percentage > 0 ? `• Meilleur mois : ${bestMonth.month} (${bestMonth.percentage}%)` : ''}

📅 Détail par mois :
${monthlyStats.filter(stat => stat.total > 0).map(stat => 
  `• ${stat.month} : ${stat.present}/${stat.total} (${stat.percentage}%)`
).join('\n')}

${recentMonths.length > 0 ? `\n🎯 Tendance récente (3 derniers mois) :
${recentMonths.map(stat => `• ${stat.month} : ${stat.percentage}%`).join('\n')}` : ''}`);
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bilan de vos présences en {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatingReport ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-white">Calcul des statistiques en cours...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Graphique des présences */}
              {chartData.length > 0 && (
                <div className="bg-card/50 rounded-lg p-4 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Évolution de vos présences
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                        formatter={(value, name) => [
                          name === "Taux" ? `${value}%` : value,
                          name === "Présences" ? "Vos présences" : 
                          name === "Total" ? "Total entraînements" : "Taux de présence"
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(value) => 
                          value === "Présences" ? "Vos présences" : 
                          value === "Total" ? "Total entraînements" : "Taux (%)"
                        }
                      />
                      <Bar dataKey="Présences" fill="hsl(var(--primary))" />
                      <Bar dataKey="Total" fill="hsl(var(--muted))" />
                      <Bar dataKey="Taux" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Rapport textuel */}
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-card/30 p-4 rounded-lg border border-border"
                  dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }}
                />
              </div>
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
