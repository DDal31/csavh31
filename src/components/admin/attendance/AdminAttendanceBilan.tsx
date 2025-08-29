
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AIReportDisplay } from "./AIReportDisplay";
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

interface ChartData {
  month: string;
  goalball: number;
  torball: number;
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
  const [chartData, setChartData] = useState<ChartData[]>([]);

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
      const monthlyChartData: Record<string, { month: string; goalball: number; torball: number }> = {};

      for (const sportType of sportTypes) {
        console.log(`🏀 Calcul pour le sport: ${sportType}`);

        // Statistiques du mois en cours (excluant juillet et août - pas d'accès au gymnase)
        const currentMonth = now.getMonth(); // 0-based (0 = Janvier, 6 = Juillet, 7 = Août)
        const isGymClosed = currentMonth === 6 || currentMonth === 7; // Juillet ou Août
        
        let currentMonthTrainings = null;
        let monthError = null;
        
        if (!isGymClosed) {
          const { data, error } = await supabase
            .from("trainings")
            .select("registered_players_count, total_sport_players_count")
            .eq("type", sportType)
            .gte("date", startOfCurrentMonth.toISOString())
            .lte("date", endOfCurrentMonth.toISOString());
          currentMonthTrainings = data;
          monthError = error;
        }

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

        // Statistiques annuelles (excluant juillet et août - pas d'accès au gymnase)
        const { data: allYearTrainings, error: yearError } = await supabase
          .from("trainings")
          .select("date, registered_players_count, total_sport_players_count")
          .eq("type", sportType)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());
        
        // Filtrer pour exclure juillet et août
        const yearTrainings = allYearTrainings?.filter(training => {
          const trainingDate = parseISO(training.date);
          const trainingMonth = trainingDate.getMonth(); // 0-based
          return trainingMonth !== 6 && trainingMonth !== 7; // Exclure juillet (6) et août (7)
        }) || [];

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
          
          // Traiter les données mensuelles pour les graphiques
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

            // Préparer les données pour le graphique
            const monthLabel = format(parseISO(`${monthKey}-01`), "MMM yyyy", { locale: fr });
            if (!monthlyChartData[monthKey]) {
              monthlyChartData[monthKey] = {
                month: monthLabel,
                goalball: 0,
                torball: 0
              };
            }
            monthlyChartData[monthKey][sportType] = Math.round(monthlyAverage);
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

      // Finaliser les données du graphique
      const sortedChartData = Object.keys(monthlyChartData)
        .sort()
        .map(key => monthlyChartData[key]);
      
      console.log("📊 Données du graphique:", sortedChartData);
      setChartData(sortedChartData);

      console.log("📊 Statistiques finales calculées:", newStats);
      setStats(newStats);
      setLoading(false);
      
      // Génération du rapport statistique
      generateStatsReport(newStats);
      
    } catch (error) {
      console.error("❌ Erreur lors du calcul des statistiques:", error);
      setLoading(false);
    }
  };

  const generateStatsReport = (currentStats?: AttendanceStats) => {
    const statsToUse = currentStats || stats;
    
    const totalGoalball = statsToUse.goalball.currentMonth.total + statsToUse.goalball.yearlyStats.total;
    const presentGoalball = statsToUse.goalball.currentMonth.present + statsToUse.goalball.yearlyStats.present;
    const percentageGoalball = totalGoalball > 0 ? Math.round((presentGoalball / totalGoalball) * 100) : 0;
    
    const totalTorball = statsToUse.torball.currentMonth.total + statsToUse.torball.yearlyStats.total;
    const presentTorball = statsToUse.torball.currentMonth.present + statsToUse.torball.yearlyStats.present;
    const percentageTorball = totalTorball > 0 ? Math.round((presentTorball / totalTorball) * 100) : 0;
    
    const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr });
    
    setAiReport(`📊 Rapport des présences - ${currentMonth}

🥍 GOALBALL
• Taux de présence mensuel : ${statsToUse.goalball.currentMonth.present}%
• Taux de présence annuel : ${statsToUse.goalball.yearlyStats.present}%
${statsToUse.goalball.bestMonth.month ? `• Meilleur mois : ${statsToUse.goalball.bestMonth.month} (${statsToUse.goalball.bestMonth.percentage}%)` : ''}

🎯 TORBALL  
• Taux de présence mensuel : ${statsToUse.torball.currentMonth.present}%
• Taux de présence annuel : ${statsToUse.torball.yearlyStats.present}%
${statsToUse.torball.bestMonth.month ? `• Meilleur mois : ${statsToUse.torball.bestMonth.month} (${statsToUse.torball.bestMonth.percentage}%)` : ''}

📈 ANALYSE
${statsToUse.goalball.yearlyStats.present > statsToUse.torball.yearlyStats.present ? 
  `• Le Goalball a un meilleur taux de présence annuel (${statsToUse.goalball.yearlyStats.present}% vs ${statsToUse.torball.yearlyStats.present}%)` : 
  statsToUse.torball.yearlyStats.present > statsToUse.goalball.yearlyStats.present ? 
  `• Le Torball a un meilleur taux de présence annuel (${statsToUse.torball.yearlyStats.present}% vs ${statsToUse.goalball.yearlyStats.present}%)` : 
  `• Les deux sports ont un taux de présence identique (${statsToUse.goalball.yearlyStats.present}%)`}
• Moyenne globale : ${Math.round((statsToUse.goalball.yearlyStats.present + statsToUse.torball.yearlyStats.present) / 2)}%`);
    
    setGeneratingReport(false);
  };

  useEffect(() => {
    console.log("🔄 useEffect déclenché - Début du calcul des statistiques");
    calculateAttendanceStats();
  }, []);

  console.log("🎨 Rendu du composant AdminAttendanceBilan");
  console.log("📊 État actuel:", { loading, generatingReport, statsCalculated: stats.goalball.currentMonth.present > 0 || stats.torball.currentMonth.present > 0 });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48" role="status" aria-label="Chargement des statistiques">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="text-muted-foreground">Calcul des statistiques...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AIReportDisplay 
        report={aiReport}
        isGenerating={generatingReport}
        title="Bilan des présences - Statistiques"
        chartData={chartData}
      />
    </div>
  );
}
