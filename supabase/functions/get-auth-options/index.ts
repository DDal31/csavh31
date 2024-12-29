import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Generating authentication options...");

    // Générer un challenge aléatoire
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Configuration spécifique pour iOS
    const options = {
      challenge,
      timeout: 60000,
      userVerification: "preferred",
      rpId: new URL(req.headers.get("origin") || "").hostname,
      allowCredentials: [], // Permettre toutes les credentials
      authenticatorAttachment: "platform", // Spécifique pour Touch ID/Face ID
    };

    console.log("Generated options:", options);

    return new Response(
      JSON.stringify(options),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error("Error generating auth options:", error);
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