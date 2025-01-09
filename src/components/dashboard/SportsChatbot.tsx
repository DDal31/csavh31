import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

interface SportsChatbotProps {
  sport: string;
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
  const { toast } = useToast();

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
          .eq("type", sport.toLowerCase())
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
        const { data, error } = await supabase.functions.invoke('chat-with-coach', {
          body: { message: statsMessage, sport }
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

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-coach', {
        body: { message, sport }
      });

      if (error) throw error;
      setResponse(data.response);
      setMessage("");
    } catch (error) {
      console.error('Error calling chat function:', error);
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
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white">
          Coach Virtuel {sport}
        </h3>
      </div>
      
      <div className="space-y-4 min-h-[200px] mb-6">
        {response && (
          <div 
            className="bg-gray-700/50 p-4 rounded-lg text-white animate-fade-in"
            role="log" 
            aria-label="Réponse du coach"
          >
            {response}
          </div>
        )}
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

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-grow bg-gray-700/50 border-gray-600 focus:border-primary text-white placeholder:text-gray-400"
          aria-label="Votre question au coach virtuel"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          aria-label="Envoyer la question"
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}