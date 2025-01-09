import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { MonthlyTrainingChart } from "./charts/MonthlyTrainingChart";

export function DashboardCharts({ sport }: { sport: string }) {
  const [currentMonthStats, setCurrentMonthStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching stats for sport:", sport);
        const normalizedSport = sport.toLowerCase();
        
        if (!isValidTrainingType(normalizedSport)) {
          console.error("Invalid sport type:", sport);
          setLoading(false);
          return;
        }

        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        // Fetch current month stats
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id
            )
          `)
          .eq("type", normalizedSport)
          .gte("date", startOfCurrentMonth.toISOString())
          .lte("date", endOfCurrentMonth.toISOString());

        if (currentMonthError) throw currentMonthError;

        const presentCount = currentMonthData?.filter(t => t.registrations?.length > 0).length || 0;
        const totalCount = currentMonthData?.length || 0;

        setCurrentMonthStats({
          present: presentCount,
          total: totalCount
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [sport]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
    </div>
  );
}