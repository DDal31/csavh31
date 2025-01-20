import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, userData, userId } = await req.json()
    console.log('Received request with method:', method)

    switch (method) {
      case 'GET_USERS':
        const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
        if (usersError) throw usersError

        const userIds = users.users.map(user => user.id)
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        if (profilesError) throw profilesError

        const usersWithProfiles = users.users.map(user => ({
          id: user.id,
          email: user.email,
          profile: profiles.find(profile => profile.id === user.id)
        }))

        return new Response(JSON.stringify(usersWithProfiles), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'CREATE_USER':
        console.log('Creating new user with data:', userData)
        const { email, password, first_name, last_name, club_role, sport, team, site_role, phone } = userData

        if (!email || !password || !first_name || !last_name) {
          throw new Error('Tous les champs obligatoires doivent être remplis')
        }

        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères')
        }

        // Create the auth user
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email: email.trim(),
          password,
          email_confirm: true,
          user_metadata: {
            first_name: first_name.trim(),
            last_name: last_name.trim()
          }
        })
        
        if (createError) {
          console.error('Error creating user:', createError)
          throw new Error(createError.message)
        }

        if (!newUser.user) {
          throw new Error("Échec de la création de l'utilisateur")
        }

        console.log('User created successfully:', newUser)

        try {
          // Clean and prepare sports and teams data
          const sports = sport.split(',').map(s => s.trim()).filter(Boolean)
          const teams = team.split(',').map(t => t.trim()).filter(Boolean)

          // Create the profile
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
              id: newUser.user.id,
              email: email.trim(),
              first_name: first_name.trim(),
              last_name: last_name.trim(),
              phone: phone?.trim(),
              club_role,
              sport: sports.join(', '),
              team: teams.join(', '),
              site_role
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // If profile creation fails, delete the auth user
            await supabaseClient.auth.admin.deleteUser(newUser.user.id)
            throw new Error("Échec de la création du profil")
          }

          console.log('Profile created successfully')
          return new Response(JSON.stringify({ success: true, user: newUser.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error in profile creation:', error)
          // Clean up: delete the auth user if profile creation failed
          await supabaseClient.auth.admin.deleteUser(newUser.user.id)
          throw error
        }

      case 'DELETE_USER':
        console.log('Deleting user with ID:', userId)
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId)
        
        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur inattendue s'est produite"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})