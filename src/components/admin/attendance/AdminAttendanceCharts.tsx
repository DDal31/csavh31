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
}

export function AdminAttendanceCharts() {
  const [sportsStats, setSportsStats] = useState<SportStats[]>([]);
  const [loading, setLoading] = useState(true);

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
        const { data: monthlyRegistrations } = await supabase
          .from("trainings")
          .select(`
            id,
            registrations (
              id
            )
          `)
          .eq("type", sport)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        const { count: monthlyTotal } = await supabase
          .from("trainings")
          .select("id", { count: "exact" })
          .eq("type", sport)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        // Yearly stats
        const { data: yearlyRegistrations } = await supabase
          .from("trainings")
          .select(`
            id,
            registrations (
              id
            )
          `)
          .eq("type", sport)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());

        const { count: yearlyTotal } = await supabase
          .from("trainings")
          .select("id", { count: "exact" })
          .eq("type", sport)
          .gte("date", startOfCurrentYear.toISOString())
          .lte("date", endOfCurrentYear.toISOString());

        const monthlyPresent = monthlyRegistrations?.reduce((sum, training) => 
          sum + (training.registrations?.length || 0), 0) || 0;

        const yearlyPresent = yearlyRegistrations?.reduce((sum, training) => 
          sum + (training.registrations?.length || 0), 0) || 0;

        console.log(`Stats for ${sport}:`, {
          monthly: { present: monthlyPresent, total: monthlyTotal },
          yearly: { present: yearlyPresent, total: yearlyTotal }
        });

        return {
          sport,
          monthlyStats: {
            present: monthlyPresent,
            total: monthlyTotal || 0
          },
          yearlyStats: {
            present: yearlyPresent,
            total: yearlyTotal || 0
          }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-gray-700 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques des entraînements de ${sportStat.sport} pour ${format(new Date(), 'MMMM yyyy', { locale: fr })}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Entraînements du mois en cours
              </h3>
              <MonthlyTrainingChart 
                currentMonthStats={sportStat.monthlyStats} 
                sport={sportStat.sport} 
              />
              <div className="sr-only">
                Sur {sportStat.monthlyStats.total} entraînements programmés, 
                il y a eu {sportStat.monthlyStats.present} présences
              </div>
            </div>

            <div 
              className="bg-gray-700 p-6 rounded-lg"
              role="region"
              aria-label={`Statistiques annuelles des entraînements de ${sportStat.sport} pour ${new Date().getFullYear()}`}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Entraînements de l'année en cours
              </h3>
              <MonthlyTrainingChart 
                currentMonthStats={sportStat.yearlyStats} 
                sport={sportStat.sport}
              />
              <div className="sr-only">
                Sur {sportStat.yearlyStats.total} entraînements programmés cette année, 
                il y a eu {sportStat.yearlyStats.present} présences
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}