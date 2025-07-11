
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
    console.log('=== DÉBUT GÉNÉRATION RAPPORT ===');
    
    const { monthlyStats, yearlyStats, bestMonthStats } = await req.json();
    console.log('Données reçues:', { monthlyStats, yearlyStats, bestMonthStats });
    
    // Récupération de la clé API DeepSeek
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      console.error('ERREUR: Clé API DeepSeek manquante');
      throw new Error('Clé API DeepSeek non configurée');
    }
    
    console.log('Clé API trouvée, longueur:', deepSeekApiKey.length);
    
    // Préparation du prompt pour DeepSeek
    const prompt = `
Analyse les statistiques de présence suivantes pour un club de sport adapté (Goalball et Torball) et génère un bilan professionnel :

DONNÉES DU MOIS EN COURS :
- Goalball : ${monthlyStats.goalball?.present || 0}% de présence
- Torball : ${monthlyStats.torball?.present || 0}% de présence

DONNÉES ANNUELLES :
- Goalball : ${yearlyStats.goalball?.present || 0}% de présence annuelle
- Torball : ${yearlyStats.torball?.present || 0}% de présence annuelle

MEILLEURS MOIS :
- Goalball : ${bestMonthStats.goalball?.percentage || 0}% en ${bestMonthStats.goalball?.month || 'N/A'}
- Torball : ${bestMonthStats.torball?.percentage || 0}% en ${bestMonthStats.torball?.month || 'N/A'}

Rédige un bilan de 4-5 paragraphes qui :
1. Compare les performances entre Goalball et Torball
2. Analyse les tendances mensuelles vs annuelles
3. Identifie les succès et les points d'amélioration
4. Propose des recommandations concrètes pour améliorer les taux de présence

Ton analyse doit être professionnelle, constructive et adaptée à un contexte associatif sportif.
`;

    console.log('Envoi de la requête à DeepSeek...');
    
    // Appel à l'API DeepSeek
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepSeekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse sportive et en gestion associative. Tu rédiges des bilans clairs et constructifs pour des clubs de sport adapté.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    console.log('Réponse DeepSeek reçue, statut:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API DeepSeek:', response.status, errorText);
      throw new Error(`Erreur DeepSeek (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données décodées avec succès');
    
    const generatedReport = data.choices?.[0]?.message?.content;
    
    if (!generatedReport) {
      console.error('Aucun contenu généré');
      throw new Error('Aucun rapport généré par DeepSeek');
    }

    console.log('Rapport généré avec succès, longueur:', generatedReport.length);
    console.log('=== FIN GÉNÉRATION RAPPORT ===');

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
