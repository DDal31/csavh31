import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing icon save request...')
    const formData = await req.formData()
    const file = formData.get('file')
    const fileName = formData.get('fileName')?.toString()

    if (!file || !fileName) {
      console.error('Missing file or fileName in request')
      return new Response(
        JSON.stringify({ error: 'No file or fileName provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing file: ${fileName}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload to site-assets bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(fileName)

    console.log(`File uploaded successfully. Public URL: ${publicUrl}`)

    // Update site_settings with upsert
    const settingKey = `icon_${fileName.replace(/\./g, '_')}`
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({ 
        setting_key: settingKey,
        setting_value: publicUrl,
        updated_at: new Date().toISOString()
      })

    if (settingsError) {
      console.error('Error updating site_settings:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Failed to update settings', details: settingsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Save specific files to public directory with replacement
    if (fileName === 'app-icon-192.png' || fileName === 'club-logo.png') {
      try {
        const fileData = await file.arrayBuffer();
        const publicDir = '/public';
        
        // Ensure directory exists
        await Deno.mkdir(publicDir, { recursive: true });
        
        // Remove existing file if it exists
        try {
          await Deno.remove(`${publicDir}/${fileName}`);
          console.log(`Existing file ${fileName} removed from public directory`);
        } catch (removeError) {
          // Ignore error if file doesn't exist
          console.log(`No existing ${fileName} found in public directory or error removing:`, removeError);
        }
        
        // Write new file
        await Deno.writeFile(`${publicDir}/${fileName}`, new Uint8Array(fileData));
        console.log(`File ${fileName} saved to public directory`);
      } catch (writeError) {
        console.error('Error writing to public directory:', writeError);
        // Continue even if public directory write fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})