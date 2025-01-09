import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { MonthlyTrainingChart } from "./charts/MonthlyTrainingChart";
import { YearlyAttendanceChart } from "./charts/YearlyAttendanceChart";
import { YearlyTrendChart } from "./charts/YearlyTrendChart";

interface MonthlyStats {
  month: string;
  attendance: number;
  total: number;
  percentage: number;
}

export function DashboardCharts({ sport }: { sport: string }) {
  const [currentMonthStats, setCurrentMonthStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [yearlyStats, setYearlyStats] = useState<MonthlyStats[]>([]);
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

        // Fetch yearly stats
        const monthlyStats: MonthlyStats[] = [];
        for (let i = 0; i < 12; i++) {
          const monthStart = startOfMonth(subMonths(now, i));
          const monthEnd = endOfMonth(subMonths(now, i));

          const { data: monthData, error: monthError } = await supabase
            .from("trainings")
            .select(`
              *,
              registrations (
                id
              )
            `)
            .eq("type", normalizedSport)
            .gte("date", monthStart.toISOString())
            .lte("date", monthEnd.toISOString());

          if (monthError) throw monthError;

          const monthPresent = monthData?.filter(t => t.registrations?.length > 0).length || 0;
          const monthTotal = monthData?.length || 0;

          monthlyStats.unshift({
            month: format(monthStart, "MMM", { locale: fr }),
            attendance: monthPresent,
            total: monthTotal,
            percentage: monthTotal > 0 ? (monthPresent / monthTotal) * 100 : 0
          });
        }

        setYearlyStats(monthlyStats);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          aria-label={`Évolution des présences aux entraînements de ${sport} sur l'année ${new Date().getFullYear()}`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Évolution annuelle
          </h3>
          <YearlyTrendChart yearlyStats={yearlyStats} />
        </div>

        <div 
          className="bg-gray-800 p-6 rounded-lg"
          role="region"
          aria-label={`Détail mensuel des présences aux entraînements de ${sport} sur l'année ${new Date().getFullYear()}`}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Détail mensuel
          </h3>
          <YearlyAttendanceChart yearlyStats={yearlyStats} />
        </div>
      </div>
    </div>
  );
}
