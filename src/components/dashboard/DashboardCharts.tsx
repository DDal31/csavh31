import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { MonthlyTrainingChart } from "./charts/MonthlyTrainingChart";
import { SportsChatbot } from "./SportsChatbot";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

export function DashboardCharts({ sport }: { sport: TrainingType }) {
  const [currentMonthStats, setCurrentMonthStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [yearlyStats, setYearlyStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("No user session found");
        setLoading(false);
        return;
      }

      console.log("Fetching stats for sport:", sport, "and user:", session.user.id);
      const normalizedSport = sport.toLowerCase() as TrainingType;
      
      if (!isValidTrainingType(normalizedSport)) {
        console.error("Invalid sport type:", sport);
        setLoading(false);
        return;
      }

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      // Fetch current month stats with proper join and user filter
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from("trainings")
        .select(`
          id,
          date,
          registrations!inner (
            id,
            training_id,
            user_id
          )
        `)
        .eq("type", normalizedSport)
        .eq("registrations.user_id", session.user.id)
        .gte("date", startOfCurrentMonth.toISOString())
        .lte("date", endOfCurrentMonth.toISOString());

      if (currentMonthError) throw currentMonthError;

      // Fetch yearly stats with proper join and user filter
      const { data: yearData, error: yearError } = await supabase
        .from("trainings")
        .select(`
          id,
          date,
          registrations!inner (
            id,
            training_id,
            user_id
          )
        `)
        .eq("type", normalizedSport)
        .eq("registrations.user_id", session.user.id)
        .gte("date", startOfCurrentYear.toISOString())
        .lte("date", endOfCurrentYear.toISOString());

      if (yearError) throw yearError;

      console.log("Raw current month data:", currentMonthData);
      console.log("Raw year data:", yearData);

      // Get total counts for the month
      const { data: totalMonthData, error: totalMonthError } = await supabase
        .from("trainings")
        .select("id")
        .eq("type", normalizedSport)
        .gte("date", startOfCurrentMonth.toISOString())
        .lte("date", endOfCurrentMonth.toISOString());

      if (totalMonthError) throw totalMonthError;

      // Get total counts for the year
      const { data: totalYearData, error: totalYearError } = await supabase
        .from("trainings")
        .select("id")
        .eq("type", normalizedSport)
        .gte("date", startOfCurrentYear.toISOString())
        .lte("date", endOfCurrentYear.toISOString());

      if (totalYearError) throw totalYearError;

      const monthPresentCount = currentMonthData?.length || 0;
      const monthTotalCount = totalMonthData?.length || 0;
      const yearPresentCount = yearData?.length || 0;
      const yearTotalCount = totalYearData?.length || 0;

      console.log("Monthly stats - Present:", monthPresentCount, "Total:", monthTotalCount);
      console.log("Yearly stats - Present:", yearPresentCount, "Total:", yearTotalCount);

      setCurrentMonthStats({
        present: monthPresentCount,
        total: monthTotalCount
      });

      setYearlyStats({
        present: yearPresentCount,
        total: yearTotalCount
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to ALL changes in registrations
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Registration change detected:', payload);
          fetchStats();
        }
      )
      .subscribe();

    // Also subscribe to changes in trainings table
    const trainingsChannel = supabase
      .channel('trainings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainings'
        },
        (payload) => {
          console.log('Training change detected:', payload);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(trainingsChannel);
    };
  }, [sport]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-gray-800 p-6 rounded-lg"
          role="region"
          aria-label={`Statistiques des entraînements de ${sport} pour ${format(new Date(), 'MMMM yyyy', { locale: fr })}`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Entraînements du mois en cours
          </h3>
          <MonthlyTrainingChart currentMonthStats={currentMonthStats} sport={sport} />
          <div className="sr-only">
            Sur {currentMonthStats.total} entraînements programmés, 
            il y a eu des présences à {currentMonthStats.present} entraînements
          </div>
        </div>

        <div 
          className="bg-gray-800 p-6 rounded-lg"
          role="region"
          aria-label={`Statistiques annuelles des entraînements de ${sport} pour ${new Date().getFullYear()}`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Entraînements de l'année en cours
          </h3>
          <MonthlyTrainingChart currentMonthStats={yearlyStats} sport={sport} />
          <div className="sr-only">
            Sur {yearlyStats.total} entraînements programmés cette année, 
            il y a eu des présences à {yearlyStats.present} entraînements
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <SportsChatbot 
            sport={sport} 
            currentMonthStats={currentMonthStats}
            yearlyStats={yearlyStats}
          />
        </div>
      </div>
    </div>
  );
}