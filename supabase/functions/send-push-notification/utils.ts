export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const validateSubscription = (subscription: any) => {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    console.error('Invalid subscription format:', { 
      hasEndpoint: !!subscription?.endpoint, 
      hasKeys: !!subscription?.keys,
      hasP256dh: !!subscription?.keys?.p256dh,
      hasAuth: !!subscription?.keys?.auth
    });
    return {
      isValid: false,
      error: {
        message: 'Invalid subscription format',
        details: 'Subscription must include endpoint and p256dh/auth keys'
      }
    };
  }
  return { isValid: true };
};

export const createApplePayload = (payload: any) => {
  console.log('Formatting Apple push notification payload');
  return {
    aps: {
      alert: {
        title: payload.title,
        body: payload.body
      },
      'content-available': 1,
      'mutable-content': 1
    },
    webpush: {
      ...payload,
      timestamp: new Date().getTime()
    }
  };
};

export const handleAppleError = (error: any) => {
  console.error('Apple push notification error:', {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    body: error.body
  });

  // Parse error body if it's a string
  const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
  
  // Check for VAPID related errors
  if (error.statusCode === 410 || 
      errorBody?.reason === 'VapidPkHashMismatch' ||
      error.message?.includes('VAPID') ||
      error.message?.includes('Unauthorized')) {
    return {
      error: 'Apple Push Error',
      details: 'VAPID key mismatch. The subscription needs to be renewed.',
      statusCode: 410,
      endpoint: error.endpoint,
      errorDetails: {
        message: error.message,
        body: error.body,
        statusCode: error.statusCode
      }
    };
  }

  return {
    error: 'Push notification error',
    details: error.message,
    statusCode: error.statusCode || 400,
    endpoint: error.endpoint,
    errorDetails: {
      message: error.message,
      body: error.body,
      statusCode: error.statusCode
    }
  };
};