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

    console.log('Checking VAPID keys configuration...')
    console.log('VAPID public key exists:', !!vapidPublicKey)
    console.log('VAPID private key exists:', !!vapidPrivateKey)

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured')
      return new Response(
        JSON.stringify({
          error: 'Server error',
          details: 'VAPID keys not configured',
          statusCode: 500
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
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
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      console.error('Invalid subscription format:', subscription)
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription format',
          details: 'Subscription must include endpoint and p256dh/auth keys'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Format payload for iOS
    const isApplePush = subscription.endpoint.includes('web.push.apple.com')
    let notificationPayload = payload
    
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
        fcm_options: {
          link: payload.url || '/notifications'
        },
        webpush: {
          ...payload,
          timestamp: new Date().getTime(),
          icon: payload.icon || 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
          badge: payload.badge || 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
          data: payload.url || '/notifications'
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
        JSON.stringify({ success: true }),
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

      // Handle VAPID key mismatch specifically
      if (pushError.body?.includes('VAPID') || 
          pushError.message?.includes('VAPID') ||
          (typeof pushError.body === 'string' && 
           JSON.parse(pushError.body)?.reason === 'VapidPkHashMismatch')) {
        return new Response(
          JSON.stringify({
            error: 'Apple Push Error',
            details: 'VapidPkHashMismatch',
            statusCode: 400,
            errorBody: { reason: 'VapidPkHashMismatch' }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }

      // Handle other errors
      return new Response(
        JSON.stringify({
          error: 'Push notification error',
          details: pushError.message,
          statusCode: pushError.statusCode || 500
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: pushError.statusCode || 500
        }
      )
    }
  } catch (error: any) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({
        error: 'Server error',
        details: error.message,
        statusCode: 500
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})