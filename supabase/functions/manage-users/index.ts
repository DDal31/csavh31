import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, userData } = await req.json()
    console.log('Received request with method:', method)

    switch (method) {
      case 'GET_USERS':
        const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
        if (usersError) throw usersError

        // Get profiles for all users
        const userIds = users.users.map(user => user.id)
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        if (profilesError) throw profilesError

        // Combine users with their profiles
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
        const { email, password, profile } = userData

        // Create the auth user
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        })
        
        if (createError) throw createError

        // Profile is automatically created by the handle_new_user trigger
        // We just need to update it with the provided data
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            club_role: profile.club_role,
            sport: profile.sport,
            team: profile.team,
            site_role: profile.site_role
          })
          .eq('id', newUser.user.id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})