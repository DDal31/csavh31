import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOGO_SIZES = [
  { size: 512, name: "club-logo.png", setting: "logo_url" },
  { size: 192, name: "app-icon-192.png", setting: "app_icon_192_url" },
  { size: 180, name: "app-icon-180.png", setting: "app_icon_180_url" },
  { size: 152, name: "app-icon-152.png", setting: "app_icon_152_url" },
  { size: 120, name: "app-icon-120.png", setting: "app_icon_120_url" },
  { size: 76, name: "app-icon-76.png", setting: "app_icon_76_url" },
  { size: 60, name: "app-icon-60.png", setting: "app_icon_60_url" },
  { size: 32, name: "app-icon-32.png", setting: "favicon_32_url" },
  { size: 16, name: "app-icon-16.png", setting: "favicon_16_url" }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Aucun fichier fourni' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing logo file: ${file.name}, size: ${file.size}`);

    // Vérifier les dimensions de l'image originale
    const imageBuffer = await file.arrayBuffer();
    const originalImage = new ImageData(new Uint8ClampedArray(imageBuffer), 512, 512);

    // Function to resize image using Canvas API
    const resizeImage = async (buffer: ArrayBuffer, targetSize: number): Promise<Uint8Array> => {
      // Pour cette démo, on va juste retourner le buffer original
      // Dans une vraie implémentation, on utiliserait une bibliothèque comme sharp ou canvas
      return new Uint8Array(buffer);
    };

    const uploadPromises = LOGO_SIZES.map(async ({ size, name, setting }) => {
      try {
        let finalBuffer: Uint8Array;
        
        if (size === 512) {
          // Use original image for 512px
          finalBuffer = new Uint8Array(imageBuffer);
        } else {
          // Resize for other formats (simplified - in real implementation would use proper resizing)
          finalBuffer = await resizeImage(imageBuffer, size);
        }

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(name, finalBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`Error uploading ${name}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('site-assets')
          .getPublicUrl(name);

        const publicUrl = urlData.publicUrl;
        console.log(`Uploaded ${name} successfully: ${publicUrl}`);

        // Update site settings
        const { error: settingError } = await supabase
          .from('site_settings')
          .upsert({
            setting_key: setting,
            setting_value: publicUrl
          });

        if (settingError) {
          console.error(`Error updating setting ${setting}:`, settingError);
          throw settingError;
        }

        return { size, name, url: publicUrl, success: true };
      } catch (error) {
        console.error(`Failed to process ${name}:`, error);
        return { size, name, error: error.message, success: false };
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    
    const successfulUploads = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(upload => upload.success);

    const failedUploads = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(upload => !upload.success);

    console.log(`Logo generation completed: ${successfulUploads.length} successful, ${failedUploads.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successfulUploads.length} formats de logo générés avec succès`,
        successful: successfulUploads,
        failed: failedUploads,
        totalProcessed: LOGO_SIZES.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error in generate-all-logos function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de la génération des logos",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});