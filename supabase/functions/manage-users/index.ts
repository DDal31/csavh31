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
        if (usersError) {
          console.error('Error fetching users:', usersError)
          throw usersError
        }

        const userIds = users.users.map(user => user.id)
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          throw profilesError
        }

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

        // Validate required fields
        if (!email?.trim() || !password || !first_name?.trim() || !last_name?.trim()) {
          console.error('Missing required fields')
          throw new Error('Tous les champs obligatoires doivent être remplis')
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
          console.error('Invalid email format')
          throw new Error("Format d'email invalide")
        }

        // Validate password length
        if (password.length < 6) {
          console.error('Password too short')
          throw new Error('Le mot de passe doit contenir au moins 6 caractères')
        }

        try {
          // First check if user already exists in auth
          const { data: existingAuthUser } = await supabaseClient.auth.admin.listUsers()
          const userExists = existingAuthUser.users.some(user => user.email === email.trim())
          
          if (userExists) {
            console.error('User already exists')
            throw new Error('Un utilisateur avec cet email existe déjà')
          }

          // Temporarily disable the trigger
          await supabaseClient.rpc('disable_handle_new_user_trigger')
          console.log('Disabled handle_new_user trigger')

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
            console.error('Error creating auth user:', createError)
            throw createError
          }

          if (!newUser.user) {
            console.error('User creation failed - no user returned')
            throw new Error("Échec de la création de l'utilisateur")
          }

          console.log('Auth user created successfully:', newUser.user.id)

          // Wait to ensure auth user is fully created
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Double check the user ID exists and is valid
          const { data: checkUser, error: checkError } = await supabaseClient.auth.admin.getUserById(newUser.user.id)
          if (checkError || !checkUser.user) {
            console.error('User verification failed:', checkError)
            throw new Error("L'utilisateur n'a pas été créé correctement")
          }

          // Create the profile manually
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
              id: newUser.user.id,
              email: email.trim(),
              first_name: first_name.trim(),
              last_name: last_name.trim(),
              phone: phone?.trim() || null,
              club_role,
              sport,
              team,
              site_role
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // If profile creation fails, delete the auth user
            await supabaseClient.auth.admin.deleteUser(newUser.user.id)
            throw new Error(`Échec de la création du profil: ${profileError.message}`)
          }

          console.log('Profile created successfully')
          
          // Re-enable the trigger
          await supabaseClient.rpc('enable_handle_new_user_trigger')
          console.log('Re-enabled handle_new_user trigger')

          return new Response(JSON.stringify({ success: true, user: newUser.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          })
        } catch (error) {
          // Make sure to re-enable the trigger even if there's an error
          await supabaseClient.rpc('enable_handle_new_user_trigger')
          console.error('Error in user creation process:', error)
          throw error
        }

      case 'DELETE_USER':
        console.log('Deleting user with ID:', userId)
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId)
        
        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          throw deleteError
        }

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