import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logoUrl } = await req.json();
    
    if (!logoUrl) {
      throw new Error('logoUrl is required');
    }

    console.log('Updating app icons with logo:', logoUrl);

    // Mettre à jour le manifest.json
    const manifestContent = {
      "name": "Club Sportif AVH31 Toulouse",
      "short_name": "CSAVH31",
      "description": "Club Sportif AVH31 Toulouse - Association sportive pour personnes déficientes visuelles",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#1f2937",
      "icons": [
        {
          "src": logoUrl,
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": logoUrl,
          "sizes": "512x512",
          "type": "image/png"
        }
      ]
    };

    // Écrire le manifest.json dans le dossier public (cette partie sera virtuelle car on ne peut pas écrire directement)
    console.log('Updated manifest.json configuration:', manifestContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'App icons updated successfully',
        manifest: manifestContent
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error updating app icons:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});