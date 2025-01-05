import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
      if (!serviceAccountJson) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
      }
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount)
      });
    }

    // Get upcoming trainings for the next 7 days
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    console.log("Fetching trainings between:", now.toISOString(), "and", sevenDaysFromNow.toISOString());

    const { data: trainings, error: trainingsError } = await supabaseClient
      .from('trainings')
      .select(`
        id,
        type,
        date,
        start_time,
        registrations (
          user_id,
          profiles (
            club_role
          )
        )
      `)
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', sevenDaysFromNow.toISOString().split('T')[0])

    if (trainingsError) {
      console.error("Error fetching trainings:", trainingsError);
      throw trainingsError;
    }

    console.log("Found trainings:", trainings);

    // Process each training
    for (const training of trainings) {
      const trainingDate = new Date(training.date + 'T' + training.start_time)
      const hoursUntilTraining = Math.round((trainingDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      console.log(`Processing training ${training.id} at ${trainingDate}, ${hoursUntilTraining} hours until start`);

      // Get notification settings
      const { data: settings } = await supabaseClient
        .from('notification_settings')
        .select('*')
        .eq('enabled', true)
        .eq('sport', training.type);

      if (!settings || settings.length === 0) {
        console.log("No notification settings found for sport:", training.type);
        continue;
      }

      // Count players and referees
      const players = training.registrations?.filter(reg => 
        ["joueur", "joueur-entraineur", "joueur-arbitre", "les-trois"].includes(reg.profiles?.club_role)
      ) || [];
      
      const referees = training.registrations?.filter(reg => 
        ["arbitre", "joueur-arbitre", "entraineur-arbitre", "les-trois"].includes(reg.profiles?.club_role)
      ) || [];

      console.log(`Training has ${players.length} players and ${referees.length} referees`);

      for (const setting of settings) {
        let shouldSendNotification = false;
        let notificationPayload = null;

        if (setting.notification_type === 'training_reminder' && 
            Math.abs(hoursUntilTraining - setting.delay_hours) < 1) {
          shouldSendNotification = true;
          notificationPayload = {
            title: setting.notification_title || `Rappel d'entraînement ${training.type}`,
            body: setting.notification_text || `Rappel: vous avez un entraînement de ${training.type} ${formatRelativeTime(hoursUntilTraining)}`,
          };
        } else if (setting.notification_type === 'missing_players' && 
                   hoursUntilTraining > 0 &&
                   players.length < (setting.min_players || 6)) {
          shouldSendNotification = true;
          notificationPayload = {
            title: setting.notification_title || `Manque de joueurs - ${training.type}`,
            body: setting.notification_text || 
                  `Il manque des joueurs pour l'entraînement de ${training.type} du ${formatDate(training.date)} (${players.length}/${setting.min_players || 6} joueurs)`,
          };
        }

        if (shouldSendNotification && notificationPayload) {
          console.log("Preparing to send notification:", notificationPayload);

          // Get all users with push subscriptions
          const { data: subscriptions } = await supabaseClient
            .from('push_subscriptions')
            .select('subscription');

          if (!subscriptions || subscriptions.length === 0) {
            console.log("No push subscriptions found");
            continue;
          }

          console.log(`Sending notifications to ${subscriptions.length} subscribers`);

          // Send notifications via Firebase
          const messaging = getMessaging();
          for (const { subscription } of subscriptions) {
            if (subscription?.fcm_token) {
              try {
                const message = {
                  notification: {
                    ...notificationPayload,
                  },
                  data: {
                    url: `/training/${training.id}`,
                    timestamp: now.getTime().toString(),
                    source: 'firebase',
                  },
                  token: subscription.fcm_token,
                };

                await messaging.send(message);
                console.log("Notification sent successfully");
              } catch (error) {
                console.error("Error sending notification:", error);
                if (error.code === 'messaging/registration-token-not-registered') {
                  // Remove invalid token
                  await supabaseClient
                    .from('push_subscriptions')
                    .delete()
                    .eq('subscription->fcm_token', subscription.fcm_token);
                }
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in send-training-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function formatRelativeTime(hours: number): string {
  if (hours === 24) return "demain";
  if (hours === 48) return "après-demain";
  if (hours < 24) return `dans ${hours} heures`;
  return `dans ${Math.round(hours/24)} jours`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}