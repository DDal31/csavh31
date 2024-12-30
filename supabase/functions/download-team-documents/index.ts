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

    // Get users from the team with their documents and document types
    console.log('Fetching users and documents from team:', teamName)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        team,
        sport,
        user_documents!inner (
          id,
          file_path,
          file_name,
          document_type_id,
          document_types!inner (
            name
          )
        )
      `)
      .or(teamName.split(',').map(team => `team.ilike.%${team.trim()}%`).join(','))

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw new Error(`Error fetching users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('No users found in team:', teamName)
      return new Response(
        JSON.stringify({ error: 'Aucun utilisateur trouvé dans cette équipe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log(`Found ${users.length} users in team ${teamName}:`, 
      users.map(u => `${u.first_name} ${u.last_name} (${u.team})`))

    // Create zip file
    const zip = new JSZip()
    let hasDocuments = false

    // Process each user's documents
    for (const user of users) {
      if (!user.user_documents || user.user_documents.length === 0) {
        console.log(`No documents found for user ${user.first_name} ${user.last_name}`)
        continue
      }

      console.log(`Processing ${user.user_documents.length} documents for user: ${user.first_name} ${user.last_name}`)

      for (const doc of user.user_documents) {
        try {
          if (!doc.document_types || !doc.document_types.name) {
            console.log(`Skipping document ${doc.file_name} - invalid document type`)
            continue
          }

          console.log(`Downloading file from storage: ${doc.file_path}`)
          const { data: fileData, error: fileError } = await supabase
            .storage
            .from('user-documents')
            .download(doc.file_path)

          if (fileError) {
            console.error(`Error downloading file ${doc.file_path}:`, fileError)
            continue
          }

          if (!fileData) {
            console.error(`No data received for file ${doc.file_path}`)
            continue
          }

          const folderPath = `${doc.document_types.name}/${user.last_name}_${user.first_name}`
          console.log(`Adding file to zip: ${folderPath}/${doc.file_name}`)
          
          const arrayBuffer = await fileData.arrayBuffer()
          zip.file(`${folderPath}/${doc.file_name}`, arrayBuffer)
          hasDocuments = true
          
          console.log(`Successfully added file: ${folderPath}/${doc.file_name}`)
        } catch (error) {
          console.error(`Error processing document ${doc.file_name}:`, error)
          continue
        }
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
        }
      }
    )

  } catch (error) {
    console.error('Error in download-team-documents:', error)
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors du téléchargement', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})