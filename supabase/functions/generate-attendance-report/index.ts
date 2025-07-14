
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== DÉBUT GÉNÉRATION RAPPORT ADMIN ===');
    
    const { monthlyStats, yearlyStats, bestMonthStats } = await req.json();
    console.log('Données reçues:', { monthlyStats, yearlyStats, bestMonthStats });
    
    // Récupération de la clé API Google AI
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    
    if (!googleApiKey) {
      console.error('ERREUR: Clé API Google AI manquante');
      throw new Error('Clé API Google AI non configurée');
    }
    
    console.log('Clé API Google AI trouvée, longueur:', googleApiKey.length);
    
    // Variables pour le prompt
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    // Prompt optimisé pour l'administration
    const prompt = `
Analyse ces stats de participation club et rédige un bilan administratif concis en 3-4 paragraphes :

ACTUELLES (${currentMonth}) :
- Goalball : ${monthlyStats.goalball.present}%
- Torball : ${monthlyStats.torball.present}%

ANNUELLES (${currentYear}) :
- Goalball : ${yearlyStats.goalball.present}%  
- Torball : ${yearlyStats.torball.present}%

PICS : Goalball ${bestMonthStats.goalball.month || 'N/A'} (${bestMonthStats.goalball.percentage || 0}%) | Torball ${bestMonthStats.torball.month || 'N/A'} (${bestMonthStats.torball.percentage || 0}%)

STRUCTURE :
1. Vue d'ensemble et comparaison sports
2. Tendances et analyses
3. Recommandations concrètes

Style : Professionnel, factuel, actionnable. Maximum 700 mots.
`;

    console.log('Envoi de la requête optimisée à Gemini 2.5 Flash...');
    
    // Appel optimisé à l'API Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es un consultant spécialisé dans la gestion de clubs sportifs adaptés (Goalball et Torball). Réponds de manière concise et structurée.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1200,
        }
      }),
    });

    console.log('Réponse Gemini reçue, statut:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Gemini:', response.status, errorText);
      throw new Error(`Erreur Gemini (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données décodées avec succès');
    
    const generatedReport = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedReport) {
      console.error('Aucun contenu généré');
      throw new Error('Aucun rapport généré par Gemini');
    }

    console.log('Rapport généré avec succès, longueur:', generatedReport.length);
    console.log('=== FIN GÉNÉRATION RAPPORT ADMIN ===');

    return new Response(JSON.stringify({ report: generatedReport }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERREUR DANS LA FONCTION ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      report: `**Erreur lors de la génération du rapport**

Une erreur est survenue : ${error.message}

Veuillez vérifier :
- La configuration de la clé API DeepSeek
- La connexion internet
- Les logs de la fonction pour plus de détails`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
