import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, sport, isVisuallyImpaired, userId } = await req.json()
    console.log('Received request:', { message, sport, isVisuallyImpaired, userId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user profile to check if admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    const isAdmin = userProfile.site_role === 'admin'

    if (isAdmin) {
      // Admin dashboard chat logic
      const { data: allTrainings } = await supabase
        .from('trainings')
        .select(`
          *,
          registrations (
            id,
            user_id,
            profiles (
              first_name,
              last_name,
              club_role
            )
          )
        `)
        .eq('type', sport)
        .order('date', { ascending: false })

      // Calculate attendance stats for each sport
      const totalTrainings = allTrainings?.length || 0
      const trainingsWithPlayers = allTrainings?.filter(t => 
        t.registrations && t.registrations.length > 0
      ).length || 0
      
      const attendanceRate = totalTrainings > 0 
        ? (trainingsWithPlayers / totalTrainings) * 100 
        : 0

      // Generate insights for admins
      let response = `Analyse des entraînements de ${sport}:\n\n`
      response += `Taux de présence global: ${attendanceRate.toFixed(1)}%\n`

      // Identify trends
      if (attendanceRate < 50) {
        response += "\n⚠️ Points d'attention:\n"
        response += "- Le taux de présence est préoccupant\n"
        response += "- Suggestion: organiser une réunion avec les joueurs pour comprendre les obstacles\n"
      } else if (attendanceRate > 80) {
        response += "\n✅ Points positifs:\n"
        response += "- Excellent taux de participation\n"
        response += "- La dynamique d'équipe est très positive\n"
      }

      // Recent trends
      const recentTrainings = allTrainings?.slice(0, 5) || []
      const recentAttendance = recentTrainings.filter(t => 
        t.registrations && t.registrations.length > 0
      ).length
      const recentRate = (recentAttendance / recentTrainings.length) * 100

      if (recentRate < attendanceRate - 10) {
        response += "\n📉 Tendance récente à la baisse. Actions suggérées:\n"
        response += "- Vérifier les horaires et la communication\n"
        response += "- Envoyer des rappels plus réguliers\n"
      }

      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      // Member dashboard chat logic
      const now = new Date()
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

      // Get user's recent attendance
      const { data: userTrainings } = await supabase
        .from('registrations')
        .select(`
          *,
          trainings (
            id,
            date,
            type,
            registrations (
              id,
              user_id
            )
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Calculate personal engagement rate
      const totalAvailableTrainings = await supabase
        .from('trainings')
        .select('id')
        .eq('type', sport)
        .gte('date', thirtyDaysAgo.toISOString())

      const attendanceRate = totalAvailableTrainings.data 
        ? (userTrainings?.length || 0) / totalAvailableTrainings.data.length * 100 
        : 0

      // Get upcoming trainings that need players
      const { data: upcomingTrainings } = await supabase
        .from('trainings')
        .select(`
          *,
          registrations (
            id,
            user_id
          )
        `)
        .eq('type', sport)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })

      // Filter trainings needing players where user is not registered
      const trainingsNeedingPlayers = upcomingTrainings
        ?.filter(training => {
          const registeredCount = training.registrations?.length || 0
          const userIsRegistered = training.registrations?.some(reg => reg.user_id === userId)
          return registeredCount < 6 && !userIsRegistered
        })
        .slice(0, 3)

      // Generate personalized response
      let response = ""

      // Engagement feedback
      if (attendanceRate >= 80) {
        response += "👏 Bravo pour votre excellent niveau d'engagement ! "
        response += `Vous avez participé à ${attendanceRate.toFixed(1)}% des entraînements ce mois-ci.\n\n`
      } else if (attendanceRate >= 50) {
        response += `Bon niveau de participation (${attendanceRate.toFixed(1)}%) ! `
        response += "Continuez sur cette lancée pour progresser davantage.\n\n"
      } else {
        response += `Votre taux de participation est de ${attendanceRate.toFixed(1)}%. `
        response += "Une présence plus régulière vous permettrait de mieux progresser.\n\n"
      }

      // Suggest trainings needing players
      if (trainingsNeedingPlayers && trainingsNeedingPlayers.length > 0) {
        response += "Entraînements ayant besoin de joueurs où vous n'êtes pas encore inscrit :\n"
        trainingsNeedingPlayers.forEach(training => {
          const registeredCount = training.registrations?.length || 0
          const date = new Date(training.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
          response += `- ${date} (${registeredCount}/6 joueurs inscrits)\n`
        })
        response += "\nN'hésitez pas à me dire 'oui' si vous voulez que je vous inscrive à l'un de ces entraînements !\n"
      }

      // Sport-specific advice
      response += "\nConseils pour votre pratique du " + sport + ":\n"
      if (sport === 'goalball') {
        response += "- Pensez à travailler votre orientation spatiale\n"
        response += "- La régularité est clé pour maintenir vos repères sur le terrain\n"
      } else if (sport === 'torball') {
        response += "- La précision des lancers est essentielle\n"
        response += "- Maintenez une bonne condition physique pour rester dynamique\n"
      } else if (sport === 'showdown') {
        response += "- La concentration et les réflexes sont primordiaux\n"
        response += "- Pratiquez régulièrement pour améliorer votre technique\n"
      }

      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in chat-with-coach function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})