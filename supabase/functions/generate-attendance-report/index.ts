
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
    const { monthlyStats, yearlyStats, bestMonthStats } = await req.json();
    
    console.log('Données reçues:', { monthlyStats, yearlyStats, bestMonthStats });
    
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const prompt = `
Génère un bilan professionnel et détaillé des statistiques de présence pour un club de sport adapté (Goalball et Torball uniquement).

Données du mois en cours :
- Goalball: ${monthlyStats.goalball?.present || 0}% de présence moyenne
- Torball: ${monthlyStats.torball?.present || 0}% de présence moyenne

Données annuelles :
- Goalball: ${yearlyStats.goalball?.present || 0}% de présence moyenne annuelle
- Torball: ${yearlyStats.torball?.present || 0}% de présence moyenne annuelle

Meilleur mois de l'année :
- Goalball: ${bestMonthStats.goalball?.percentage || 0}% en ${bestMonthStats.goalball?.month || 'N/A'}
- Torball: ${bestMonthStats.torball?.percentage || 0}% en ${bestMonthStats.torball?.month || 'N/A'}

Rédige un bilan complet de 4-5 paragraphes qui :

1. **ANALYSE COMPARATIVE** : Compare les performances entre les deux sports (Goalball et Torball) en identifiant lequel performe le mieux et pourquoi.

2. **TENDANCES TEMPORELLES** : Analyse les différences entre les présences mensuelles actuelles et les moyennes annuelles pour identifier les tendances positives ou négatives.

3. **IDENTIFICATION DES SUCCÈS** : Met en avant les meilleurs mois et les sports qui excellent, en essayant d'identifier les facteurs de succès.

4. **AXES D'AMÉLIORATION** : Identifie clairement les sports ou périodes problématiques nécessitant une attention particulière.

5. **RECOMMANDATIONS CONCRÈTES** : Propose des actions spécifiques pour :
   - Améliorer le taux de présence des sports en difficulté
   - Motiver les joueurs démotivés
   - Maintenir l'engagement dans les sports performants
   - Optimiser la planification des entraînements

Le ton doit être professionnel mais accessible, adapté à un contexte associatif sportif. Utilise des données chiffrées pour appuyer tes analyses et sois constructif dans tes recommandations.
`;

    console.log('Envoi de la requête à DeepSeek...');

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
            content: 'Tu es un expert en analyse de données sportives et en gestion associative. Tu rédiges des bilans clairs, constructifs et professionnels pour des clubs de sport adapté. Tes analyses sont basées sur des données factuelles et tes recommandations sont pratiques et réalisables.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse DeepSeek reçue:', data);
    
    const generatedReport = data.choices?.[0]?.message?.content;
    
    if (!generatedReport) {
      throw new Error('Aucun contenu généré par DeepSeek');
    }

    return new Response(JSON.stringify({ report: generatedReport }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-attendance-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      report: `Erreur lors de la génération du rapport automatique: ${error.message}. Veuillez vérifier la configuration DeepSeek et réessayer.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
