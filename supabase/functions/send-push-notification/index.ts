import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { initializeApp, cert, getApps } from 'npm:firebase-admin/app'
import { getMessaging } from 'npm:firebase-admin/messaging'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
      initializeApp({
        credential: cert(serviceAccount)
      })
    }

    const { subscription, payload } = await req.json()
    console.log('Processing notification request:', {
      subscription: {
        fcm_token: subscription?.fcm_token?.substring(0, 10) + '...'
      },
      payload
    })

    if (!subscription?.fcm_token) {
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription format',
          details: 'FCM token is required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      token: subscription.fcm_token
    }

    const response = await getMessaging().send(message)
    console.log('Successfully sent message:', response)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({
        error: 'Server error',
        details: error.message,
        statusCode: 500
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})