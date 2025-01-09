import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { MonthlyTrainingChart } from "@/components/dashboard/charts/MonthlyTrainingChart";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];
type TrainingStats = { present: number; total: number };
type MonthlyStats = { [key: string]: { present: number; total: number } };

export function AdminAttendanceCharts() {
  const [loading, setLoading] = useState(true);
  const [sportStats, setSportStats] = useState<Record<TrainingType, {
    currentMonth: TrainingStats;
    yearlyStats: TrainingStats;
    bestMonth: { month: string; percentage: number };
  }>>({} as Record<TrainingType, any>);

  const calculateAttendanceStats = async () => {
    try {
      setLoading(true);
      console.log("Calculating attendance stats...");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      // Fetch all trainings for the year
      const { data: trainings, error: trainingsError } = await supabase
        .from("trainings")
        .select(`
          id,
          type,
          date,
          registrations (
            id,
            user_id
          )
        `)
        .gte("date", startOfCurrentYear.toISOString())
        .lte("date", endOfCurrentYear.toISOString());

      if (trainingsError) throw trainingsError;
      console.log("Fetched trainings:", trainings);

      const stats: Record<TrainingType, {
        currentMonth: TrainingStats;
        yearlyStats: TrainingStats;
        monthlyStats: MonthlyStats;
      }> = {} as any;

      // Initialize stats for each sport type
      trainings.forEach(training => {
        if (!stats[training.type]) {
          stats[training.type] = {
            currentMonth: { present: 0, total: 0 },
            yearlyStats: { present: 0, total: 0 },
            monthlyStats: {}
          };
        }
      });

      // Calculate stats for each training
      trainings.forEach(training => {
        const trainingDate = parseISO(training.date);
        const monthKey = format(trainingDate, "yyyy-MM");
        const registeredCount = training.registrations?.length || 0;

        // Get total potential players for this sport type
        const { data: totalPlayers } = await supabase
          .from("profiles")
          .select("id")
          .eq("sport", training.type);

        const totalPlayersCount = totalPlayers?.length || 0;

        // Update monthly stats
        if (!stats[training.type].monthlyStats[monthKey]) {
          stats[training.type].monthlyStats[monthKey] = {
            present: 0,
            total: 0
          };
        }
        stats[training.type].monthlyStats[monthKey].present += registeredCount;
        stats[training.type].monthlyStats[monthKey].total += totalPlayersCount;

        // Update current month stats
        if (trainingDate >= startOfCurrentMonth && trainingDate <= endOfCurrentMonth) {
          stats[training.type].currentMonth.present += registeredCount;
          stats[training.type].currentMonth.total += totalPlayersCount;
        }

        // Update yearly stats
        stats[training.type].yearlyStats.present += registeredCount;
        stats[training.type].yearlyStats.total += totalPlayersCount;
      });

      // Calculate best month for each sport
      const finalStats: Record<TrainingType, any> = {};
      Object.entries(stats).forEach(([sport, sportData]) => {
        let bestMonth = { month: "", percentage: 0 };
        
        Object.entries(sportData.monthlyStats).forEach(([month, monthData]) => {
          const percentage = (monthData.present / monthData.total) * 100;
          if (percentage > bestMonth.percentage) {
            bestMonth = {
              month: format(parseISO(month + "-01"), "MMMM yyyy", { locale: fr }),
              percentage
            };
          }
        });

        finalStats[sport as TrainingType] = {
          currentMonth: sportData.currentMonth,
          yearlyStats: sportData.yearlyStats,
          bestMonth
        };
      });

      console.log("Final calculated stats:", finalStats);
      setSportStats(finalStats);
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