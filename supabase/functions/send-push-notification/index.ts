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
    
    if (getApps().length === 0) {
      const rawPrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
      console.log("Raw private key received");
      
      if (!rawPrivateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
      }

      // Nettoyage et formatage de la clé privée
      let privateKey = rawPrivateKey;
      
      // Si la clé est une chaîne JSON, on la parse
      try {
        const parsed = JSON.parse(privateKey);
        privateKey = typeof parsed === 'string' ? parsed : rawPrivateKey;
        console.log("Clé privée parsée depuis JSON");
      } catch (e) {
        console.log("La clé privée n'est pas au format JSON");
      }

      // Décodage URL si nécessaire
      try {
        privateKey = decodeURIComponent(privateKey);
        console.log("Clé privée décodée URL");
      } catch (e) {
        console.log("La clé privée n'est pas encodée URL");
      }

      // Remplacement des \n littéraux par de vrais sauts de ligne
      privateKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/^"|"$/g, ''); // Supprime les guillemets au début et à la fin

      console.log("Format de la clé privée:", {
        longueur: privateKey.length,
        contientSautsLigne: privateKey.includes('\n'),
        premierCaractere: privateKey.charAt(0),
        dernierCaractere: privateKey.charAt(privateKey.length - 1)
      });

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

      console.log("Configuration du compte de service:", {
        project_id: serviceAccount.project_id,
        client_email: serviceAccount.client_email,
        private_key_id: serviceAccount.private_key_id,
        hasPrivateKey: !!serviceAccount.private_key
      });

      try {
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialisé avec succès");
      } catch (initError) {
        console.error("Erreur d'initialisation Firebase Admin SDK:", initError);
        throw new Error(`Erreur d'initialisation Firebase: ${initError.message}`);
      }
    }

    // Parse request body
    const { subscription, payload } = await req.json();
    console.log("Requête reçue:", { 
      subscription: subscription ? "présent" : "manquant",
      payload 
    });

    if (!subscription?.fcm_token) {
      throw new Error("Token FCM requis dans l'objet subscription");
    }

    // Envoi du message
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

    console.log("Envoi du message:", message);
    const response = await getMessaging().send(message);
    console.log("Message envoyé avec succès:", response);

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
    console.error("Erreur lors de l'envoi de la notification:", error);
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