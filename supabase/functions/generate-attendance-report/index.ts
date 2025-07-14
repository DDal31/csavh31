
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
    
    // Créer un rapport global pour les deux sports
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    // Préparation du prompt pour DeepSeek
    const prompt = `
Analyse les statistiques de présence globales du club de sports adaptés et génère un bilan administratif complet :

STATISTIQUES ACTUELLES (${currentMonth}) :
- Goalball : ${monthlyStats.goalball.present}% de présence moyenne
- Torball : ${monthlyStats.torball.present}% de présence moyenne

STATISTIQUES ANNUELLES (${currentYear}) :
- Goalball : ${yearlyStats.goalball.present}% de présence moyenne
- Torball : ${yearlyStats.torball.present}% de présence moyenne

MEILLEURS MOIS :
- Goalball : ${bestMonthStats.goalball.month || 'Non défini'} (${bestMonthStats.goalball.percentage || 0}%)
- Torball : ${bestMonthStats.torball.month || 'Non défini'} (${bestMonthStats.torball.percentage || 0}%)

Rédige un bilan administratif de 4-5 paragraphes qui :
1. Fait un résumé général de la participation aux entraînements
2. Compare les performances entre Goalball et Torball
3. Analyse les tendances et les périodes de forte/faible participation
4. Identifie les points d'amélioration et les réussites
5. Propose des recommandations pour optimiser la participation

Ton analyse doit être professionnelle, constructive et orientée vers l'amélioration de la gestion du club.
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
            content: 'Tu es un consultant spécialisé dans la gestion de clubs sportifs adaptés (Goalball et Torball). Tu analyses les données de participation pour fournir des bilans administratifs professionnels et des recommandations.'
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
