import { useState } from "react";
import { Loader2, FileText, Copy, Check, Eye, Volume2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIReportDisplayProps {
  report: string;
  isGenerating: boolean;
  title?: string;
}

export function AIReportDisplay({ 
  report, 
  isGenerating, 
  title = "Bilan des présences - Analyse IA" 
}: AIReportDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast({
        title: "Copié !",
        description: "Le rapport a été copié dans le presse-papiers",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le rapport",
        variant: "destructive",
      });
    }
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(report);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsReading(true);
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      toast({
        title: "Non supporté",
        description: "La synthèse vocale n'est pas supportée par votre navigateur",
        variant: "destructive",
      });
    }
  };

  // Formatage du rapport avec structure sémantique
  const formatReport = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      if (section.trim().startsWith('##') || section.trim().startsWith('#')) {
        const headerText = section.replace(/^#+\s*/, '');
        return (
          <h3 
            key={index}
            className="text-lg font-semibold text-card-foreground mt-6 mb-3 first:mt-0"
            id={`section-${index}`}
          >
            {headerText}
          </h3>
        );
      } else if (section.trim().startsWith('- ') || section.trim().match(/^\d+\./)) {
        const items = section.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4" role="list">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                {item.replace(/^[-\d.]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      } else if (section.trim()) {
        return (
          <p key={index} className="text-card-foreground leading-relaxed mb-4">
            {section.trim()}
          </p>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-card-foreground">
                {title}
              </CardTitle>
              {isGenerating && (
                <p className="text-sm text-muted-foreground mt-1">
                  Analyse en cours avec Gemini 2.5 Flash...
                </p>
              )}
            </div>
          </div>
          
          {!isGenerating && report && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTextToSpeech}
                className="flex items-center gap-2"
                aria-label={isReading ? "Arrêter la lecture" : "Lire le rapport"}
              >
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isReading ? "Arrêter" : "Écouter"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
                aria-label="Copier le rapport"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Copier</span>
              </Button>
            </div>
          )}
        </div>
        
        {isGenerating && (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Génération en cours...</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
            </div>
            <div className="text-center max-w-md">
              <p className="text-base text-card-foreground font-medium mb-2">
                Génération du bilan en cours...
              </p>
              <p className="text-sm text-muted-foreground">
                Notre IA analyse vos données d'assiduité pour créer un rapport détaillé
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-none">
            {report ? (
              <article 
                className="space-y-4"
                role="article"
                aria-labelledby="report-title"
                tabIndex={0}
              >
                <div id="report-content" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded-lg p-4 -m-4">
                  {formatReport(report)}
                </div>
              </article>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-muted-foreground">
                  Aucun bilan disponible. Vérifiez que des données d'entraînement existent.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}