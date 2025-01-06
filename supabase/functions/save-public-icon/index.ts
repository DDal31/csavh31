import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload to site-assets bucket
    const { data, error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to save file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(fileName)

    // Update site_settings with the new URL
    const { error: settingsError } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: `icon_${fileName.replace('.', '_')}`,
        setting_value: publicUrl
      }, {
        onConflict: 'setting_key'
      })

    if (settingsError) {
      console.error('Error updating site settings:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Failed to update settings', details: settingsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`File ${fileName} saved successfully`)
    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
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