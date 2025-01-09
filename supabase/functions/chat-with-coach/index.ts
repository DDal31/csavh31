import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking DeepSeek API key:', !!DEEPSEEK_API_KEY);
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const { message, sport, isVisuallyImpaired, userId } = await req.json();
    console.log('Received request for sport:', sport);
    console.log('User message:', message);
    console.log('Is visually impaired:', isVisuallyImpaired);

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get upcoming trainings with low attendance
    const { data: upcomingTrainings } = await supabase
      .from('trainings')
      .select(`
        *,
        registrations (
          id,
          user_id
        )
      `)
      .eq('type', sport)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    let trainingPrompt = '';
    if (upcomingTrainings && upcomingTrainings.length > 0) {
      const lowAttendanceTrainings = upcomingTrainings
        .filter(training => {
          const registeredPlayers = training.registrations?.length || 0;
          const userIsRegistered = training.registrations?.some(reg => reg.user_id === userId);
          return registeredPlayers <= 6 && !userIsRegistered;
        })
        .map(training => {
          const date = new Date(training.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });
          const players = training.registrations?.length || 0;
          return `${date} (${players} joueurs inscrits)`;
        });

      if (lowAttendanceTrainings.length > 0) {
        trainingPrompt = `\n\nJe vois que certains entraînements manquent de joueurs. Tu pourrais t'inscrire aux dates suivantes :\n• ${lowAttendanceTrainings.join('\n• ')}`;
      }
    }

    let systemPrompt = `Tu es un coach sportif spécialisé en ${sport}. 
    ${isVisuallyImpaired ? "Tu t'adresses à une personne malvoyante ou non-voyante, donc tu adaptes systématiquement tous les exercices et conseils pour qu'ils soient réalisables en toute sécurité par une personne ayant une déficience visuelle. Tu donnes des repères sonores et tactiles plutôt que visuels." : ""}
    Tu donnes des conseils personnalisés, encourageants et bienveillants aux athlètes.
    Tes réponses sont concises (maximum 3 phrases) et toujours positives.
    Tu t'adresses directement à l'athlète de manière amicale.`;

    // If this is the first message (stats message), add suggestions for improvement
    if (message.includes("Pour ce mois-ci")) {
      systemPrompt += `
      Après avoir analysé les statistiques, propose 3 axes d'amélioration possibles parmi:
      - Technique (passes, tirs, défense)
      - Physique (endurance, force, vitesse)
      - Mental (concentration, gestion du stress)
      - Tactique (placement, lecture du jeu)
      Demande ensuite à l'athlète sur quel axe il/elle aimerait travailler en priorité.`;
    }

    // Add training prompt to the message if available
    const finalMessage = message + trainingPrompt;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', await response.text());
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return new Response(JSON.stringify({ 
      response: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-coach function:', error);
    return new Response(JSON.stringify({ 
      error: "Désolé, je ne peux pas répondre pour le moment. Essayez plus tard." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});