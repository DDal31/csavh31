
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
    
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const prompt = `
Génère un bilan professionnel et détaillé des statistiques de présence pour un club de sport adapté (Goalball et Torball).

Données du mois en cours :
- Goalball: ${monthlyStats.goalball?.present || 0}% de présence moyenne
- Torball: ${monthlyStats.torball?.present || 0}% de présence moyenne

Données annuelles :
- Goalball: ${yearlyStats.goalball?.present || 0}% de présence moyenne
- Torball: ${yearlyStats.torball?.present || 0}% de présence moyenne

Meilleur mois de l'année :
- Goalball: ${bestMonthStats.goalball?.percentage || 0}% en ${bestMonthStats.goalball?.month || 'N/A'}
- Torball: ${bestMonthStats.torball?.percentage || 0}% en ${bestMonthStats.torball?.month || 'N/A'}

Rédige un bilan de 3-4 paragraphes qui :
1. Fait une analyse comparative entre Goalball et Torball
2. Compare les tendances mensuelles vs annuelles
3. Identifie les points forts et axes d'amélioration
4. Propose des recommandations concrètes pour améliorer la participation

Le ton doit être professionnel mais accessible, adapté à un contexte associatif sportif.
`;

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
            content: 'Tu es un expert en analyse de données sportives et en gestion associative. Tu rédiges des bilans clairs et constructifs.'
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

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedReport = data.choices[0].message.content;

    return new Response(JSON.stringify({ report: generatedReport }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-attendance-report function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
