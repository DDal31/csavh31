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

    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId)
      throw new Error('Invalid userId provided')
    }

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

    // Get users with enabled notifications
    const { data: enabledUsers, error: preferencesError } = await supabaseClient
      .from('user_notification_preferences')
      .select('user_id')
      .eq('push_enabled', true)

    if (preferencesError) {
      console.error('Error fetching notification preferences:', preferencesError)
      throw preferencesError
    }

    console.log('Users with enabled notifications:', enabledUsers)

    if (!enabledUsers || enabledUsers.length === 0) {
      console.log('No users with enabled notifications found')
      // Continue anyway to save in history
    } else {
      // Get FCM tokens for these users
      const userIds = enabledUsers.map(user => user.user_id)
      const { data: tokens, error: tokensError } = await supabaseClient
        .from('user_fcm_tokens')
        .select('token')
        .in('user_id', userIds)

      if (tokensError) {
        console.error('Error fetching FCM tokens:', tokensError)
        throw tokensError
      }

      console.log('Found tokens:', tokens)

      if (tokens && tokens.length > 0) {
        const registrationTokens = tokens.map(t => t.token)
        console.log('Registration tokens:', registrationTokens)

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
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
              },
              tokens: registrationTokens,
              apns: {
                payload: {
                  aps: {
                    alert: {
                      title,
                      body,
                    },
                    sound: 'default',
                    badge: 1,
                  },
                },
              },
              android: {
                notification: {
                  sound: 'default',
                  priority: 'high',
                  click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
              },
              webpush: {
                notification: {
                  icon: '/app-icon-192.png',
                  badge: '/app-icon-192.png',
                  vibrate: [200, 100, 200],
                },
              },
            },
          }),
        })

        const result = await response.json()
        console.log('FCM response:', result)

        if (!response.ok) {
          console.error('Error sending FCM notification:', result)
          throw new Error(`FCM error: ${JSON.stringify(result)}`)
        }
      }
    }

    // Save notification history
    const { error: historyError } = await supabaseClient
      .from('notification_history')
      .insert({
        title,
        content: body,
        training_id: trainingId,
        sent_by: userId,
        status: 'success',
      })

    if (historyError) {
      console.error('Error saving notification history:', historyError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
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