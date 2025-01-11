import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface AdminChatbotProps {
  sportStats: Record<TrainingType, {
    currentMonth: { present: number; total: number };
    yearlyStats: { present: number; total: number };
    bestMonth: { month: string; percentage: number };
  }>;
}

export function AdminChatbot({ sportStats }: AdminChatbotProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const { toast } = useToast();

  const DAILY_MESSAGE_LIMIT = 10;

  const getInitialAnalysis = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const statsMessage = Object.entries(sportStats).map(([sport, stats]) => {
        const currentMonthPercentage = (stats.currentMonth.present / stats.currentMonth.total) * 100;
        const yearlyPercentage = (stats.yearlyStats.present / stats.yearlyStats.total) * 100;
        return `${sport}: ${currentMonthPercentage.toFixed(1)}% ce mois-ci, ${yearlyPercentage.toFixed(1)}% sur l'année. Meilleur mois: ${stats.bestMonth.month} avec ${stats.bestMonth.percentage}%`;
      }).join('\n');

      console.log('Requesting initial analysis with stats:', statsMessage);

      const { data, error } = await supabase.functions.invoke('chat-with-coach', {
        body: { 
          message: "Analyse les statistiques de présence et donne-moi un résumé de la situation actuelle avec des suggestions d'amélioration si nécessaire.",
          statsContext: statsMessage,
          isAdmin: true,
          userId: session.user.id
        }
      });

      if (error) throw error;
      
      setResponse(data.response);
      setMessageCount(1);
    } catch (error) {
      console.error('Error getting initial analysis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'analyse initiale pour le moment.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (Object.keys(sportStats).length > 0) {
      getInitialAnalysis();
    }
  }, [sportStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (messageCount >= DAILY_MESSAGE_LIMIT) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de 10 messages par jour. Revenez demain !",
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

      const statsMessage = Object.entries(sportStats).map(([sport, stats]) => {
        const currentMonthPercentage = (stats.currentMonth.present / stats.currentMonth.total) * 100;
        const yearlyPercentage = (stats.yearlyStats.present / stats.yearlyStats.total) * 100;
        return `${sport}: ${currentMonthPercentage.toFixed(1)}% ce mois-ci, ${yearlyPercentage.toFixed(1)}% sur l'année. Meilleur mois: ${stats.bestMonth.month} avec ${stats.bestMonth.percentage}%`;
      }).join('\n');

      const { data, error } = await supabase.functions.invoke('chat-with-coach', {
        body: { 
          message,
          statsContext: statsMessage,
          isAdmin: true,
          userId: session.user.id
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
    <div className="bg-gray-800 p-6 rounded-lg space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-white">
          Assistant Administrateur
        </h3>
        <span className="text-sm text-gray-400 ml-auto">
          {messageCount}/{DAILY_MESSAGE_LIMIT} messages aujourd'hui
        </span>
      </div>
      
      <div className="space-y-4 min-h-[200px] mb-6">
        {response && (
          <div 
            className="bg-gray-700/50 p-4 rounded-lg text-white"
            role="log" 
            aria-label="Réponse de l'assistant"
          >
            {response}
          </div>
        )}
        {!response && !isLoading && (
          <p className="text-gray-400 text-center py-8">
            Analyse des statistiques en cours...
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messageCount >= DAILY_MESSAGE_LIMIT ? "Limite de messages atteinte pour aujourd'hui" : "Posez votre question..."}
          className="flex-grow bg-gray-700/50 border border-gray-600 focus:border-primary text-white placeholder:text-gray-400 px-4 py-2 rounded-lg"
          aria-label="Votre question à l'assistant administrateur"
          disabled={isLoading || messageCount >= DAILY_MESSAGE_LIMIT}
        />
        <button 
          type="submit" 
          disabled={isLoading || !message.trim() || messageCount >= DAILY_MESSAGE_LIMIT}
          aria-label="Envoyer la question"
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Envoyer"
          )}
        </button>
      </form>
    </div>
  );
}