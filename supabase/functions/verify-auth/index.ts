import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { credential } = await req.json()

    // Here you would verify the credential
    // For demo purposes, we're just checking if it exists
    if (!credential) {
      throw new Error('No credential provided')
    }

    // In a real implementation, you would:
    // 1. Verify the credential against stored credentials
    // 2. Check if the user exists
    // 3. Return the user's email and a one-time password for login

    // For demo, we're returning mock data
    return new Response(
      JSON.stringify({
        verified: true,
        email: "demo@example.com",
        password: "temporary-password"
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})