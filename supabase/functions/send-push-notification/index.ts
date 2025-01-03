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
    console.log('Received request with subscription:', subscription)
    console.log('Received request with payload:', payload)

    if (!subscription || !payload) {
      console.error('Missing required parameters')
      throw new Error('Missing required parameters')
    }

    if (!subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription format')
      throw new Error('Invalid subscription format')
    }

    console.log('Sending push notification...')
    
    // Send the notification
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    console.log('Push notification sent successfully')

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-push-notification:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.statusCode || 400,
      },
    )
  }
})