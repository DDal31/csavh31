import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('Received notification request:', { title, body, trainingId, userId })

    // Vérifier les autorisations
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('site_role')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error('Unauthorized')
    }

    if (profile?.site_role !== 'admin') {
      console.error('User is not an admin:', profile)
      throw new Error('Unauthorized')
    }

    // Récupérer tous les tokens FCM des utilisateurs ayant activé les notifications
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('user_fcm_tokens')
      .select('token')
      .in('user_id', 
        supabaseClient
          .from('user_notification_preferences')
          .select('user_id')
          .eq('push_enabled', true)
      )

    if (tokensError) {
      console.error('Error fetching FCM tokens:', tokensError)
      throw tokensError
    }

    console.log('Found tokens:', tokens)

    const registrationTokens = tokens?.map(t => t.token) || []

    if (registrationTokens.length === 0) {
      console.log('No tokens found')
      throw new Error('No tokens found')
    }

    const firebaseServiceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

    const response = await fetch('https://fcm.googleapis.com/v1/projects/csavh31-c6a45/messages:send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAccessToken(firebaseServiceAccount)}`,
      },
      body: JSON.stringify({
        message: {
          notification: {
            title,
            body,
          },
          data: {
            trainingId: trainingId || '',
          },
          tokens: registrationTokens,
        },
      }),
    })

    const result = await response.json()
    console.log('FCM response:', result)

    // Sauvegarder l'historique des notifications
    const { error: historyError } = await supabaseClient
      .from('notification_history')
      .insert({
        title,
        content: body,
        training_id: trainingId,
        sent_by: userId,
        status: response.ok ? 'success' : 'error',
        error_message: !response.ok ? JSON.stringify(result) : null,
      })

    if (historyError) {
      console.error('Error saving notification history:', historyError)
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 400
      }
    )
  } catch (error) {
    console.error('Error in send-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Fonction pour obtenir un token d'accès Firebase
async function getAccessToken(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000)
  const token = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const header = { alg: 'RS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedClaim = btoa(JSON.stringify(token))
  const input = `${encodedHeader}.${encodedClaim}`
  
  const key = serviceAccount.private_key.replace(/\\n/g, '\n')
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(input)
  )

  const jwt = `${input}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const { access_token } = await tokenResponse.json()
  return access_token
}