import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
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
    <div className="bg-gray-800 p-6 rounded-lg h-full flex flex-col" role="complementary" aria-label="Coach virtuel">
      <h3 className="text-lg font-semibold text-white mb-4">
        Coach Virtuel {sport}
      </h3>
      
      <div className="flex-grow mb-4 space-y-4">
        {response && (
          <div className="bg-gray-700 p-4 rounded-lg text-white" role="log" aria-label="Réponse du coach">
            {response}
          </div>
        )}
        {!response && !isLoading && (
          <p className="text-gray-400 text-center">
            Posez une question à votre coach virtuel !
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-grow"
          aria-label="Votre question au coach virtuel"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          aria-label="Envoyer la question"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}