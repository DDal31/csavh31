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
      'mailto:your-email@example.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    // Parse and validate request body
    const { subscription, payload } = await req.json()
    console.log('Processing notification request:', { subscription, payload })

    if (!subscription || !payload) {
      console.error('Missing required parameters')
      throw new Error('Missing required parameters')
    }

    if (!subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription format:', subscription)
      throw new Error('Invalid subscription format')
    }

    try {
      console.log('Attempting to send push notification...')
      await webpush.sendNotification(subscription, JSON.stringify(payload))
      console.log('Push notification sent successfully')

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (pushError) {
      console.error('WebPush error:', pushError)
      // Check if subscription is expired or invalid
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        return new Response(
          JSON.stringify({ 
            error: 'Subscription expired or invalid',
            details: pushError.message,
            statusCode: pushError.statusCode
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: pushError.statusCode,
          },
        )
      }
      throw pushError
    }
  } catch (error) {
    console.error('Error in send-push-notification:', error)
    
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