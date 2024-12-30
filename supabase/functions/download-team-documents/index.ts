import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { JSZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { teamName } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get users from the team
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('team', teamName)

    if (usersError) throw usersError

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Aucun utilisateur trouvé dans cette équipe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get document types
    const { data: docTypes, error: docTypesError } = await supabase
      .from('document_types')
      .select('*')
      .eq('status', 'active')

    if (docTypesError) throw docTypesError

    // Create zip file
    const zip = new JSZip()

    // For each user and document type
    for (const user of users) {
      const { data: documents, error: docsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (docsError) throw docsError

      if (documents && documents.length > 0) {
        for (const doc of documents) {
          const docType = docTypes.find(type => type.id === doc.document_type_id)
          if (!docType) continue

          // Get file from storage
          const { data: fileData, error: fileError } = await supabase
            .storage
            .from('user-documents')
            .download(doc.file_path)

          if (fileError) continue

          const folderPath = `${docType.name}/${user.last_name}_${user.first_name}`
          const fileName = doc.file_name
          
          zip.file(`${folderPath}/${fileName}`, await fileData.arrayBuffer())
        }
      }
    }

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const zipBuffer = await zipBlob.arrayBuffer()

    return new Response(
      zipBuffer,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${teamName}_documents.zip"`
        },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors du téléchargement' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})