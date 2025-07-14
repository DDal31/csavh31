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
    
    // Récupération de la clé API Google AI
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    
    if (!googleApiKey) {
      console.error('ERREUR: Clé API Google AI manquante');
      throw new Error('Clé API Google AI non configurée');
    }
    
    console.log('Clé API Google AI trouvée, longueur:', googleApiKey.length);
    
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
    
    // Prompt optimisé pour Gemini
    const prompt = `
Analyse ces stats de présence ${sport} (${sportsYear}) et rédige un bilan personnel motivant en 3-4 paragraphes :

DONNÉES :
${monthlyDataText}

GLOBAL : ${averageAttendance}% présence | Meilleur mois : ${bestMonth.month} (${bestMonth.percentage}%)

STRUCTURE :
1. Bilan général et points forts
2. Évolution mensuelle 
3. Conseils et objectifs futurs

Ton style : Bienveillant, encourageant, constructif. Maximum 800 mots.
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
            text: `Tu es un coach sportif spécialisé dans les sports adaptés. Rédige des bilans personnels motivants et concis.\n\n${prompt}`
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
- La configuration de la clé API Google AI
- La connexion internet
- Les logs de la fonction pour plus de détails`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});