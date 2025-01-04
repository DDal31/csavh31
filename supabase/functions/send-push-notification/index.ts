import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
      console.log('Initializing Firebase Admin...');
      const serviceAccount = {
        type: "service_account",
        project_id: Deno.env.get('FIREBASE_PROJECT_ID'),
        private_key_id: Deno.env.get('FIREBASE_PRIVATE_KEY_ID'),
        private_key: Deno.env.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        client_email: Deno.env.get('FIREBASE_CLIENT_EMAIL'),
        client_id: Deno.env.get('FIREBASE_CLIENT_ID'),
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: Deno.env.get('FIREBASE_CLIENT_CERT_URL')
      };

      if (!serviceAccount.project_id) {
        throw new Error('Firebase project_id is not configured');
      }

      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully');
    }

    const { subscription, payload } = await req.json();
    console.log('Processing notification request:', {
      subscription: {
        fcm_token: subscription?.fcm_token?.substring(0, 10) + '...'
      },
      payload
    });

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
      );
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      token: subscription.fcm_token
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
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
    );
  }
})