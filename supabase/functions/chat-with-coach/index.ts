import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, sport, isVisuallyImpaired, userId } = await req.json()
    console.log('Received request:', { message, sport, isVisuallyImpaired, userId })

    // Check if message contains a date and indicates willingness to register
    const dateMatch = message.match(/(\d{1,2})[/-](\d{1,2})[/-]?(\d{4})?/);
    const wantsToRegister = message.toLowerCase().includes('oui') || 
                           message.toLowerCase().includes('inscris');

    let registrationResponse = null;
    if (dateMatch && wantsToRegister) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3] || new Date().getFullYear();
      const formattedDate = `${year}-${month}-${day}`;

      console.log('Attempting registration for date:', formattedDate);

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase credentials');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Find the training for the given date
      const { data: trainings, error: trainingsError } = await supabase
        .from('trainings')
        .select('*')
        .eq('type', sport)
        .eq('date', formattedDate)
        .single();

      if (trainingsError) {
        console.error('Error finding training:', trainingsError);
        registrationResponse = "Désolé, je n'ai pas trouvé d'entraînement pour cette date.";
      } else if (trainings) {
        // Check if user is already registered
        const { data: existingReg } = await supabase
          .from('registrations')
          .select('id')
          .eq('training_id', trainings.id)
          .eq('user_id', userId)
          .single();

        if (existingReg) {
          registrationResponse = "Tu es déjà inscrit à cet entraînement !";
        } else {
          // Register the user
          const { error: registrationError } = await supabase
            .from('registrations')
            .insert({
              training_id: trainings.id,
              user_id: userId
            });

          if (registrationError) {
            console.error('Error registering for training:', registrationError);
            registrationResponse = "Désolé, je n'ai pas pu t'inscrire à l'entraînement. Essaie via la page des entraînements ou contacte un administrateur.";
          } else {
            registrationResponse = `Super ! Je t'ai inscrit à l'entraînement du ${day}/${month}/${year}. À bientôt !`;
          }
        }
      }
    }

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    if (!DEEPSEEK_API_KEY) {
      throw new Error('Missing DEEPSEEK_API_KEY')
    }

    const systemPrompt = isVisuallyImpaired
      ? `Tu es un coach sportif virtuel spécialisé dans l'accompagnement des personnes déficientes visuelles. Tu aides les joueurs à rester motivés et à s'améliorer dans leur pratique du ${sport}. Donne des conseils personnalisés et adaptés à leur situation. IMPORTANT: Incite fortement le joueur à s'inscrire aux entraînements où il y a moins de six joueurs inscrits et où il n'est pas encore inscrit.`
      : `Tu es un coach sportif virtuel qui aide les joueurs à rester motivés et à s'améliorer dans leur pratique du ${sport}. Tu donnes des conseils personnalisés basés sur leurs statistiques de présence aux entraînements. IMPORTANT: Incite fortement le joueur à s'inscrire aux entraînements où il y a moins de six joueurs inscrits et où il n'est pas encore inscrit.`

    console.log('System prompt:', systemPrompt)
    console.log('User message:', message)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        max_tokens: 500,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('DeepSeek API error:', errorData)
      throw new Error(`DeepSeek API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log('DeepSeek API response:', data)

    // Store the message in the database
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        sport,
        status: 'active'
      })

    if (insertError) {
      console.error('Error storing chat message:', insertError)
    }

    // If we have a registration response, prepend it to the AI response
    const finalResponse = registrationResponse 
      ? `${registrationResponse}\n\n${data.choices[0].message.content}`
      : data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: finalResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in chat-with-coach function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})