import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { initializeApp, cert, getApps } from 'npm:firebase-admin/app';
import { getMessaging } from 'npm:firebase-admin/messaging';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Initializing Firebase Admin SDK...");
    
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      // Get the raw private key
      const rawPrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
      console.log("Raw private key received");
      
      if (!rawPrivateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
      }

      // Format the private key - handle both URL encoded and regular format
      let privateKey = rawPrivateKey;
      try {
        // Try URL decoding first in case it's URL encoded
        privateKey = decodeURIComponent(rawPrivateKey);
      } catch (e) {
        console.log("Private key is not URL encoded, using raw value");
      }

      // Replace literal \n with actual newlines and clean up any extra quotes
      privateKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/^"/, '')
        .replace(/"$/, '');

      console.log("Private key formatted successfully");
      
      const serviceAccount = {
        type: "service_account",
        project_id: Deno.env.get("FIREBASE_PROJECT_ID"),
        private_key_id: Deno.env.get("FIREBASE_PRIVATE_KEY_ID"),
        private_key: privateKey,
        client_email: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
        client_id: Deno.env.get("FIREBASE_CLIENT_ID"),
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: Deno.env.get("FIREBASE_CLIENT_CERT_URL"),
      };

      console.log("Service account configured with:");
      console.log("- Project ID:", serviceAccount.project_id);
      console.log("- Client Email:", serviceAccount.client_email);
      
      try {
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully");
      } catch (initError) {
        console.error("Error initializing Firebase Admin SDK:", initError);
        throw new Error(`Firebase initialization error: ${initError.message}`);
      }
    }

    // Parse request body
    const { subscription, payload } = await req.json();
    console.log("Received notification request:", { 
      subscription: subscription ? "present" : "missing",
      payload 
    });

    if (!subscription?.fcm_token) {
      throw new Error("FCM token is required in subscription object");
    }

    // Send message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        fcm_options: {
          link: payload.url,
        },
      },
      token: subscription.fcm_token,
    };

    console.log("Sending message:", message);
    const response = await getMessaging().send(message);
    console.log("Successfully sent message:", response);

    return new Response(
      JSON.stringify({ success: true, messageId: response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})