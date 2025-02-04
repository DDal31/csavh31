import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { ChatHeader } from "./chatbot/ChatHeader";
import { ChatMessage } from "./chatbot/ChatMessage";
import { ChatInput } from "./chatbot/ChatInput";
import { TypingAnimation } from "./chatbot/TypingAnimation";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface SportStats {
  sport: TrainingType;
  currentMonthStats: {
    present: number;
    total: number;
  };
  yearlyStats: {
    present: number;
    total: number;
  };
}

interface SportsChatbotProps {
  sports: SportStats[];
}

export function SportsChatbot({ sports }: SportsChatbotProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousMonthStats, setPreviousMonthStats] = useState<Record<TrainingType, { present: number; total: number }>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreviousMonthStats = async () => {
      try {
        const now = new Date();
        const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
        const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

        const statsPromises = sports.map(async ({ sport }) => {
          const { data: previousMonthData, error } = await supabase
            .from("trainings")
            .select(`
              *,
              registrations (
                id
              )
            `)
            .eq("type", sport)
            .gte("date", startOfPreviousMonth.toISOString())
            .lte("date", endOfPreviousMonth.toISOString());

          if (error) throw error;

          const previousPresentCount = previousMonthData?.filter(t => t.registrations?.length > 0).length || 0;
          const previousTotalCount = previousMonthData?.length || 0;

          return {
            sport,
            stats: {
              present: previousPresentCount,
              total: previousTotalCount
            }
          };
        });

        const allStats = await Promise.all(statsPromises);
        const statsMap = allStats.reduce((acc, { sport, stats }) => {
          acc[sport] = stats;
          return acc;
        }, {} as Record<TrainingType, { present: number; total: number }>);

        setPreviousMonthStats(statsMap);
      } catch (error) {
        console.error("Error fetching previous month stats:", error);
      }
    };

    fetchPreviousMonthStats();
  }, [sports]);

  useEffect(() => {
    const sendInitialStats = async () => {
      if (sports.every(s => s.currentMonthStats.total === 0)) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        // Fetch upcoming trainings for all user's sports
        const trainingPromises = sports.map(async ({ sport }) => {
          const { data: upcomingTrainings, error: trainingsError } = await supabase
            .from("trainings")
            .select(`
              *,
              registrations (
                id,
                user_id
              )
            `)
            .eq("type", sport)
            .gte("date", new Date().toISOString())
            .order("date", { ascending: true });

          if (trainingsError) throw trainingsError;
          return { sport, trainings: upcomingTrainings };
        });

        const allTrainingsData = await Promise.all(trainingPromises);

        let statsMessage = "Voici vos statistiques pour tous vos sports :\n\n";

        sports.forEach(({ sport, currentMonthStats, yearlyStats }) => {
          const currentPercentage = (currentMonthStats.present / currentMonthStats.total) * 100;
          const yearlyPercentage = (yearlyStats.present / yearlyStats.total) * 100;
          const previousPercentage = previousMonthStats[sport]?.total > 0 
            ? (previousMonthStats[sport].present / previousMonthStats[sport].total) * 100 
            : 0;
          const percentageDifference = currentPercentage - previousPercentage;

          statsMessage += `${sport.toUpperCase()}:\n`;
          statsMessage += `- Ce mois-ci: ${currentMonthStats.present}/${currentMonthStats.total} présences (${currentPercentage.toFixed(1)}%)\n`;
          statsMessage += `- Sur l'année: ${yearlyStats.present}/${yearlyStats.total} présences (${yearlyPercentage.toFixed(1)}%)\n`;
          statsMessage += `- Évolution: ${percentageDifference > 0 ? '+' : ''}${percentageDifference.toFixed(1)}% par rapport au mois dernier\n\n`;
        });

        // Add information about trainings needing players
        statsMessage += "\nEntraînements ayant besoin de joueurs où vous n'êtes pas encore inscrit :\n";
        allTrainingsData.forEach(({ sport, trainings }) => {
          const trainingsNeedingPlayers = trainings
            ?.filter(training => {
              const registeredCount = training.registrations?.length || 0;
              const userIsRegistered = training.registrations?.some(reg => reg.user_id === session.user.id);
              return registeredCount < 6 && !userIsRegistered;
            })
            .slice(0, 3);

          if (trainingsNeedingPlayers && trainingsNeedingPlayers.length > 0) {
            statsMessage += `\n${sport.toUpperCase()}:\n`;
            trainingsNeedingPlayers.forEach(training => {
              const registeredCount = training.registrations?.length || 0;
              statsMessage += `- ${training.date} (${registeredCount}/6 joueurs inscrits)\n`;
            });
          }
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const isVisuallyImpaired = profile?.club_role === "joueur";

        const { data, error } = await supabase.functions.invoke('chat-with-coach', {
          body: { 
            message: statsMessage, 
            sports: sports.map(s => s.sport),
            isVisuallyImpaired,
            userId: session.user.id
          }
        });

        if (error) throw error;
        setResponse(data.response);
      } catch (error) {
        console.error('Error sending initial stats:', error);
        toast({
          title: "Erreur",
          description: "Impossible de communiquer avec le coach virtuel pour le moment.",
          variant: "destructive"
        });
      }
    };

    sendInitialStats();
  }, [sports, previousMonthStats, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse(""); // Reset response when sending new message
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const isVisuallyImpaired = profile?.club_role === "joueur";

      const { data, error } = await supabase.functions.invoke('chat-with-coach', {
        body: { 
          message, 
          sports: sports.map(s => s.sport),
          isVisuallyImpaired,
          userId: session.user.id
        }
      });

      if (error) throw error;
      
      setResponse(data.response);
      setMessage("");
    } catch (error) {
      console.error('Error in chat interaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec le coach virtuel pour le moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sportsNames = sports.map(s => s.sport).join(" & ");

  return (
    <div className="p-6 h-full" role="complementary" aria-label="Coach virtuel">
      <ChatHeader sports={sportsNames} />
      
      <div className="space-y-4 min-h-[200px] mb-6">
        {response && <ChatMessage message={response} />}
        {!response && !isLoading && (
          <p className="text-gray-400 text-center py-8">
            Posez une question à votre coach virtuel !
          </p>
        )}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <TypingAnimation />
          </div>
        )}
      </div>

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}