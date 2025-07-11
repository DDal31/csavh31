
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
      console.log("🔍 DÉBUT du calcul des statistiques d'assiduité");
      setLoading(true);

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      console.log("📅 Période du mois en cours:", startOfCurrentMonth, "à", endOfCurrentMonth);
      console.log("📅 Période de l'année en cours:", startOfCurrentYear, "à", endOfCurrentYear);

      const sportTypes: TrainingType[] = ['goalball', 'torball'];
      const newStats = { ...stats };

      for (const sportType of sportTypes) {
        console.log(`🏀 Calcul pour le sport: ${sportType}`);

        // Statistiques du mois en cours
        const { data: currentMonthTrainings, error: monthError } = await supabase
          .from("trainings")
          .select("registered_players_count, total_sport_players_count")
          .eq("type", sportType)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        if (monthError) {
          console.error(`❌ Erreur lors de la récupération des entraînements du mois pour ${sportType}:`, monthError);
          continue;
        }

        console.log(`📊 Entraînements du mois trouvés pour ${sportType}:`, currentMonthTrainings?.length || 0);

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyPercentagesSum += trainingPercentage;
            console.log(`📈 Entraînement ${sportType}: ${presentPlayers}/${totalPlayers} = ${trainingPercentage.toFixed(1)}%`);
          });
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
          
          newStats[sportType as keyof AttendanceStats] = {
            ...newStats[sportType as keyof AttendanceStats],
            currentMonth: {
              present: Math.round(monthlyAverage),
              total: 100
            }
          };
          console.log(`✅ Moyenne mensuelle pour ${sportType}: ${monthlyAverage.toFixed(1)}%`);
        }

        // Statistiques annuelles
        const { data: yearTrainings, error: yearError } = await supabase
          .from("trainings")
          .select("date, registered_players_count, total_sport_players_count")
          .eq("type", sportType)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());

        if (yearError) {
          console.error(`❌ Erreur lors de la récupération des entraînements de l'année pour ${sportType}:`, yearError);
          continue;
        }

        console.log(`📊 Entraînements de l'année trouvés pour ${sportType}:`, yearTrainings?.length || 0);

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
            const yearlyAverage = Math.round(yearlyPercentagesSum / monthCount);
            
            newStats[sportType as keyof AttendanceStats] = {
              ...newStats[sportType as keyof AttendanceStats],
              yearlyStats: {
                present: yearlyAverage,
                total: 100
              },
              bestMonth: bestMonthData
            };
            console.log(`✅ Moyenne annuelle pour ${sportType}: ${yearlyAverage}%`);
            console.log(`🏆 Meilleur mois pour ${sportType}: ${bestMonthData.month} (${bestMonthData.percentage}%)`);
          }
        }
      }

      console.log("📊 Statistiques finales calculées:", newStats);
      setStats(newStats);
      setLoading(false);
      
      // Déclencher immédiatement la génération du rapport
      console.log("🚀 Déclenchement de la génération du rapport IA...");
      await generateAIReport(newStats);
      
    } catch (error) {
      console.error("❌ Erreur lors du calcul des statistiques:", error);
      setLoading(false);
    }
  };

  const generateAIReport = async (currentStats?: AttendanceStats) => {
    try {
      console.log("🤖 DÉBUT de la génération du rapport IA");
      setGeneratingReport(true);
      
      const statsToUse = currentStats || stats;
      console.log("📊 Données à envoyer à DeepSeek:", statsToUse);
      
      const monthlyStats = {
        goalball: { present: statsToUse.goalball.currentMonth.present },
        torball: { present: statsToUse.torball.currentMonth.present }
      };
      
      const yearlyStats = {
        goalball: { present: statsToUse.goalball.yearlyStats.present },
        torball: { present: statsToUse.torball.yearlyStats.present }
      };
      
      const bestMonthStats = {
        goalball: statsToUse.goalball.bestMonth,
        torball: statsToUse.torball.bestMonth
      };

      console.log("📤 Envoi vers l'edge function generate-attendance-report...");
      console.log("📊 Données mensuelles:", monthlyStats);
      console.log("📊 Données annuelles:", yearlyStats);
      console.log("📊 Meilleurs mois:", bestMonthStats);

      const { data, error } = await supabase.functions.invoke('generate-attendance-report', {
        body: { monthlyStats, yearlyStats, bestMonthStats }
      });

      console.log("📥 Réponse de l'edge function:", { data, error });

      if (error) {
        console.error("❌ Erreur lors de l'appel à l'edge function:", error);
        throw error;
      }
      
      if (data && data.report) {
        console.log("✅ Rapport généré avec succès, longueur:", data.report.length);
        setAiReport(data.report);
      } else {
        console.log("⚠️ Aucun rapport dans la réponse:", data);
        setAiReport("Aucun rapport généré. Vérifiez les logs de la fonction.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la génération du rapport:", error);
      setAiReport(`Erreur lors de la génération du rapport: ${error.message}`);
    } finally {
      setGeneratingReport(false);
      console.log("🏁 FIN de la génération du rapport IA");
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect déclenché - Début du calcul des statistiques");
    calculateAttendanceStats();
  }, []);

  console.log("🎨 Rendu du composant AdminAttendanceBilan");
  console.log("📊 État actuel:", { loading, generatingReport, statsCalculated: stats.goalball.currentMonth.present > 0 || stats.torball.currentMonth.present > 0 });

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
                {aiReport || "Aucun bilan disponible. Vérifiez que des données d'entraînement existent."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
