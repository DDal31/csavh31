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
    console.log("Initialisation de Firebase Admin SDK...");
    
    if (getApps().length === 0) {
      const rawPrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
      console.log("Récupération de la clé privée...");
      
      if (!rawPrivateKey) {
        throw new Error("La variable d'environnement FIREBASE_PRIVATE_KEY n'est pas définie");
      }

      const cleanPrivateKey = (key: string): string => {
        try {
          // Remove quotes and decode if needed
          let cleanKey = key.replace(/^["']|["']$/g, '');
          
          // Replace literal \n with actual newlines
          cleanKey = cleanKey.replace(/\\n/g, '\n');
          
          // Ensure proper PEM format
          if (!cleanKey.includes('-----BEGIN PRIVATE KEY-----')) {
            cleanKey = '-----BEGIN PRIVATE KEY-----\n' + cleanKey;
          }
          if (!cleanKey.includes('-----END PRIVATE KEY-----')) {
            cleanKey = cleanKey + '\n-----END PRIVATE KEY-----';
          }
          
          // Log key format details
          console.log("Vérification du format de la clé:", {
            longueur: cleanKey.length,
            contientDebutPEM: cleanKey.includes("-----BEGIN PRIVATE KEY-----"),
            contientFinPEM: cleanKey.includes("-----END PRIVATE KEY-----"),
            nombreLignes: cleanKey.split('\n').length
          });

          return cleanKey;
        } catch (error) {
          console.error("Erreur lors du nettoyage de la clé privée:", error);
          throw error;
        }
      };

      const privateKey = cleanPrivateKey(rawPrivateKey);

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

      try {
        console.log("Tentative d'initialisation de Firebase avec les informations suivantes:", {
          project_id: serviceAccount.project_id,
          client_email: serviceAccount.client_email,
          private_key_length: serviceAccount.private_key?.length,
          has_required_fields: !!(
            serviceAccount.project_id &&
            serviceAccount.private_key &&
            serviceAccount.client_email
          )
        });

        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialisé avec succès");
      } catch (initError) {
        console.error("Erreur détaillée d'initialisation Firebase:", initError);
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

    // Création du message avec format compatible iOS
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url,
        timestamp: payload.timestamp?.toString(),
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: 1,
            'mutable-content': 1,
            'content-available': 1
          },
        },
        fcm_options: {
          image: payload.icon
        }
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