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
    console.log('Downloading documents for team:', teamName)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get users from the team
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('team', teamName)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    if (!users || users.length === 0) {
      console.log('No users found in team:', teamName)
      return new Response(
        JSON.stringify({ error: 'Aucun utilisateur trouvé dans cette équipe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log(`Found ${users.length} users in team ${teamName}`)

    // Get document types
    const { data: docTypes, error: docTypesError } = await supabase
      .from('document_types')
      .select('*')
      .eq('status', 'active')

    if (docTypesError) {
      console.error('Error fetching document types:', docTypesError)
      throw docTypesError
    }

    // Create zip file
    const zip = new JSZip()
    let hasDocuments = false

    // For each user and document type
    for (const user of users) {
      console.log(`Processing documents for user: ${user.first_name} ${user.last_name}`)
      
      const { data: documents, error: docsError } = await supabase
        .from('user_documents')
        .select(`
          *,
          document_types!user_documents_document_type_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (docsError) {
        console.error('Error fetching documents for user:', user.id, docsError)
        throw docsError
      }

      if (documents && documents.length > 0) {
        console.log(`Found ${documents.length} documents for user ${user.first_name}`)
        
        for (const doc of documents) {
          const docType = doc.document_types
          if (!docType) continue

          try {
            // Get file from storage
            const { data: fileData, error: fileError } = await supabase
              .storage
              .from('user-documents')
              .download(doc.file_path)

            if (fileError) {
              console.error('Error downloading file:', doc.file_path, fileError)
              continue
            }

            const folderPath = `${docType.name}/${user.last_name}_${user.first_name}`
            const fileName = doc.file_name
            
            zip.file(`${folderPath}/${fileName}`, await fileData.arrayBuffer())
            hasDocuments = true
            console.log(`Added file to zip: ${folderPath}/${fileName}`)
          } catch (error) {
            console.error('Error processing document:', error)
            continue
          }
        }
      } else {
        console.log(`No documents found for user ${user.first_name}`)
      }
    }

    if (!hasDocuments) {
      console.log('No documents found for any user in team')
      return new Response(
        JSON.stringify({ error: 'Aucun document disponible pour cette équipe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Generate zip file
    console.log('Generating zip file...')
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const zipBuffer = await zipBlob.arrayBuffer()

    console.log('Zip file generated successfully')
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
    console.error('Error in download-team-documents:', error)
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors du téléchargement' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})