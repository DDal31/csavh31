import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const serviceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is required')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { title, body, trainingId, userId } = await req.json()

    // Vérifier les autorisations
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('site_role')
      .eq('id', userId)
      .single()

    if (profileError || profile?.site_role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Récupérer tous les tokens FCM des utilisateurs ayant activé les notifications
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('user_fcm_tokens')
      .select('token')
      .innerJoin(
        'user_notification_preferences',
        'user_fcm_tokens.user_id = user_notification_preferences.user_id'
      )
      .eq('user_notification_preferences.push_enabled', true)

    if (tokensError) throw tokensError

    const registrationTokens = tokens.map((t) => t.token)
    if (registrationTokens.length === 0) {
      throw new Error('No tokens found')
    }

    const firebaseConfig = JSON.parse(serviceAccount)
    const response = await fetch('https://fcm.googleapis.com/v1/projects/' + firebaseConfig.project_id + '/messages:send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + await getAccessToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          notification: {
            title,
            body,
          },
          data: {
            trainingId: trainingId.toString(),
          },
          tokens: registrationTokens,
        },
      }),
    })

    const result = await response.json()

    // Enregistrer l'historique
    await supabaseClient
      .from('notification_history')
      .insert({
        title,
        body,
        training_id: trainingId,
        sent_by: userId,
        status: response.ok ? 'success' : 'error',
        error_message: !response.ok ? JSON.stringify(result) : null,
      })

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getAccessToken() {
  const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}')
  
  const response = await fetch(
    `https://oauth2.googleapis.com/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: generateJWT(serviceAccount),
      }),
    }
  )

  const data = await response.json()
  return data.access_token
}

function generateJWT(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000)
  const hour = 3600
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + hour,
    iat: now,
  }

  // Note: This is a simplified JWT implementation
  const header = { alg: 'RS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = 'signature' // In a real implementation, this would be a proper RS256 signature

  return `${encodedHeader}.${encodedPayload}.${signature}`
}