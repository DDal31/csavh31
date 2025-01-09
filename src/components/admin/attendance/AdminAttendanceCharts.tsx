import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { MonthlyTrainingChart } from "@/components/dashboard/charts/MonthlyTrainingChart";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];
type TrainingStats = { present: number; total: number };

export function AdminAttendanceCharts() {
  const [loading, setLoading] = useState(true);
  const [sportStats, setSportStats] = useState<Record<TrainingType, {
    currentMonth: TrainingStats;
    yearlyStats: TrainingStats;
    bestMonth: { month: string; percentage: number };
  }>>({
    goalball: {
      currentMonth: { present: 0, total: 0 },
      yearlyStats: { present: 0, total: 0 },
      bestMonth: { month: "", percentage: 0 }
    },
    torball: {
      currentMonth: { present: 0, total: 0 },
      yearlyStats: { present: 0, total: 0 },
      bestMonth: { month: "", percentage: 0 }
    },
    other: {
      currentMonth: { present: 0, total: 0 },
      yearlyStats: { present: 0, total: 0 },
      bestMonth: { month: "", percentage: 0 }
    },
    showdown: {
      currentMonth: { present: 0, total: 0 },
      yearlyStats: { present: 0, total: 0 },
      bestMonth: { month: "", percentage: 0 }
    }
  });

  const calculateAttendanceStats = async () => {
    try {
      setLoading(true);
      console.log("Début du calcul des statistiques de présence...");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      console.log("Période analysée:", {
        début_mois: startOfCurrentMonth,
        fin_mois: endOfCurrentMonth
      });

      const stats: Record<TrainingType, {
        currentMonth: TrainingStats;
        yearlyStats: TrainingStats;
        bestMonth: { month: string; percentage: number };
      }> = {
        goalball: {
          currentMonth: { present: 0, total: 0 },
          yearlyStats: { present: 0, total: 0 },
          bestMonth: { month: "", percentage: 0 }
        },
        torball: {
          currentMonth: { present: 0, total: 0 },
          yearlyStats: { present: 0, total: 0 },
          bestMonth: { month: "", percentage: 0 }
        },
        other: {
          currentMonth: { present: 0, total: 0 },
          yearlyStats: { present: 0, total: 0 },
          bestMonth: { month: "", percentage: 0 }
        },
        showdown: {
          currentMonth: { present: 0, total: 0 },
          yearlyStats: { present: 0, total: 0 },
          bestMonth: { month: "", percentage: 0 }
        }
      };

      // Get current month trainings for each sport type
      for (const sportType of Object.keys(stats) as TrainingType[]) {
        console.log(`\nAnalyse du sport: ${sportType}`);

        // Get current month trainings
        const { data: currentMonthTrainings, error: trainingsError } = await supabase
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

        if (trainingsError) {
          console.error(`Erreur lors de la récupération des entraînements pour ${sportType}:`, trainingsError);
          continue;
        }

        console.log(`Nombre d'entraînements trouvés pour ${sportType} ce mois-ci:`, currentMonthTrainings?.length);

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          
          console.log(`\nDétail des présences pour ${sportType}:`);
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            console.log(`Entraînement du ${format(parseISO(training.date), 'dd/MM/yyyy')}: ${presentPlayers}/${totalPlayers} joueurs = ${trainingPercentage.toFixed(1)}%`);
            monthlyPercentagesSum += trainingPercentage;
          });
          
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
          console.log(`\nMoyenne mensuelle pour ${sportType}: ${monthlyAverage.toFixed(1)}%`);
          
          stats[sportType].currentMonth = {
            present: Math.round(monthlyAverage),
            total: 100
          };
        }

        // Get yearly stats
        const { data: yearTrainings } = await supabase
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
          
          Object.entries(monthlyStats).forEach(([monthKey, data]) => {
            const monthlyAverage = data.sum / data.count;
            yearlyPercentagesSum += monthlyAverage;
            monthCount += 1;

            if (monthlyAverage > (stats[sportType].bestMonth.percentage || 0)) {
              stats[sportType].bestMonth = {
                month: format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: fr }),
                percentage: Math.round(monthlyAverage)
              };
            }
          });

          if (monthCount > 0) {
            stats[sportType].yearlyStats = {
              present: Math.round(yearlyPercentagesSum / monthCount),
              total: 100
            };
          }
        }
      }

      console.log("\nStatistiques finales calculées:", stats);
      setSportStats(stats);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAttendanceStats();

    const registrationsChannel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => calculateAttendanceStats()
      )
      .subscribe();

    const trainingsChannel = supabase
      .channel('trainings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainings'
        },
        () => calculateAttendanceStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(trainingsChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(sportStats).map(([sport, stats]) => (
        <div key={sport} className="space-y-4">
          <h2 className="text-xl font-bold text-white capitalize">
            Statistiques de présence - {sport}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div 
              className="bg-gray-800 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques des présences de ${sport} pour ${format(new Date(), 'MMMM yyyy', { locale: fr })}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Présences du mois en cours
              </h3>
              <MonthlyTrainingChart currentMonthStats={stats.currentMonth} sport={sport as TrainingType} />
            </div>

            <div 
              className="bg-gray-800 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques annuelles des présences de ${sport} pour ${new Date().getFullYear()}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Présences de l'année en cours
              </h3>
              <MonthlyTrainingChart currentMonthStats={stats.yearlyStats} sport={sport as TrainingType} />
            </div>

            <div 
              className="bg-gray-800 p-6 rounded-lg"
              role="region"
              aria-label={`Meilleur mois de présence pour ${sport}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Meilleur mois de présence
              </h3>
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-2xl font-bold text-white mb-2">
                  {stats.bestMonth.month}
                </p>
                <p className="text-lg text-gray-300">
                  {Math.round(stats.bestMonth.percentage)}% de présence
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}