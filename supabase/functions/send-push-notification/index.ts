import webpush from 'npm:web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured')
      throw new Error('VAPID keys not configured')
    }

    webpush.setVapidDetails(
      'https://kzahxvazbthyjjzugxsy.supabase.co',
      vapidPublicKey,
      vapidPrivateKey
    )

    const { subscription, payload } = await req.json()
    console.log('Received request:', {
      subscription: {
        endpoint: subscription?.endpoint,
        keys: subscription?.keys ? {
          p256dh: subscription.keys.p256dh?.substring(0, 10) + '...',
          auth: subscription.keys.auth?.substring(0, 10) + '...'
        } : undefined
      },
      payload
    })

    // Validate subscription format
    if (!subscription?.endpoint || 
        (!subscription?.keys && !subscription?.token)) {
      console.error('Invalid subscription format:', subscription)
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription format',
          details: 'Subscription must include endpoint and keys/token'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Format payload for iOS if needed
    let notificationPayload = payload
    if (subscription.endpoint.includes('web.push.apple.com')) {
      console.log('Formatting payload for Apple Push')
      notificationPayload = {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          'content-available': 1,
          'mutable-content': 1,
          sound: 'default',
          badge: 1,
        },
        webpush: {
          ...payload,
          timestamp: new Date().getTime(),
        },
        fcm_options: {
          link: payload.url
        }
      }
    }

    console.log('Sending notification with payload:', notificationPayload)

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(notificationPayload)
    )

    console.log('Push notification sent successfully:', {
      statusCode: result?.statusCode,
      headers: result?.headers
    })

    return new Response(
      JSON.stringify({
        success: true,
        details: 'Notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      body: error.body
    })

    // Handle subscription expiration
    if (error.statusCode === 404 || error.statusCode === 410) {
      return new Response(
        JSON.stringify({
          error: 'Subscription expired',
          details: error.message,
          statusCode: error.statusCode
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: error.statusCode
        }
      )
    }

    // Handle VAPID errors
    if (error.body?.includes('VAPID') || error.message?.includes('VAPID')) {
      return new Response(
        JSON.stringify({
          error: 'VAPID configuration error',
          details: error.message,
          statusCode: error.statusCode || 400
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: error.statusCode || 400
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: 'Push notification error',
        details: error.message,
        statusCode: error.statusCode || 500
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.statusCode || 500
      }
    )
  }
})