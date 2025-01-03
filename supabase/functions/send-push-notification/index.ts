import webpush from 'npm:web-push@3.6.6'
import { corsHeaders, validateSubscription, createApplePayload, handleAppleError } from './utils.ts'

Deno.serve(async (req) => {
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

    if (!subscription || !payload) {
      console.error('Missing required parameters')
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

    const validationResult = validateSubscription(subscription)
    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify(validationResult.error),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    try {
      console.log('Attempting to send push notification...')
      
      if (subscription.endpoint.includes('web.push.apple.com')) {
        console.log('Detected Apple push notification endpoint')
        const applePayload = createApplePayload(payload)
        console.log('Formatted Apple payload:', applePayload)
        
        try {
          const result = await webpush.sendNotification(subscription, JSON.stringify(applePayload))
          console.log('Apple push notification sent successfully:', {
            statusCode: result?.statusCode,
            headers: result?.headers,
            body: result?.body
          })
        } catch (appleError: any) {
          const errorResponse = handleAppleError(appleError)
          return new Response(
            JSON.stringify(errorResponse),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: errorResponse.statusCode,
            }
          )
        }
      } else {
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
        }
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
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          error: 'Push notification error',
          details: pushError.message,
          statusCode: pushError.statusCode || 400,
          endpoint: subscription.endpoint
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: pushError.statusCode || 400,
        }
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
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})