import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, subMonths, endOfMonth, startOfDay, endOfDay } from "date-fns";
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

      const currentPercentage = (currentMonthStats.present / currentMonthStats.total) * 100;
      const yearlyPercentage = (yearlyStats.present / yearlyStats.total) * 100;
      const previousPercentage = previousMonthStats.total > 0 
        ? (previousMonthStats.present / previousMonthStats.total) * 100 
        : 0;
      const percentageDifference = currentPercentage - previousPercentage;

      const statsMessage = `Pour ce mois-ci, il y a eu ${currentMonthStats.present} présences sur ${currentMonthStats.total} entraînements (${currentPercentage.toFixed(1)}%). Sur l'année, il y a ${yearlyStats.present} présences sur ${yearlyStats.total} entraînements (${yearlyPercentage.toFixed(1)}%). Par rapport au mois dernier, ${percentageDifference > 0 ? 'augmentation' : 'diminution'} de ${Math.abs(percentageDifference).toFixed(1)}% du taux de présence.`;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session?.user?.id)
          .single();

        const isVisuallyImpaired = profile?.club_role === "joueur";

        const { data, error } = await supabase.functions.invoke('chat-with-coach', {
          body: { 
            message: statsMessage, 
            sport,
            isVisuallyImpaired 
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

      const { data, error } = await supabase.functions.invoke('chat-with-coach', {
        body: { 
          message, 
          sport,
          isVisuallyImpaired 
        }
      });

      if (error) throw error;
      
      setResponse(data.response);
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
}