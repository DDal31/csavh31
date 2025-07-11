
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
      console.log("=== DEBUT CALCUL STATISTIQUES ===");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      console.log("Période du mois:", startOfCurrentMonth.toISOString(), "à", endOfCurrentMonth.toISOString());
      console.log("Période de l'année:", startOfCurrentYear.toISOString(), "à", endOfCurrentYear.toISOString());

      const sportTypes: TrainingType[] = ['goalball', 'torball'];
      const newStats = { ...stats };

      for (const sportType of sportTypes) {
        console.log(`=== CALCUL POUR ${sportType.toUpperCase()} ===`);

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
          console.error(`Erreur mois ${sportType}:`, monthError);
          continue;
        }

        console.log(`Entraînements du mois pour ${sportType}:`, currentMonthTrainings?.length || 0);

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyPercentagesSum += trainingPercentage;
            console.log(`Entraînement ${training.id}: ${presentPlayers}/${totalPlayers} = ${trainingPercentage.toFixed(1)}%`);
          });
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
          console.log(`Moyenne mensuelle ${sportType}: ${monthlyAverage.toFixed(1)}%`);
          
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
          console.error(`Erreur année ${sportType}:`, yearError);
          continue;
        }

        console.log(`Entraînements de l'année pour ${sportType}:`, yearTrainings?.length || 0);

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
            console.log(`Moyenne annuelle ${sportType}: ${yearlyAverage}%`);
            console.log(`Meilleur mois ${sportType}: ${bestMonthData.month} (${bestMonthData.percentage}%)`);
            
            newStats[sportType as keyof AttendanceStats] = {
              ...newStats[sportType as keyof AttendanceStats],
              yearlyStats: {
                present: yearlyAverage,
                total: 100
              },
              bestMonth: bestMonthData
            };
          }
        }
      }

      console.log("=== STATISTIQUES FINALES ===");
      console.log("Goalball - Mois:", newStats.goalball.currentMonth.present + "%");
      console.log("Goalball - Année:", newStats.goalball.yearlyStats.present + "%");
      console.log("Torball - Mois:", newStats.torball.currentMonth.present + "%");
      console.log("Torball - Année:", newStats.torball.yearlyStats.present + "%");
      
      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("=== ERREUR CALCUL STATISTIQUES ===", error);
      setLoading(false);
    }
  };

  const generateAIReport = async () => {
    try {
      setGeneratingReport(true);
      console.log("=== DEBUT GENERATION RAPPORT IA ===");
      
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

      console.log("=== DONNEES ENVOYEES A L'IA ===");
      console.log("Statistiques mensuelles:", JSON.stringify(monthlyStats, null, 2));
      console.log("Statistiques annuelles:", JSON.stringify(yearlyStats, null, 2));
      console.log("Meilleurs mois:", JSON.stringify(bestMonthStats, null, 2));

      console.log("=== APPEL DE LA FONCTION EDGE ===");
      console.log("Nom de la fonction: generate-attendance-report");
      
      const { data, error } = await supabase.functions.invoke('generate-attendance-report', {
        body: { 
          monthlyStats, 
          yearlyStats, 
          bestMonthStats 
        }
      });

      console.log("=== REPONSE DE LA FONCTION EDGE ===");
      if (error) {
        console.error("Erreur lors de l'appel à la fonction:", error);
        console.error("Code d'erreur:", error.status);
        console.error("Message d'erreur:", error.message);
        throw error;
      }
      
      console.log("Données reçues:", data);
      console.log("Type de données:", typeof data);
      console.log("Clés disponibles:", data ? Object.keys(data) : "Aucune");
      
      if (data && data.report) {
        console.log("Rapport généré avec succès, longueur:", data.report.length);
        setAiReport(data.report);
      } else {
        console.error("Aucun rapport dans la réponse:", data);
        setAiReport("Erreur: Aucun rapport généré par l'IA.");
      }
    } catch (error) {
      console.error("=== ERREUR GENERATION RAPPORT ===");
      console.error("Type d'erreur:", error.constructor.name);
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      setAiReport(`Erreur lors de la génération du rapport automatique: ${error.message}. Vérifiez les logs de la console pour plus de détails.`);
    } finally {
      setGeneratingReport(false);
      console.log("=== FIN GENERATION RAPPORT ===");
    }
  };

  useEffect(() => {
    console.log("=== COMPOSANT MONTE ===");
    calculateAttendanceStats();
  }, []);

  useEffect(() => {
    console.log("=== EFFECT GENERATION RAPPORT ===");
    console.log("Loading:", loading);
    console.log("Stats goalball mois:", stats.goalball.currentMonth.present);
    console.log("Stats torball mois:", stats.torball.currentMonth.present);
    
    if (!loading && (stats.goalball.currentMonth.present > 0 || stats.torball.currentMonth.present > 0)) {
      console.log("Conditions remplies pour générer le rapport");
      generateAIReport();
    } else {
      console.log("Conditions non remplies pour générer le rapport");
      if (loading) console.log("- Encore en chargement");
      if (stats.goalball.currentMonth.present === 0 && stats.torball.currentMonth.present === 0) {
        console.log("- Aucune donnée de présence");
      }
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
