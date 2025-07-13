
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
    console.log('=== DÉBUT GÉNÉRATION RAPPORT UTILISATEUR ===');
    
    const { monthlyStats, sport, sportsYear } = await req.json();
    console.log('Données reçues:', { monthlyStats, sport, sportsYear });
    
    // Récupération de la clé API DeepSeek
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      console.error('ERREUR: Clé API DeepSeek manquante');
      throw new Error('Clé API DeepSeek non configurée');
    }
    
    console.log('Clé API trouvée, longueur:', deepSeekApiKey.length);
    
    // Trouver le meilleur mois
    const bestMonth = monthlyStats.reduce((best: any, current: any) => 
      current.percentage > best.percentage ? current : best
    );
    
    // Calculer les statistiques globales
    const totalPresent = monthlyStats.reduce((sum: number, month: any) => sum + month.present, 0);
    const totalTrainings = monthlyStats.reduce((sum: number, month: any) => sum + month.total, 0);
    const averageAttendance = totalTrainings > 0 ? Math.round((totalPresent / totalTrainings) * 100) : 0;
    
    // Créer le résumé des données mensuelles pour le prompt
    const monthlyDataText = monthlyStats
      .map((month: any) => `${month.month}: ${month.present}/${month.total} entraînements (${month.percentage}%)`)
      .join('\n');
    
    // Préparation du prompt pour DeepSeek
    const prompt = `
Analyse les statistiques de présence suivantes pour un joueur de ${sport} sur l'année sportive ${sportsYear} et génère un bilan personnel et constructif :

DONNÉES MENSUELLES DE PRÉSENCE :
${monthlyDataText}

STATISTIQUES GLOBALES :
- Taux de présence moyen sur l'année : ${averageAttendance}%
- Meilleur mois : ${bestMonth.month} avec ${bestMonth.percentage}%
- Total : ${totalPresent} présences sur ${totalTrainings} entraînements

Rédige un bilan personnel de 4-5 paragraphes qui :
1. Fait un résumé de l'année sportive avec les points forts
2. Analyse l'évolution de la présence au fil des mois
3. Identifie les périodes de forte et faible participation
4. Donne des encouragements et des conseils personnalisés pour progresser
5. Propose des objectifs pour la prochaine saison

Ton analyse doit être bienveillante, motivante et adaptée à un contexte sportif personnel. Utilise un ton encourageant et positif.
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
            content: 'Tu es un coach sportif bienveillant spécialisé dans les sports adaptés (Goalball et Torball). Tu rédiges des bilans personnels motivants et constructifs pour les joueurs.'
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
    console.log('=== FIN GÉNÉRATION RAPPORT UTILISATEUR ===');

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
