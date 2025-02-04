import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, statsContext, isAdmin, userId } = await req.json()

    if (!message || !userId) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey || !DEEPSEEK_API_KEY) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Sending request to Deepseek API with message:', message)
    console.log('Stats context:', statsContext)
    console.log('Is admin:', isAdmin)

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
            content: isAdmin 
              ? `Tu es un assistant administratif spécialisé dans la gestion de club sportif. Tu as accès aux statistiques de présence suivantes:\n${statsContext}\n\nUtilise ces données pour donner des conseils pertinents sur la gestion du club, l'amélioration des taux de présence et la motivation des joueurs. Sois proactif dans tes suggestions et n'hésite pas à pointer du doigt les problèmes potentiels tout en proposant des solutions concrètes. IMPORTANT: Ta réponse doit être concise et ne pas dépasser 500 tokens.`
              : `Tu es un coach sportif virtuel qui aide les joueurs à rester motivés et à s'améliorer. Voici les statistiques de présence du joueur:\n${statsContext}\n\nUtilise ces données pour donner des conseils personnalisés et motivants. IMPORTANT: Incite fortement le joueur à s'inscrire aux entraînements où il y a moins de six joueurs inscrits et où il n'est pas encore inscrit.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: isAdmin ? 500 : 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Deepseek API error:', errorData)
      throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Deepseek API response:', data)

    // Store the chat message
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message,
        sport: isAdmin ? 'admin' : 'all',
        status: 'active'
      })

    if (insertError) {
      console.error('Error storing chat message:', insertError)
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
    )
  } catch (error) {
    console.error('Error:', error)
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
    )
  }
})