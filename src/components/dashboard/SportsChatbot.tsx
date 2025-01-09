import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SportsChatbotProps {
  sport: string;
}

export function SportsChatbot({ sport }: SportsChatbotProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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