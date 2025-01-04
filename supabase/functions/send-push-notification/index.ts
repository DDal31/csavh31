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
    console.log('Processing notification request:', {
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
    const isApplePush = subscription.endpoint.includes('web.push.apple.com')
    
    if (isApplePush) {
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
          icon: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
          badge: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png'
        },
        fcm_options: {
          link: payload.url
        }
      }
    }

    console.log('Sending notification with payload:', notificationPayload)

    try {
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
    } catch (pushError: any) {
      console.error('Push notification error:', {
        name: pushError.name,
        message: pushError.message,
        statusCode: pushError.statusCode,
        body: pushError.body
      })

      // Handle expired subscriptions
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        return new Response(
          JSON.stringify({
            error: 'Subscription expired',
            details: pushError.message,
            statusCode: pushError.statusCode
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: pushError.statusCode
          }
        )
      }

      // Handle VAPID configuration errors
      if (pushError.body?.includes('VAPID') || pushError.message?.includes('VAPID')) {
        return new Response(
          JSON.stringify({
            error: 'VAPID configuration error',
            details: pushError.message,
            statusCode: 400
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }

      // For Apple Push specific errors, try to parse and handle them
      if (isApplePush && pushError.body) {
        try {
          const errorBody = typeof pushError.body === 'string' ? 
            JSON.parse(pushError.body) : pushError.body;
          
          return new Response(
            JSON.stringify({
              error: 'Apple Push Error',
              details: errorBody.reason || pushError.message,
              statusCode: 400,
              errorBody
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        } catch (parseError) {
          console.error('Error parsing Apple Push error:', parseError)
        }
      }

      throw pushError
    }
  } catch (error: any) {
    console.error('Error in send-push-notification:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      body: error.body
    })

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