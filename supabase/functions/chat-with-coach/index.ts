import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Request received:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    const contentType = req.headers.get("content-type");
    console.log('Content-Type:', contentType);
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content type. Expected application/json, got ${contentType}`);
    }

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (!DEEPSEEK_API_KEY) {
      throw new Error('Missing DEEPSEEK_API_KEY environment variable');
    }

    let body;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (!bodyText) {
        throw new Error('Empty request body');
      }
      
      body = JSON.parse(bodyText);
      console.log('Parsed request body:', body);
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      throw new Error(`Invalid JSON in request body: ${error.message}`);
    }

    const { message, sports, isVisuallyImpaired, userId } = body;
    console.log('Extracted data:', { message, sports, isVisuallyImpaired, userId });

    if (!message || !userId || !sports) {
      throw new Error('Missing required parameters: message, userId, and sports are required');
    }

    const sportsString = Array.isArray(sports) ? sports.join(" et ") : sports;
    const systemPrompt = `Tu es un coach sportif virtuel spécialisé en ${sportsString} qui aide les joueurs à rester motivés et à s'améliorer. IMPORTANT: Incite fortement le joueur à s'inscrire aux entraînements où il y a moins de six joueurs inscrits et où il n'est pas encore inscrit. Adapte ton langage et tes conseils en fonction du fait que l'utilisateur ${isVisuallyImpaired ? 'est' : "n'est pas"} déficient visuel.`;

    console.log('System prompt:', systemPrompt);
    console.log('Calling Deepseek API...');

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
        max_tokens: 1000,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('Deepseek API error:', deepseekResponse.status, errorText);
      throw new Error(`Deepseek API error: ${deepseekResponse.status} ${errorText}`);
    }

    const data = await deepseekResponse.json();
    console.log('Deepseek API response:', data);

    // Store the chat message in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message,
        sport: sportsString,
        status: 'active'
      });

    if (insertError) {
      console.error('Error storing chat message:', insertError);
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
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
          'Content-Type': 'application/json'
        } 
      },
    );
  }
})