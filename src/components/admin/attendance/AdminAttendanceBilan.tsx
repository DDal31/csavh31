
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface AttendanceStats {
  goalball: {
    currentMonth: { present: number; total: number };
    yearlyStats: { present: number; total: number };
    bestMonth: { month: string; percentage: number };
  };
  torball: {
    currentMonth: { present: number; total: number };
    yearlyStats: { present: number; total: number };
    bestMonth: { month: string; percentage: number };
  };
}

export function AdminAttendanceBilan() {
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({
    goalball: {
      currentMonth: { present: 0, total: 100 },
      yearlyStats: { present: 0, total: 100 },
      bestMonth: { month: "", percentage: 0 }
    },
    torball: {
      currentMonth: { present: 0, total: 100 },
      yearlyStats: { present: 0, total: 100 },
      bestMonth: { month: "", percentage: 0 }
    }
  });
  const [aiReport, setAiReport] = useState("");

  const calculateAttendanceStats = async () => {
    try {
      setLoading(true);
      console.log("Calcul des statistiques de présence...");

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfCurrentYear = startOfYear(now);
      const endOfCurrentYear = endOfYear(now);

      const sportTypes: TrainingType[] = ['goalball', 'torball'];
      const newStats = { ...stats };

      for (const sportType of sportTypes) {
        // Statistiques du mois en cours
        const { data: currentMonthTrainings } = await supabase
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

        if (currentMonthTrainings && currentMonthTrainings.length > 0) {
          let monthlyPercentagesSum = 0;
          currentMonthTrainings.forEach(training => {
            const presentPlayers = training.registered_players_count || 0;
            const totalPlayers = training.total_sport_players_count || 0;
            const trainingPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;
            monthlyPercentagesSum += trainingPercentage;
          });
          const monthlyAverage = monthlyPercentagesSum / currentMonthTrainings.length;
          newStats[sportType].currentMonth = {
            present: Math.round(monthlyAverage),
            total: 100
          };
        }

        // Statistiques annuelles
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
          let bestMonthData = { month: "", percentage: 0 };
          
          Object.entries(monthlyStats).forEach(([monthKey, data]) => {
            const monthlyAverage = data.sum / data.count;
            yearlyPercentagesSum += monthlyAverage;
            monthCount += 1;

            if (monthlyAverage > bestMonthData.percentage) {
              bestMonthData = {
                month: format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: fr }),
                percentage: Math.round(monthlyAverage)
              };
            }
          });

          if (monthCount > 0) {
            newStats[sportType].yearlyStats = {
              present: Math.round(yearlyPercentagesSum / monthCount),
              total: 100
            };
            newStats[sportType].bestMonth = bestMonthData;
          }
        }
      }

      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      setLoading(false);
    }
  };

  const generateAIReport = async () => {
    try {
      setGeneratingReport(true);
      
      const monthlyStats = {
        goalball: stats.goalball.currentMonth,
        torball: stats.torball.currentMonth
      };
      
      const yearlyStats = {
        goalball: stats.goalball.yearlyStats,
        torball: stats.torball.yearlyStats
      };
      
      const bestMonthStats = {
        goalball: stats.goalball.bestMonth,
        torball: stats.torball.bestMonth
      };

      const { data, error } = await supabase.functions.invoke('generate-attendance-report', {
        body: { monthlyStats, yearlyStats, bestMonthStats }
      });

      if (error) throw error;
      
      setAiReport(data.report);
    } catch (error) {
      console.error("Erreur lors de la génération du rapport IA:", error);
      setAiReport("Erreur lors de la génération du rapport automatique.");
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    calculateAttendanceStats();
  }, []);

  useEffect(() => {
    if (!loading && stats.goalball.currentMonth.present > 0) {
      generateAIReport();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Présences du mois en cours */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-sm font-medium text-white ml-2">
              Mois en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Sport</TableHead>
                  <TableHead className="text-gray-300">Présence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Goalball</TableCell>
                  <TableCell className="text-green-400 font-semibold">
                    {stats.goalball.currentMonth.present}%
                  </TableCell>
                </TableRow>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Torball</TableCell>
                  <TableCell className="text-green-400 font-semibold">
                    {stats.torball.currentMonth.present}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Présences annuelles */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm font-medium text-white ml-2">
              Année en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Sport</TableHead>
                  <TableHead className="text-gray-300">Présence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Goalball</TableCell>
                  <TableCell className="text-blue-400 font-semibold">
                    {stats.goalball.yearlyStats.present}%
                  </TableCell>
                </TableRow>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Torball</TableCell>
                  <TableCell className="text-blue-400 font-semibold">
                    {stats.torball.yearlyStats.present}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Meilleurs mois */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Award className="h-4 w-4 text-yellow-400" />
            <CardTitle className="text-sm font-medium text-white ml-2">
              Meilleurs mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Sport</TableHead>
                  <TableHead className="text-gray-300">Mois</TableHead>
                  <TableHead className="text-gray-300">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Goalball</TableCell>
                  <TableCell className="text-gray-300 text-xs">
                    {stats.goalball.bestMonth.month || 'N/A'}
                  </TableCell>
                  <TableCell className="text-yellow-400 font-semibold">
                    {stats.goalball.bestMonth.percentage}%
                  </TableCell>
                </TableRow>
                <TableRow className="border-gray-600">
                  <TableCell className="text-white">Torball</TableCell>
                  <TableCell className="text-gray-300 text-xs">
                    {stats.torball.bestMonth.month || 'N/A'}
                  </TableCell>
                  <TableCell className="text-yellow-400 font-semibold">
                    {stats.torball.bestMonth.percentage}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bilan IA */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <FileText className="h-5 w-5 text-green-400" />
          <CardTitle className="text-lg font-medium text-white ml-2">
            Bilan des présences
          </CardTitle>
          {generatingReport && (
            <Loader2 className="h-4 w-4 animate-spin text-green-400 ml-2" />
          )}
        </CardHeader>
        <CardContent>
          {generatingReport ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-400 mx-auto mb-2" />
                <p className="text-gray-300">Génération du bilan en cours...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {aiReport || "Aucun bilan disponible pour le moment."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
