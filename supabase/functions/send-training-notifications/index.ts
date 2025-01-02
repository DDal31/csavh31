import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webpush from 'npm:web-push@3.6.6'
import { createClient } from 'npm:@supabase/supabase-js@2'

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
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    )

    // Get upcoming trainings
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data: trainings, error: trainingsError } = await supabaseClient
      .from('trainings')
      .select(`
        id,
        type,
        date,
        start_time,
        registrations (
          user_id
        )
      `)
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', oneWeekFromNow.toISOString().split('T')[0])

    if (trainingsError) throw trainingsError

    // Process each training
    for (const training of trainings) {
      const trainingDate = new Date(training.date)
      const daysUntilTraining = Math.ceil((trainingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // Get subscriptions for registered users
      const { data: subscriptions, error: subscriptionsError } = await supabaseClient
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', training.registrations.map(r => r.user_id))

      if (subscriptionsError) throw subscriptionsError

      // Prepare notification content
      let notificationPayload
      if (daysUntilTraining <= 1) {
        // Reminder notification
        notificationPayload = {
          title: 'Rappel d\'entraînement',
          body: `Vous avez un entraînement de ${training.type} demain à ${training.start_time}`,
          url: `/training/${training.id}`,
        }
      } else if (daysUntilTraining <= 7 && training.registrations.length < 4) {
        // Low participation notification
        notificationPayload = {
          title: 'Participation faible',
          body: `L'entraînement de ${training.type} du ${training.date} manque de participants`,
          url: `/training/${training.id}`,
          actions: [
            {
              action: 'register',
              title: 'S\'inscrire'
            }
          ]
        }
      }

      // Send notifications if needed
      if (notificationPayload) {
        for (const { subscription } of subscriptions) {
          try {
            await webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
          } catch (error) {
            console.error('Error sending notification:', error)
            // If subscription is invalid, remove it
            if (error.statusCode === 410) {
              await supabaseClient
                .from('push_subscriptions')
                .delete()
                .eq('subscription', subscription)
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})