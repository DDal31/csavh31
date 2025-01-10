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
  const [activeTrainingTypes, setActiveTrainingTypes] = useState<TrainingType[]>([]);
  const [sportStats, setSportStats] = useState<Record<TrainingType, {
    currentMonth: TrainingStats;
    yearlyStats: TrainingStats;
    bestMonth: { month: string; percentage: number };
  }>>({} as Record<TrainingType, any>);

  const calculateAttendanceStats = async () => {
    try {
      setLoading(true);
      console.log("Début du calcul des statistiques de présence...");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      // First, get all training types that have trainings
      const { data: distinctTypes, error: typesError } = await supabase
        .from("trainings")
        .select('type')
        .not('type', 'is', null);

      if (typesError) {
        console.error("Erreur lors de la récupération des types d'entraînement:", typesError);
        return;
      }

      // Get unique training types
      const uniqueTypes = [...new Set(distinctTypes.map(t => t.type))];
      console.log("Types d'entraînement actifs:", uniqueTypes);
      setActiveTrainingTypes(uniqueTypes);

      const stats: Record<TrainingType, {
        currentMonth: TrainingStats;
        yearlyStats: TrainingStats;
        bestMonth: { month: string; percentage: number };
      }> = {} as Record<TrainingType, any>;

      // Initialize stats only for active training types
      uniqueTypes.forEach(type => {
        stats[type] = {
          currentMonth: { present: 0, total: 0 },
          yearlyStats: { present: 0, total: 0 },
          bestMonth: { month: "", percentage: 0 }
        };
      });

      // Get current month trainings for each active sport type
      for (const sportType of uniqueTypes) {
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

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyPercentagesSum += trainingPercentage;
          });
          
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
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
      {activeTrainingTypes.map((sport) => (
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
              <MonthlyTrainingChart currentMonthStats={sportStats[sport].currentMonth} sport={sport} />
            </div>

            <div 
              className="bg-gray-800 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques annuelles des présences de ${sport} pour ${new Date().getFullYear()}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Présences de l'année en cours
              </h3>
              <MonthlyTrainingChart currentMonthStats={sportStats[sport].yearlyStats} sport={sport} />
            </div>

            <div 
              className="bg-gray-800 p-6 rounded-lg"
              role="region"
              aria-label={`Meilleur mois de présence pour ${sport}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Meilleur mois de présence
              </h3>
              <MonthlyTrainingChart 
                currentMonthStats={{ present: sportStats[sport].bestMonth.percentage, total: 100 }} 
                sport={sport}
                subtitle={sportStats[sport].bestMonth.month}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}