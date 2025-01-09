import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { Loader2 } from "lucide-react";

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
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Fetch current month stats
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id
            )
          `)
          .eq("type", sport.toLowerCase())
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
            .eq("type", sport.toLowerCase())
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

  const chartTheme = {
    fill: "#4169E1",
    stroke: "#4169E1"
  };

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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[{ 
                name: 'Entraînements', 
                present: currentMonthStats.present,
                total: currentMonthStats.total 
              }]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="total" 
                fill={chartTheme.fill} 
                name="Total programmé"
                role="graphics-symbol"
                aria-label="Nombre total d'entraînements programmés"
              />
              <Bar 
                dataKey="present" 
                fill="#82ca9d" 
                name="Présences"
                role="graphics-symbol"
                aria-label="Nombre d'entraînements avec présences"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
          Taux de présence sur l'année
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                tick={{ fill: '#fff' }}
                unit="%"
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de présence']}
              />
              <Line
                type="stepAfter"
                dataKey="percentage"
                stroke={chartTheme.stroke}
                name="Taux de présence"
                role="graphics-symbol"
                aria-label="Pourcentage de présence mensuel"
                dot={{ fill: chartTheme.fill }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">
          Évolution mensuelle du taux de présence:
          {yearlyStats.map(stat => (
            ` ${stat.month}: ${stat.percentage.toFixed(1)}%`
          ))}
        </div>
      </div>
    </div>
  );
}