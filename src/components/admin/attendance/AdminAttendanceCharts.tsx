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
      console.log("Calculating attendance stats...");

      // First, fetch all available sports from the database
      const { data: sportsData, error: sportsError } = await supabase
        .from("sports")
        .select("name")
        .order("name");

      if (sportsError) throw sportsError;
      console.log("Fetched sports:", sportsData);

      // Get current date ranges
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      // Initialize stats object with default values for all sport types
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

      // Process each sport from the database
      for (const sport of sportsData) {
        const sportType = sport.name.toLowerCase() as TrainingType;
        if (stats[sportType]) {  // Only process if it's a valid sport type
          // For this example, we'll use 12 as the total number of players
          const totalPlayers = 12;
          console.log(`Total players for ${sportType}:`, totalPlayers);

          // Get trainings for current month
          const { data: currentMonthTrainings } = await supabase
            .from("trainings")
            .select(`
              id,
              date,
              registrations (
                id,
                user_id
              )
            `)
            .eq("type", sportType)
            .gte("date", startOfCurrentMonth.toISOString())
            .lte("date", endOfCurrentMonth.toISOString());

          if (currentMonthTrainings && currentMonthTrainings.length > 0) {
            let monthlyAttendanceSum = 0;
            currentMonthTrainings.forEach(training => {
              const presentPlayers = training.registrations?.length || 0;
              monthlyAttendanceSum += (presentPlayers / totalPlayers) * 100;
            });
            const monthlyAverage = monthlyAttendanceSum / currentMonthTrainings.length;
            stats[sportType].currentMonth = {
              present: Math.round(monthlyAverage),
              total: 100
            };
          }

          // Get trainings for the whole year
          const { data: yearTrainings } = await supabase
            .from("trainings")
            .select(`
              id,
              date,
              registrations (
                id,
                user_id
              )
            `)
            .eq("type", sportType)
            .gte("date", startOfCurrentYear.toISOString())
            .lte("date", endOfCurrentYear.toISOString());

          if (yearTrainings && yearTrainings.length > 0) {
            // Group trainings by month
            const monthlyStats: Record<string, { sum: number; count: number }> = {};
            
            yearTrainings.forEach(training => {
              const monthKey = format(parseISO(training.date), "yyyy-MM");
              if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { sum: 0, count: 0 };
              }
              
              const presentPlayers = training.registrations?.length || 0;
              const attendancePercentage = (presentPlayers / totalPlayers) * 100;
              monthlyStats[monthKey].sum += attendancePercentage;
              monthlyStats[monthKey].count += 1;
            });

            // Calculate monthly averages and find the best month
            let yearlySum = 0;
            let monthCount = 0;
            
            Object.entries(monthlyStats).forEach(([monthKey, data]) => {
              const monthlyAverage = data.sum / data.count;
              yearlySum += monthlyAverage;
              monthCount += 1;

              if (monthlyAverage > (stats[sportType].bestMonth.percentage || 0)) {
                stats[sportType].bestMonth = {
                  month: format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: fr }),
                  percentage: Math.round(monthlyAverage)
                };
              }
            });

            // Calculate yearly average
            if (monthCount > 0) {
              stats[sportType].yearlyStats = {
                present: Math.round(yearlySum / monthCount),
                total: 100
              };
            }
          }
        }
      }

      console.log("Final calculated stats:", stats);
      setSportStats(stats);
      setLoading(false);
    } catch (error) {
      console.error("Error calculating attendance stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAttendanceStats();

    // Subscribe to changes in registrations and trainings
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