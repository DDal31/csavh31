
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
    
    console.log('=== DEBUT FONCTION GENERATE-ATTENDANCE-REPORT ===');
    console.log('Données reçues:', JSON.stringify({ monthlyStats, yearlyStats, bestMonthStats }, null, 2));
    
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepSeekApiKey) {
      console.error('ERREUR: DEEPSEEK_API_KEY non configurée');
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('Clé API DeepSeek trouvée:', deepSeekApiKey ? 'OUI (longueur: ' + deepSeekApiKey.length + ')' : 'NON');

    // Vérifier si nous avons des données valides
    const hasValidData = (monthlyStats.goalball?.present > 0 || monthlyStats.torball?.present > 0) ||
                        (yearlyStats.goalball?.present > 0 || yearlyStats.torball?.present > 0);
    
    console.log('Données valides détectées:', hasValidData);

    if (!hasValidData) {
      console.log('Aucune donnée de présence trouvée - génération d\'un rapport par défaut');
      return new Response(JSON.stringify({ 
        report: `**Bilan des Présences - Aucune Donnée Disponible**

Actuellement, aucune donnée de présence n'est disponible pour générer un bilan détaillé. Cela peut indiquer que :

1. **Aucun entraînement n'a encore été organisé** ce mois-ci ou cette année
2. **Les joueurs ne se sont pas encore inscrits** aux entraînements disponibles
3. **Le système de suivi des présences** n'a pas encore été mis en place

**Recommandations pour démarrer :**
- Organiser des entraînements réguliers de Goalball et Torball
- Encourager les joueurs à s'inscrire via la plateforme
- Mettre en place un système de rappels pour les entraînements
- Communiquer sur l'importance de l'assiduité pour la progression sportive

Une fois que des données seront disponibles, ce bilan fournira des analyses détaillées et des recommandations personnalisées pour améliorer les taux de présence.` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    console.log('Prompt préparé pour DeepSeek (longueur:', prompt.length, 'caractères)');
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

    console.log('Statut de la réponse DeepSeek:', response.status);
    console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ERREUR API DeepSeek: ${response.status} - ${errorText}`);
      
      // Test si c'est un problème d'authentification
      if (response.status === 401) {
        console.error('ERREUR D\'AUTHENTIFICATION - Vérifiez la clé API DEEPSEEK_API_KEY');
        throw new Error(`Clé API DeepSeek invalide ou expirée (HTTP ${response.status})`);
      }
      
      throw new Error(`Erreur API DeepSeek: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Réponse DeepSeek reçue avec succès');
    console.log('Structure de la réponse:', Object.keys(data));
    console.log('Nombre de choix:', data.choices?.length || 0);
    
    const generatedReport = data.choices?.[0]?.message?.content;
    
    if (!generatedReport) {
      console.error('ERREUR: Aucun contenu généré dans la réponse DeepSeek');
      console.log('Réponse complète:', JSON.stringify(data, null, 2));
      throw new Error('Aucun contenu généré par DeepSeek');
    }

    console.log('Rapport généré avec succès (longueur:', generatedReport.length, 'caractères)');
    console.log('=== FIN FONCTION GENERATE-ATTENDANCE-REPORT ===');

    return new Response(JSON.stringify({ report: generatedReport }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== ERREUR DANS GENERATE-ATTENDANCE-REPORT ===');
    console.error('Type d\'erreur:', error.constructor.name);
    console.error('Message d\'erreur:', error.message);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      report: `**Erreur lors de la génération du rapport automatique**

Une erreur est survenue lors de la génération du bilan automatique : ${error.message}

**Causes possibles :**
- Problème de connexion avec l'API DeepSeek
- Clé API expirée ou incorrecte
- Données insuffisantes pour l'analyse

**Actions recommandées :**
1. Vérifier la configuration de la clé API DeepSeek
2. S'assurer que des entraînements sont programmés et que des joueurs s'inscrivent
3. Contacter l'administrateur technique si le problème persiste

Consultez les logs de la fonction pour plus de détails techniques.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
