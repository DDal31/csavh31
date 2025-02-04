import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request:', req.method, req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Validate content type
    const contentType = req.headers.get("content-type");
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content type. Expected application/json, got ${contentType}`);
    }

    // Get the request body as text first for logging
    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);

    // Parse the body text as JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      throw new Error(`Invalid JSON in request body: ${error.message}`);
    }

    const { message, statsContext, isAdmin, userId } = body;
    console.log('Parsed request payload:', { message, statsContext, isAdmin, userId });

    if (!message || !userId) {
      throw new Error('Missing required parameters: message and userId are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !DEEPSEEK_API_KEY) {
      console.error('Missing environment variables:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasDeepseekKey: !!DEEPSEEK_API_KEY
      });
      throw new Error('Missing required environment configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For member chatbot, fetch upcoming trainings that need players
    let trainingsSuggestions = "";
    if (!isAdmin) {
      console.log("Fetching training suggestions for user:", userId);
      
      const { data: upcomingTrainings, error: trainingsError } = await supabase
        .from("trainings")
        .select(`
          *,
          registrations (
            id,
            user_id
          )
        `)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (trainingsError) {
        console.error("Error fetching trainings:", trainingsError);
        throw trainingsError;
      }

      // Filter trainings that need players and where user is not registered
      const trainingsNeedingPlayers = upcomingTrainings
        ?.filter(training => {
          const registeredCount = training.registrations?.length || 0;
          const userIsRegistered = training.registrations?.some(reg => reg.user_id === userId);
          return registeredCount < 6 && !userIsRegistered;
        })
        .slice(0, 3); // Limit to next 3 trainings needing players

      if (trainingsNeedingPlayers && trainingsNeedingPlayers.length > 0) {
        trainingsSuggestions = "\n\nEntraînements ayant besoin de joueurs où tu n'es pas encore inscrit :\n";
        trainingsNeedingPlayers.forEach(training => {
          const registeredCount = training.registrations?.length || 0;
          trainingsSuggestions += `\n- ${training.date} (${registeredCount}/6 joueurs inscrits)`;
        });
      }
    }

    const systemPrompt = isAdmin 
      ? `Tu es un assistant administratif spécialisé dans la gestion de club sportif. Tu as accès aux statistiques de présence suivantes:\n${statsContext}\n\nUtilise ces données pour donner des conseils pertinents sur la gestion du club, l'amélioration des taux de présence et la motivation des joueurs. Sois proactif dans tes suggestions et n'hésite pas à pointer du doigt les problèmes potentiels tout en proposant des solutions concrètes. IMPORTANT: Ta réponse doit être concise et ne pas dépasser 500 tokens.`
      : `Tu es un coach sportif virtuel qui aide les joueurs à rester motivés et à s'améliorer. Voici les statistiques de présence du joueur:\n${statsContext}${trainingsSuggestions}\n\nUtilise ces données pour donner des conseils personnalisés et motivants. IMPORTANT: Incite fortement le joueur à s'inscrire aux entraînements où il y a moins de six joueurs inscrits et où il n'est pas encore inscrit.`;

    console.log('Sending request to Deepseek API with prompt:', systemPrompt);
    console.log('User message:', message);

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: isAdmin ? 500 : 1000,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.text();
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${deepseekResponse.status} ${deepseekResponse.statusText}`);
    }

    const data = await deepseekResponse.json();
    console.log('Deepseek API response:', data);

    // Store the chat message
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message,
        sport: isAdmin ? 'admin' : 'all',
        status: 'active'
      });

    if (insertError) {
      console.error('Error storing chat message:', insertError);
      // Continue execution even if message storage fails
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error in chat-with-coach function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});