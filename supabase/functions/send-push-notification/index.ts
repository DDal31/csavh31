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
      console.log("Clé privée reçue, longueur:", rawPrivateKey?.length);
      
      if (!rawPrivateKey) {
        throw new Error("La variable d'environnement FIREBASE_PRIVATE_KEY n'est pas définie");
      }

      // Fonction pour nettoyer la clé privée
      const cleanPrivateKey = (key: string): string => {
        try {
          // Supprimer les espaces au début et à la fin
          let cleanKey = key.trim();
          
          // Si la clé est entourée de guillemets JSON, les enlever et parser
          if ((cleanKey.startsWith('"') && cleanKey.endsWith('"')) || 
              (cleanKey.startsWith("'") && cleanKey.endsWith("'"))) {
            try {
              cleanKey = JSON.parse(cleanKey);
            } catch (e) {
              console.error("Erreur lors du parsing JSON de la clé:", e);
            }
          }
          
          // Remplacer les \n littéraux par de vrais sauts de ligne
          cleanKey = cleanKey.replace(/\\n/g, '\n');
          
          // Supprimer tout caractère non-Base64 (sauf les délimiteurs PEM)
          cleanKey = cleanKey.split('\n').map(line => {
            if (line.includes('BEGIN') || line.includes('END')) return line;
            return line.replace(/[^A-Za-z0-9+/=]/g, '');
          }).join('\n');
          
          // Ajouter les délimiteurs PEM s'ils sont manquants
          if (!cleanKey.includes('-----BEGIN PRIVATE KEY-----')) {
            cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
          }
          
          // Vérifier que la clé a le bon format
          if (!cleanKey.match(/-----BEGIN PRIVATE KEY-----\n[A-Za-z0-9+/=\n]+\n-----END PRIVATE KEY-----/)) {
            throw new Error("Format de clé PEM invalide après nettoyage");
          }
          
          return cleanKey;
        } catch (error) {
          console.error("Erreur lors du nettoyage de la clé privée:", error);
          throw error;
        }
      };

      const privateKey = cleanPrivateKey(rawPrivateKey);
      
      console.log("Format de la clé privée:", {
        longueur: privateKey.length,
        contientDebutPEM: privateKey.includes("-----BEGIN PRIVATE KEY-----"),
        contientFinPEM: privateKey.includes("-----END PRIVATE KEY-----"),
        nombreLignes: privateKey.split('\n').length,
        premiereLigne: privateKey.split('\n')[0],
        derniereLigne: privateKey.split('\n').slice(-1)[0]
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
        hasPrivateKey: !!serviceAccount.private_key,
        privateKeyLength: serviceAccount.private_key?.length
      });

      try {
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