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
    const userAgent = req.headers.get('user-agent') || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    console.log("User agent:", userAgent);
    console.log("Is iOS device:", isIOS);

    const origin = req.headers.get("origin") || "";
    console.log("Origin:", origin);

    // Générer un challenge aléatoire
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Configuration spécifique pour iOS
    const options = {
      challenge,
      timeout: 60000,
      userVerification: "preferred",
      rpId: new URL(origin).hostname,
      allowCredentials: [], // Permettre toutes les credentials
      authenticatorAttachment: isIOS ? "platform" : undefined,
      attestation: isIOS ? "direct" : "none",
      extensions: {
        uvm: true,
      },
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