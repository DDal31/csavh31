
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
    
    // Récupération de la clé API DeepSeek
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      console.error('ERREUR: Clé API DeepSeek manquante');
      throw new Error('Clé API DeepSeek non configurée');
    }
    
    console.log('Clé API trouvée, longueur:', deepSeekApiKey.length);
    
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

    console.log('Envoi de la requête à DeepSeek...');
    
    // Appel optimisé à l'API DeepSeek
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
            content: 'Tu es un consultant spécialisé dans la gestion de clubs sportifs adaptés (Goalball et Torball). Réponds de manière concise et structurée.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4, // Réduit pour plus de cohérence et vitesse
        max_tokens: 1200, // Réduit pour des réponses plus rapides
        top_p: 0.9, // Optimise la sélection des tokens
        frequency_penalty: 0.1, // Évite les répétitions
        stream: false // Pas de streaming pour simplifier
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
