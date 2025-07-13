
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, UserPlus, FileText } from "lucide-react";
import { isValidTrainingType } from "@/utils/trainingTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

type LowAttendanceTraining = {
  id: string;
  date: string;
  registered_players_count: number;
};

type MonthlyStats = {
  month: string;
  present: number;
  total: number;
  percentage: number;
};

export function DashboardCharts({ sport }: { sport: TrainingType }) {
  const [loading, setLoading] = useState(true);
  const [lowAttendanceTrainings, setLowAttendanceTrainings] = useState<LowAttendanceTraining[]>([]);
  const [report, setReport] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const navigate = useNavigate();

  const fetchStatsAndGenerateReport = async () => {
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

      // Calculate sports year: September of previous year to July of current year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-based (0 = January)
      
      // If we're between January and July, sports year started in September of previous year
      // If we're between August and December, sports year started in September of current year
      const sportsYearStart = currentMonth >= 7 ? // August = 7
        new Date(currentYear, 8, 1) : // September of current year
        new Date(currentYear - 1, 8, 1); // September of previous year
      
      const sportsYearEnd = currentMonth >= 7 ?
        new Date(currentYear + 1, 6, 31) : // July of next year
        new Date(currentYear, 6, 31); // July of current year

      console.log("Sports year range:", sportsYearStart.toISOString(), "to", sportsYearEnd.toISOString());

      // Get monthly stats for the entire sports year
      const monthlyStats: MonthlyStats[] = [];
      
      // Generate months from September to July
      const months = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]; // Sept to July (0-based)
      
      for (const monthIndex of months) {
        const year = monthIndex >= 8 ? sportsYearStart.getFullYear() : sportsYearEnd.getFullYear();
        const monthStart = startOfMonth(new Date(year, monthIndex, 1));
        const monthEnd = endOfMonth(new Date(year, monthIndex, 1));
        
        // Fetch user's attendance for this month
        const { data: attendanceData, error: attendanceError } = await supabase
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
          .gte("date", monthStart.toISOString())
          .lte("date", monthEnd.toISOString());

        if (attendanceError) throw attendanceError;

        // Get total trainings for this month
        const { data: totalData, error: totalError } = await supabase
          .from("trainings")
          .select("id")
          .eq("type", normalizedSport)
          .gte("date", monthStart.toISOString())
          .lte("date", monthEnd.toISOString());

        if (totalError) throw totalError;

        const presentCount = attendanceData?.length || 0;
        const totalCount = totalData?.length || 0;
        const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        monthlyStats.push({
          month: format(monthStart, 'MMMM yyyy', { locale: fr }),
          present: presentCount,
          total: totalCount,
          percentage
        });
      }

      console.log("Monthly stats:", monthlyStats);

      // Fetch trainings with low attendance
      const { data: lowAttendanceData, error: lowAttendanceError } = await supabase
        .from("trainings")
        .select(`
          id,
          date,
          registered_players_count,
          registrations (
            user_id
          )
        `)
        .eq("type", normalizedSport)
        .gte("date", now.toISOString())
        .lt("registered_players_count", 6)
        .not("registrations.user_id", "eq", session.user.id);

      if (lowAttendanceError) throw lowAttendanceError;

      setLowAttendanceTrainings(lowAttendanceData || []);

      // Generate AI report
      setGeneratingReport(true);
      console.log("Calling generate-attendance-report function...");
      
      const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-attendance-report', {
        body: {
          monthlyStats,
          sport: normalizedSport,
          sportsYear: `${sportsYearStart.getFullYear()}-${sportsYearEnd.getFullYear()}`
        }
      });

      console.log("Report response:", reportData, reportError);

      if (reportError) {
        console.error("Error generating report:", reportError);
        setReport("Erreur lors de la génération du rapport. Veuillez réessayer.");
      } else {
        setReport(reportData.report || "Aucun rapport généré");
      }

      setGeneratingReport(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setGeneratingReport(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndGenerateReport();

    // Subscribe to changes in registrations
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
          fetchStatsAndGenerateReport();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sport]);

  const handleRegistrationClick = () => {
    navigate("/training");
  };

  const formatTrainingMessage = (trainings: LowAttendanceTraining[]) => {
    if (trainings.length === 0) return null;

    if (trainings.length === 1) {
      const training = trainings[0];
      return `L'entraînement du ${format(new Date(training.date), 'dd MMMM yyyy', { locale: fr })} 
              n'a que ${training.registered_players_count} joueur${training.registered_players_count > 1 ? 's' : ''} inscrit${training.registered_players_count > 1 ? 's' : ''}. 
              Cliquez ici pour vous inscrire et permettre son maintien !`;
    }

    const nextTraining = trainings[0];
    return `${trainings.length} entraînements à venir manquent de joueurs, dont celui du 
            ${format(new Date(nextTraining.date), 'dd MMMM yyyy', { locale: fr })} 
            avec ${nextTraining.registered_players_count} joueur${nextTraining.registered_players_count > 1 ? 's' : ''} inscrit${nextTraining.registered_players_count > 1 ? 's' : ''}. 
            Cliquez ici pour vous inscrire et permettre leur maintien !`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto mb-36">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bilan de vos présences en {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatingReport ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-white">Génération du rapport en cours...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-gray-300 whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {lowAttendanceTrainings.length > 0 && (
        <Alert 
          className="bg-gray-800 border-primary text-white z-10 relative mb-10"
          role="alert"
          aria-live="polite"
        >
          <UserPlus className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <button
              onClick={handleRegistrationClick}
              className="text-left hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-800 w-full py-2"
            >
              {formatTrainingMessage(lowAttendanceTrainings)}
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
