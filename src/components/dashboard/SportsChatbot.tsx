import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, subMonths, endOfMonth, startOfDay, endOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";
import { ChatHeader } from "./chatbot/ChatHeader";
import { ChatMessage } from "./chatbot/ChatMessage";
import { ChatInput } from "./chatbot/ChatInput";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface SportsChatbotProps {
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

export function SportsChatbot({ sport, currentMonthStats, yearlyStats }: SportsChatbotProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousMonthStats, setPreviousMonthStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [messageCount, setMessageCount] = useState(0);
  const { toast } = useToast();

  const DAILY_MESSAGE_LIMIT = 5;

  useEffect(() => {
    const fetchMessageCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("user_id", session.user.id)
        .gte("created_at", startOfDay(new Date()).toISOString())
        .lte("created_at", endOfDay(new Date()).toISOString())
        .eq("status", "active");

      if (error) {
        console.error("Error fetching message count:", error);
        return;
      }

      setMessageCount(data?.length || 0);
    };

    fetchMessageCount();
  }, []);

  useEffect(() => {
    const fetchPreviousMonthStats = async () => {
      try {
        const now = new Date();
        const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
        const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

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

        setPreviousMonthStats({
          present: previousPresentCount,
          total: previousTotalCount
        });
      } catch (error) {
        console.error("Error fetching previous month stats:", error);
      }
    };

    fetchPreviousMonthStats();
  }, [sport]);

  useEffect(() => {
    const sendInitialStats = async () => {
      if (currentMonthStats.total === 0) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        // Fetch upcoming trainings that need players
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

        // Filter trainings that need players and where user is not registered
        const trainingsNeedingPlayers = upcomingTrainings
          ?.filter(training => {
            const registeredCount = training.registrations?.length || 0;
            const userIsRegistered = training.registrations?.some(reg => reg.user_id === session.user.id);
            return registeredCount < 6 && !userIsRegistered;
          })
          .slice(0, 3); // Limit to next 3 trainings needing players

        const currentPercentage = (currentMonthStats.present / currentMonthStats.total) * 100;
        const yearlyPercentage = (yearlyStats.present / yearlyStats.total) * 100;
        const previousPercentage = previousMonthStats.total > 0 
          ? (previousMonthStats.present / previousMonthStats.total) * 100 
          : 0;
        const percentageDifference = currentPercentage - previousPercentage;

        let statsMessage = `Pour ce mois-ci, il y a eu ${currentMonthStats.present} présences sur ${currentMonthStats.total} entraînements (${currentPercentage.toFixed(1)}%). Sur l'année, il y a ${yearlyStats.present} présences sur ${yearlyStats.total} entraînements (${yearlyPercentage.toFixed(1)}%). Par rapport au mois dernier, ${percentageDifference > 0 ? 'augmentation' : 'diminution'} de ${Math.abs(percentageDifference).toFixed(1)}% du taux de présence.`;

        // Add information about trainings needing players
        if (trainingsNeedingPlayers && trainingsNeedingPlayers.length > 0) {
          statsMessage += "\n\nEntraînements ayant besoin de joueurs où tu n'es pas encore inscrit :";
          trainingsNeedingPlayers.forEach(training => {
            const registeredCount = training.registrations?.length || 0;
            statsMessage += `\n- ${training.date} (${registeredCount}/6 joueurs inscrits)`;
          });
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const isVisuallyImpaired = profile?.club_role === "joueur";

        const { data, error } = await supabase.functions.invoke('chat-with-coach', {
          body: { 
            message: statsMessage, 
            sport,
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
  }, [currentMonthStats, yearlyStats, previousMonthStats, sport, toast]);

  const handleTrainingRegistration = async (trainingDate: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;

      // Find the training by date
      const { data: trainings, error: trainingsError } = await supabase
        .from("trainings")
        .select("*")
        .eq("type", sport)
        .eq("date", trainingDate)
        .single();

      if (trainingsError || !trainings) {
        console.error("Error finding training:", trainingsError);
        return null;
      }

      // Check if user is already registered
      const { data: existingReg } = await supabase
        .from("registrations")
        .select("id")
        .eq("training_id", trainings.id)
        .eq("user_id", session.user.id)
        .single();

      if (existingReg) {
        return "Tu es déjà inscrit à cet entraînement !";
      }

      // Register the user
      const { error: registrationError } = await supabase
        .from("registrations")
        .insert({
          training_id: trainings.id,
          user_id: session.user.id
        });

      if (registrationError) throw registrationError;

      return "Super ! Je t'ai inscrit à l'entraînement du " + format(new Date(trainingDate), "dd/MM/yyyy", { locale: fr }) + ". À bientôt !";
    } catch (error) {
      console.error("Error registering for training:", error);
      return "Désolé, je n'ai pas pu t'inscrire à l'entraînement. Essaie via la page des entraînements ou contacte un administrateur.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (messageCount >= DAILY_MESSAGE_LIMIT) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de 5 messages par jour. Revenez demain !",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Check if message contains a date and mentions wanting to participate
      const dateMatch = message.match(/(\d{1,2})[/-](\d{1,2})[/-]?(\d{4})?/);
      const wantsToParticipate = message.toLowerCase().includes("venir") || 
                                message.toLowerCase().includes("participer") ||
                                message.toLowerCase().includes("m'inscrire");

      let registrationResponse = null;
      if (dateMatch && wantsToParticipate) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3] || new Date().getFullYear();
        const formattedDate = `${year}-${month}-${day}`;
        
        registrationResponse = await handleTrainingRegistration(formattedDate);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const isVisuallyImpaired = profile?.club_role === "joueur";

      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          message: message.trim(),
          sport,
          user_id: session.user.id,
          status: 'active'
        });

      if (insertError) throw insertError;

      if (registrationResponse) {
        setResponse(registrationResponse);
      } else {
        const { data, error } = await supabase.functions.invoke('chat-with-coach', {
          body: { 
            message, 
            sport,
            isVisuallyImpaired,
            userId: session.user.id
          }
        });

        if (error) throw error;
        setResponse(data.response);
      }
      
      setMessage("");
      setMessageCount(prev => prev + 1);
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

  return (
    <div className="p-6 h-full" role="complementary" aria-label="Coach virtuel">
      <ChatHeader 
        sport={sport} 
        messageCount={messageCount} 
        maxMessages={DAILY_MESSAGE_LIMIT} 
      />
      
      <div className="space-y-4 min-h-[200px] mb-6">
        {response && <ChatMessage message={response} />}
        {!response && !isLoading && (
          <p className="text-gray-400 text-center py-8">
            Posez une question à votre coach virtuel !
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        messageCount={messageCount}
        maxMessages={DAILY_MESSAGE_LIMIT}
      />
    </div>
  );
};
