import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { initializeApp, cert, getApps } from 'npm:firebase-admin/app';
import { getMessaging } from 'npm:firebase-admin/messaging';
import { 
  corsHeaders, 
  formatNotificationMessage, 
  getDefaultNotificationSettings,
  formatDate,
  formatRelativeTime 
} from './utils.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    if (getApps().length === 0) {
      const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
      if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
      
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({ credential: cert(serviceAccount) });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log("Fetching trainings between:", now.toISOString(), "and", sevenDaysFromNow.toISOString());

    const { data: trainings, error: trainingsError } = await supabaseClient
      .from('trainings')
      .select(`
        *,
        registrations (
          user_id,
          profiles (
            club_role
          )
        )
      `)
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (trainingsError) throw trainingsError;
    console.log("Found trainings:", trainings);

    const defaultSettings = await getDefaultNotificationSettings(supabaseClient);
    console.log("Default notification settings:", defaultSettings);

    for (const training of trainings) {
      const trainingDateTime = new Date(`${training.date}T${training.start_time}`);
      const hoursUntilTraining = (trainingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log(`Processing training ${training.id} at ${trainingDateTime}, ${hoursUntilTraining} hours until start`);

      const players = training.registrations?.filter(reg => 
        ["joueur", "joueur-entraineur", "joueur-arbitre", "les-trois"].includes(reg.profiles?.club_role)
      ) || [];

      const replacements = {
        sport: training.type,
        date: formatDate(training.date),
        heure: training.start_time.slice(0, 5),
        joueurs: players.length.toString()
      };

      // One week before notification (if enough players)
      if (Math.abs(hoursUntilTraining - 168) < 1) {
        if (players.length >= 6) {
          const message = formatNotificationMessage(
            training.notification_week_before,
            "Rappel : entraînement de {sport} prévu dans une semaine",
            replacements
          );
          await sendNotification(supabaseClient, {
            title: "Rappel d'entraînement",
            body: message,
            training_id: training.id
          });
        } else {
          const message = formatNotificationMessage(
            training.notification_missing_players,
            "Il manque des joueurs pour l'entraînement de {sport}. Pensez à vous inscrire !",
            replacements
          );
          await sendNotification(supabaseClient, {
            title: "Manque de joueurs",
            body: message,
            training_id: training.id
          });
        }
      }

      // Day before notification
      if (Math.abs(hoursUntilTraining - 24) < 1) {
        const message = formatNotificationMessage(
          training.notification_day_before,
          "Rappel : entraînement de {sport} demain",
          replacements
        );
        await sendNotification(supabaseClient, {
          title: "Rappel d'entraînement",
          body: message,
          training_id: training.id
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in send-training-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function sendNotification(supabaseClient: any, notification: { title: string; body: string; training_id: string }) {
  const { data: subscriptions } = await supabaseClient
    .from('push_subscriptions')
    .select('subscription');

  if (!subscriptions?.length) {
    console.log("No push subscriptions found");
    return;
  }

  console.log(`Sending notification to ${subscriptions.length} subscribers:`, notification);

  const messaging = getMessaging();
  for (const { subscription } of subscriptions) {
    if (subscription?.fcm_token) {
      try {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            url: `/training/${notification.training_id}`,
            timestamp: new Date().getTime().toString(),
            source: 'firebase',
          },
          token: subscription.fcm_token,
        };

        await messaging.send(message);
        console.log("Notification sent successfully");

        await supabaseClient
          .from('notification_history')
          .insert({
            title: notification.title,
            content: notification.body,
            target_group: 'all',
            sport: null,
          });

      } catch (error) {
        console.error("Error sending notification:", error);
        if (error.code === 'messaging/registration-token-not-registered') {
          await supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('subscription->fcm_token', subscription.fcm_token);
        }
      }
    }
  }
}