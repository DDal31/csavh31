import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, statsContext, isAdmin, userId } = await req.json()
    console.log('Received request:', { message, statsContext, isAdmin, userId })

    // Initialize Supabase client at the start
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // For admin dashboard, analyze attendance stats and provide insights
    if (isAdmin) {
      console.log('Processing admin analytics request with stats context:', statsContext)

      // Parse the stats context
      const stats = statsContext.split('\n').reduce((acc, line) => {
        const [sport, details] = line.split(':')
        if (sport && details) {
          const monthMatch = details.match(/(\d+\.?\d*)% ce mois-ci/)
          const yearMatch = details.match(/(\d+\.?\d*)% sur l'année/)
          const bestMonthMatch = details.match(/Meilleur mois: (.+) avec (\d+\.?\d*)%/)

          acc[sport.trim()] = {
            monthlyRate: monthMatch ? parseFloat(monthMatch[1]) : 0,
            yearlyRate: yearMatch ? parseFloat(yearMatch[1]) : 0,
            bestMonth: bestMonthMatch ? {
              month: bestMonthMatch[1],
              rate: parseFloat(bestMonthMatch[2])
            } : null
          }
        }
        return acc
      }, {})

      console.log('Parsed attendance stats:', stats)

      // Analyze the stats and generate insights
      let response = "Voici mon analyse des statistiques de présence :\n\n"

      Object.entries(stats).forEach(([sport, data]) => {
        response += `Pour le ${sport} :\n`
        
        // Monthly attendance analysis
        if (data.monthlyRate < 50) {
          response += `⚠️ Le taux de présence ce mois-ci est préoccupant (${data.monthlyRate}%). `
          response += "Je recommande d'organiser une réunion avec les joueurs pour comprendre les raisons de cette faible participation.\n"
        } else if (data.monthlyRate >= 80) {
          response += `👏 Excellent taux de présence ce mois-ci (${data.monthlyRate}%). `
          response += "La dynamique d'équipe est très positive.\n"
        } else {
          response += `Le taux de présence ce mois-ci est correct (${data.monthlyRate}%) mais peut être amélioré.\n`
        }

        // Yearly trend analysis
        if (data.monthlyRate < data.yearlyRate) {
          response += `📉 La tendance est à la baisse par rapport à la moyenne annuelle (${data.yearlyRate}%). `
          response += "Il serait utile d'identifier les facteurs qui ont changé.\n"
        } else if (data.monthlyRate > data.yearlyRate) {
          response += `📈 La progression est positive par rapport à la moyenne annuelle (${data.yearlyRate}%).\n`
        }

        // Best month comparison
        if (data.bestMonth) {
          response += `Le meilleur taux de présence a été atteint en ${data.bestMonth.month} (${data.bestMonth.rate}%). `
          if (data.monthlyRate < data.bestMonth.rate - 20) {
            response += "Il y a un écart important avec cette période. Peut-être pouvons-nous nous inspirer des conditions qui ont permis ce succès?\n"
          }
        }

        response += "\n"
      })

      // Add general recommendations
      response += "\nRecommandations générales :\n"
      const lowAttendanceSports = Object.entries(stats)
        .filter(([_, data]) => data.monthlyRate < 60)
        .map(([sport]) => sport)

      if (lowAttendanceSports.length > 0) {
        response += `- Organiser une réunion de section pour ${lowAttendanceSports.join(' et ')} pour discuter des obstacles à la participation\n`
        response += "- Envisager des ajustements d'horaires ou de format d'entraînement si nécessaire\n"
      }

      response += "- Maintenir une communication régulière avec les joueurs\n"
      response += "- Célébrer les progrès et les bons taux de participation\n"

      console.log('Generated response:', response)

      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For regular users, provide personalized training advice
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Get user's recent training attendance
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentTrainings } = await supabase
      .from('registrations')
      .select(`
        *,
        trainings (
          type,
          date,
          start_time,
          end_time
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    // Generate personalized response based on user's message and context
    let response = ""
    const userSports = userProfile.sport.split(',').map((s: string) => s.trim().toLowerCase())
    const attendedTrainings = recentTrainings?.length || 0

    if (message.toLowerCase().includes('statistiques') || message.toLowerCase().includes('présence')) {
      response = `Sur les 30 derniers jours, vous avez participé à ${attendedTrainings} entraînements. `
      
      if (attendedTrainings === 0) {
        response += "Je vous encourage à reprendre les entraînements régulièrement pour maintenir votre niveau et votre intégration dans l'équipe."
      } else if (attendedTrainings < 4) {
        response += "C'est un bon début, mais une participation plus régulière serait bénéfique pour votre progression."
      } else {
        response += "Excellent niveau d'engagement ! Continuez ainsi."
      }
    } else if (message.toLowerCase().includes('conseil') || message.toLowerCase().includes('améliorer')) {
      response = "Voici quelques conseils pour optimiser votre participation aux entraînements :\n"
      response += "- Planifiez vos entraînements à l'avance\n"
      response += "- Communiquez avec vos entraîneurs sur vos objectifs\n"
      response += "- Maintenez une routine régulière\n"
      
      if (attendedTrainings < 4) {
        response += "- Essayez d'augmenter progressivement votre fréquence de participation"
      }
    } else {
      response = "Je suis là pour vous aider à optimiser votre participation aux entraînements. "
      response += "N'hésitez pas à me poser des questions sur vos statistiques de présence ou à me demander des conseils pour vous améliorer."
    }

    console.log('Generated response:', response)

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})