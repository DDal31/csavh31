import webpush from 'npm:web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not found in environment variables')
      throw new Error('VAPID keys not configured')
    }

    // Configure web-push with VAPID details
    webpush.setVapidDetails(
      'https://kzahxvazbthyjjzugxsy.supabase.co',
      vapidPublicKey,
      vapidPrivateKey
    )

    // Parse and validate request body
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

    if (!subscription || !payload) {
      console.error('Missing required parameters:', { subscription: !!subscription, payload: !!payload })
      throw new Error('Missing required parameters')
    }

    if (!subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription format:', { 
        hasEndpoint: !!subscription.endpoint, 
        hasKeys: !!subscription.keys 
      })
      throw new Error('Invalid subscription format')
    }

    try {
      console.log('Attempting to send push notification...')
      
      // Special handling for Apple push notifications
      if (subscription.endpoint.includes('web.push.apple.com')) {
        console.log('Detected Apple push notification endpoint')
        // Format payload according to Apple's requirements
        const applePayload = {
          title: payload.title,
          body: payload.body,
          url: payload.url,
          actions: payload.actions,
          icon: payload.icon,
          badge: payload.badge
        }
        console.log('Formatted Apple payload:', applePayload)
        const result = await webpush.sendNotification(subscription, JSON.stringify(applePayload))
        console.log('Apple push notification sent successfully:', {
          statusCode: result?.statusCode,
          headers: result?.headers
        })
      } else {
        // Standard web push notification
        const result = await webpush.sendNotification(subscription, JSON.stringify(payload))
        console.log('Push notification sent successfully:', {
          statusCode: result?.statusCode,
          headers: result?.headers
        })
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          details: 'Notification sent successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (pushError) {
      console.error('WebPush error:', {
        name: pushError.name,
        message: pushError.message,
        statusCode: pushError.statusCode,
        headers: pushError.headers,
        endpoint: subscription.endpoint,
        body: pushError.body
      })

      // Handle Apple-specific errors
      if (subscription.endpoint.includes('web.push.apple.com')) {
        if (pushError.body?.includes('VapidPkHashMismatch')) {
          return new Response(
            JSON.stringify({ 
              error: 'Apple Push Error',
              details: 'VAPID key mismatch. The subscription needs to be renewed.',
              statusCode: 410,
              endpoint: subscription.endpoint
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 410,
            },
          )
        }
      }

      // Check if subscription is expired or invalid
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        return new Response(
          JSON.stringify({ 
            error: 'Subscription expired or invalid',
            details: pushError.message,
            statusCode: pushError.statusCode,
            endpoint: subscription.endpoint
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: pushError.statusCode,
          },
        )
      }

      // Handle other web push specific errors
      return new Response(
        JSON.stringify({ 
          error: 'Push notification error',
          details: pushError.message,
          statusCode: pushError.statusCode || 400,
          endpoint: subscription.endpoint,
          body: pushError.body
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: pushError.statusCode || 400,
        },
      )
    }
  } catch (error) {
    console.error('Error in send-push-notification:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: error.body
    })
    
    const statusCode = error.statusCode || 400
    const errorMessage = error.body ? JSON.parse(error.body).message : error.message
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage || 'Internal server error',
        details: error.toString(),
        statusCode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})