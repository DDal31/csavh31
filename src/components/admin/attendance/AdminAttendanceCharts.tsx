import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { MonthlyTrainingChart } from "@/components/dashboard/charts/MonthlyTrainingChart";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface SportStats {
  sport: TrainingType;
  monthlyStats: { present: number; total: number };
  yearlyStats: { present: number; total: number };
  bestMonth: {
    month: string;
    percentage: number;
  };
}

export function AdminAttendanceCharts() {
  const [sportsStats, setSportsStats] = useState<SportStats[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateAverageAttendance = (trainings: any[]) => {
    if (!trainings || trainings.length === 0) return { present: 0, total: 0 };
    
    let totalPercentage = 0;
    let validTrainings = 0;

    trainings.forEach(training => {
      const presentCount = training.registrations?.length || 0;
      const totalCount = training.total_players || 0;
      
      if (totalCount > 0) {
        totalPercentage += (presentCount / totalCount) * 100;
        validTrainings++;
      }
    });

    return {
      present: validTrainings > 0 ? Math.round(totalPercentage / validTrainings) : 0,
      total: 100
    };
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      // Get all sports first
      const { data: trainings, error: trainingsError } = await supabase
        .from("trainings")
        .select("type")
        .order("type");

      if (trainingsError) throw trainingsError;

      // Get unique sports
      const uniqueSports = Array.from(new Set(trainings.map(t => t.type)));
      console.log("Unique sports found:", uniqueSports);

      const statsPromises = uniqueSports.map(async (sport) => {
        // Monthly stats
        const { data: monthlyTrainings } = await supabase
          .from("trainings")
          .select(`
            id,
            date,
            registrations (
              id
            )
          `)
          .eq("type", sport)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        // Yearly stats
        const { data: yearlyTrainings } = await supabase
          .from("trainings")
          .select(`
            id,
            date,
            registrations (
              id
            )
          `)
          .eq("type", sport)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());

        // Calculate best month
        const monthlyStats = new Map();
        yearlyTrainings?.forEach(training => {
          const monthKey = format(new Date(training.date), 'MMMM yyyy', { locale: fr });
          if (!monthlyStats.has(monthKey)) {
            monthlyStats.set(monthKey, { trainings: [], totalPresent: 0, totalPlayers: 0 });
          }
          const monthData = monthlyStats.get(monthKey);
          monthData.trainings.push(training);
          monthData.totalPresent += training.registrations?.length || 0;
          monthData.totalPlayers += 15; // Assuming average of 15 players per training
        });

        let bestMonth = { month: '', percentage: 0 };
        monthlyStats.forEach((data, month) => {
          const percentage = (data.totalPresent / data.totalPlayers) * 100;
          if (percentage > bestMonth.percentage) {
            bestMonth = { month, percentage: Math.round(percentage) };
          }
        });

        const monthlyAverage = calculateAverageAttendance(monthlyTrainings);
        const yearlyAverage = calculateAverageAttendance(yearlyTrainings);

        console.log(`Stats for ${sport}:`, {
          monthly: monthlyAverage,
          yearly: yearlyAverage,
          bestMonth
        });

        return {
          sport,
          monthlyStats: monthlyAverage,
          yearlyStats: yearlyAverage,
          bestMonth
        };
      });

      const stats = await Promise.all(statsPromises);
      setSportsStats(stats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to changes in registrations and trainings
    const registrationsChannel = supabase
      .channel('admin-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          console.log('Registration change detected, refreshing stats');
          fetchStats();
        }
      )
      .subscribe();

    const trainingsChannel = supabase
      .channel('admin-trainings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainings'
        },
        () => {
          console.log('Training change detected, refreshing stats');
          fetchStats();
        }
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
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {sportsStats.map((sportStat) => (
        <div 
          key={sportStat.sport}
          className="bg-gray-800 p-6 rounded-lg space-y-6"
          role="region"
          aria-label={`Statistiques de présence pour ${sportStat.sport}`}
        >
          <h2 className="text-xl font-semibold text-white capitalize">
            {sportStat.sport}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="bg-gray-700 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques des entraînements de ${sportStat.sport} pour ${format(new Date(), 'MMMM yyyy', { locale: fr })}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Moyenne de présence du mois
              </h3>
              <MonthlyTrainingChart 
                currentMonthStats={sportStat.monthlyStats} 
                sport={sportStat.sport} 
              />
              <div className="sr-only">
                La moyenne de présence pour ce mois est de {sportStat.monthlyStats.present}%
              </div>
            </div>

            <div 
              className="bg-gray-700 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques annuelles des entraînements de ${sportStat.sport} pour ${new Date().getFullYear()}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Moyenne de présence de l'année
              </h3>
              <MonthlyTrainingChart 
                currentMonthStats={sportStat.yearlyStats} 
                sport={sportStat.sport}
              />
              <div className="sr-only">
                La moyenne de présence pour cette année est de {sportStat.yearlyStats.present}%
              </div>
            </div>

            <div 
              className="bg-gray-700 p-6 rounded-lg"
              role="region"
              aria-label={`Meilleur mois de présence pour ${sportStat.sport}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Meilleur mois de présence
              </h3>
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-2xl font-bold text-primary mb-2">
                  {sportStat.bestMonth.month}
                </p>
                <p className="text-xl text-white">
                  {sportStat.bestMonth.percentage}% de présence
                </p>
              </div>
              <div className="sr-only">
                Le meilleur taux de présence a été atteint en {sportStat.bestMonth.month} 
                avec {sportStat.bestMonth.percentage}% de présence
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}