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
      console.log("Raw private key received, length:", rawPrivateKey?.length);
      
      // Format the private key - first decode if it's URL encoded, then replace literal \n
      const privateKey = decodeURIComponent(rawPrivateKey || '')
        .replace(/\\n/g, '\n')
        .replace(/\\"]/g, '"');
      
      console.log("Formatted private key length:", privateKey.length);
      console.log("Private key starts with:", privateKey.substring(0, 27));
      console.log("Private key ends with:", privateKey.substring(privateKey.length - 25));
      
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

      console.log("Service account project_id:", serviceAccount.project_id);
      console.log("Service account client_email:", serviceAccount.client_email);
      
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