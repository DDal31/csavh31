import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    try {
      const fileData = await file.arrayBuffer()
      const publicDir = '/public'
      
      // Ensure directory exists
      await Deno.mkdir(publicDir, { recursive: true })
      
      // Remove existing file if it exists
      try {
        await Deno.remove(`${publicDir}/${fileName}`)
        console.log(`Existing file ${fileName} removed from public directory`)
      } catch (removeError) {
        // Ignore error if file doesn't exist
        console.log(`No existing ${fileName} found in public directory or error removing:`, removeError)
      }
      
      // Write new file
      await Deno.writeFile(`${publicDir}/${fileName}`, new Uint8Array(fileData))
      console.log(`File ${fileName} saved to public directory`)

      return new Response(
        JSON.stringify({ success: true, message: `File ${fileName} saved successfully` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (writeError) {
      console.error('Error writing to public directory:', writeError)
      return new Response(
        JSON.stringify({ error: 'Failed to save file', details: writeError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})