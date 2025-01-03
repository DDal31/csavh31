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
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: 'Subscription and payload are required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      console.error('Invalid subscription format:', { 
        hasEndpoint: !!subscription.endpoint, 
        hasKeys: !!subscription.keys,
        hasP256dh: !!subscription.keys?.p256dh,
        hasAuth: !!subscription.keys?.auth
      })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid subscription format',
          details: 'Subscription must include endpoint and p256dh/auth keys'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
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
          badge: payload.badge,
          timestamp: new Date().getTime(),
          // Safari spécifique
          aps: {
            alert: {
              title: payload.title,
              body: payload.body
            },
            'content-available': 1
          }
        }
        console.log('Formatted Apple payload:', applePayload)
        try {
          const result = await webpush.sendNotification(subscription, JSON.stringify(applePayload))
          console.log('Apple push notification sent successfully:', {
            statusCode: result?.statusCode,
            headers: result?.headers,
            body: result?.body
          })
        } catch (appleError: any) {
          console.error('Apple push notification error:', {
            name: appleError.name,
            message: appleError.message,
            statusCode: appleError.statusCode,
            body: appleError.body
          })
          // Vérifier si l'erreur est liée à une clé VAPID invalide
          if (appleError.statusCode === 410 || 
              appleError.body?.includes('VapidPkHashMismatch') ||
              appleError.message?.includes('VAPID') ||
              appleError.message?.includes('Unauthorized')) {
            return new Response(
              JSON.stringify({ 
                error: 'Apple Push Error',
                details: 'VAPID key mismatch. The subscription needs to be renewed.',
                statusCode: 410,
                endpoint: subscription.endpoint,
                errorDetails: {
                  message: appleError.message,
                  body: appleError.body,
                  statusCode: appleError.statusCode
                }
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 410,
              },
            )
          }
          throw appleError
        }
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
    } catch (pushError: any) {
      console.error('WebPush error:', {
        name: pushError.name,
        message: pushError.message,
        statusCode: pushError.statusCode,
        headers: pushError.headers,
        endpoint: subscription.endpoint,
        body: pushError.body
      })

      // Handle subscription expiration
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        return new Response(
          JSON.stringify({ 
            error: 'Subscription expired or invalid',
            details: pushError.message,
            statusCode: pushError.statusCode,
            endpoint: subscription.endpoint,
            errorDetails: {
              message: pushError.message,
              body: pushError.body,
              statusCode: pushError.statusCode
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: pushError.statusCode,
          },
        )
      }

      // Handle other errors
      return new Response(
        JSON.stringify({ 
          error: 'Push notification error',
          details: pushError.message,
          statusCode: pushError.statusCode || 400,
          endpoint: subscription.endpoint,
          errorDetails: {
            message: pushError.message,
            body: pushError.body,
            statusCode: pushError.statusCode
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: pushError.statusCode || 400,
        },
      )
    }
  } catch (error: any) {
    console.error('Error in send-push-notification:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: error.body
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        errorDetails: {
          message: error.message,
          body: error.body,
          stack: error.stack
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})