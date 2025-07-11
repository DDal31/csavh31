
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface SportStats {
  currentMonth: { present: number; total: number };
  yearlyStats: { present: number; total: number };
  bestMonth: { month: string; percentage: number };
}

interface AttendanceStats {
  goalball: SportStats;
  torball: SportStats;
}

export function AdminAttendanceBilan() {
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({
    goalball: {
      currentMonth: { present: 0, total: 100 },
      yearlyStats: { present: 0, total: 100 },
      bestMonth: { month: "", percentage: 0 }
    },
    torball: {
      currentMonth: { present: 0, total: 100 },
      yearlyStats: { present: 0, total: 100 },
      bestMonth: { month: "", percentage: 0 }
    }
  });
  const [aiReport, setAiReport] = useState("");

  const calculateAttendanceStats = async () => {
    try {
      setLoading(true);
      console.log("Calcul des statistiques de présence...");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      const sportTypes: TrainingType[] = ['goalball', 'torball'];
      const newStats = { ...stats };

      for (const sportType of sportTypes) {
        console.log(`Calcul des statistiques pour ${sportType}...`);

        // Statistiques du mois en cours
        const { data: currentMonthTrainings, error: monthError } = await supabase
          .from("trainings")
          .select(`
            id,
            date,
            registered_players_count,
            total_sport_players_count
          `)
          .eq("type", sportType)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        if (monthError) {
          console.error(`Erreur lors de la récupération des données mensuelles pour ${sportType}:`, monthError);
          continue;
        }

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyPercentagesSum += trainingPercentage;
          });
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
          newStats[sportType as keyof AttendanceStats] = {
            ...newStats[sportType as keyof AttendanceStats],
            currentMonth: {
              present: Math.round(monthlyAverage),
              total: 100
            }
          };
        }

        // Statistiques annuelles
        const { data: yearTrainings, error: yearError } = await supabase
          .from("trainings")
          .select(`
            id,
            date,
            registered_players_count,
            total_sport_players_count
          `)
          .eq("type", sportType)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());

        if (yearError) {
          console.error(`Erreur lors de la récupération des données annuelles pour ${sportType}:`, yearError);
          continue;
        }

        if (yearTrainings && yearTrainings.length > 0) {
          const monthlyStats: Record<string, { sum: number; count: number }> = {};
          
          yearTrainings.forEach(training => {
            const monthKey = format(parseISO(training.date), "yyyy-MM");
            if (!monthlyStats[monthKey]) {
              monthlyStats[monthKey] = { sum: 0, count: 0 };
            }
            
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const attendancePercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyStats[monthKey].sum += attendancePercentage;
            monthlyStats[monthKey].count += 1;
          });

          let yearlyPercentagesSum = 0;
          let monthCount = 0;
          let bestMonthData = { month: "", percentage: 0 };
          
          Object.entries(monthlyStats).forEach(([monthKey, data]) => {
            const monthlyAverage = data.sum / data.count;
            yearlyPercentagesSum += monthlyAverage;
            monthCount += 1;

            if (monthlyAverage > bestMonthData.percentage) {
              bestMonthData = {
                month: format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: fr }),
                percentage: Math.round(monthlyAverage)
              };
            }
          });

          if (monthCount > 0) {
            newStats[sportType as keyof AttendanceStats] = {
              ...newStats[sportType as keyof AttendanceStats],
              yearlyStats: {
                present: Math.round(yearlyPercentagesSum / monthCount),
                total: 100
              },
              bestMonth: bestMonthData
            };
          }
        }
      }

      console.log("Statistiques calculées:", newStats);
      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      setLoading(false);
    }
  };

  const generateAIReport = async () => {
    try {
      setGeneratingReport(true);
      console.log("Génération du rapport IA...");
      
      const monthlyStats = {
        goalball: { present: stats.goalball.currentMonth.present },
        torball: { present: stats.torball.currentMonth.present }
      };
      
      const yearlyStats = {
        goalball: { present: stats.goalball.yearlyStats.present },
        torball: { present: stats.torball.yearlyStats.present }
      };
      
      const bestMonthStats = {
        goalball: stats.goalball.bestMonth,
        torball: stats.torball.bestMonth
      };

      console.log("Données envoyées à l'IA:", { monthlyStats, yearlyStats, bestMonthStats });

      const { data, error } = await supabase.functions.invoke('generate-attendance-report', {
        body: { monthlyStats, yearlyStats, bestMonthStats }
      });

      if (error) {
        console.error("Erreur lors de l'appel à la fonction:", error);
        throw error;
      }
      
      console.log("Réponse reçue de l'IA:", data);
      setAiReport(data.report || "Aucun rapport généré.");
    } catch (error) {
      console.error("Erreur lors de la génération du rapport IA:", error);
      setAiReport("Erreur lors de la génération du rapport automatique. Veuillez réessayer plus tard.");
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    calculateAttendanceStats();
  }, []);

  useEffect(() => {
    if (!loading && (stats.goalball.currentMonth.present > 0 || stats.torball.currentMonth.present > 0)) {
      generateAIReport();
    }
  }, [loading, stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-300">Calcul des statistiques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bilan IA uniquement */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <FileText className="h-5 w-5 text-green-400" />
          <CardTitle className="text-xl font-medium text-white ml-2">
            Bilan des présences - Analyse IA
          </CardTitle>
          {generatingReport && (
            <Loader2 className="h-4 w-4 animate-spin text-green-400 ml-2" />
          )}
        </CardHeader>
        <CardContent>
          {generatingReport ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-400 mx-auto mb-2" />
                <p className="text-gray-300">Génération du bilan en cours...</p>
                <p className="text-gray-400 text-sm mt-1">Analyse des données avec DeepSeek...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line text-base">
                {aiReport || "Aucun bilan disponible pour le moment. Vérifiez que des données d'entraînement existent."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
