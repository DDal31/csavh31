import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { excelData, championshipName, seasonYear } = await req.json()
    
    console.log('📊 Début de l\'import des données de championnat')
    console.log('Championship:', championshipName, 'Season:', seasonYear)

    // Créer le championnat
    const { data: championship, error: champError } = await supabaseClient
      .from('championships')
      .insert({
        name: championshipName,
        season_year: seasonYear
      })
      .select()
      .single()

    if (champError) {
      console.error('Erreur création championnat:', champError)
      throw champError
    }

    console.log('✅ Championnat créé:', championship.id)

    // Traiter chaque feuille Excel
    for (const [sheetName, sheetData] of Object.entries(excelData)) {
      console.log(`📋 Traitement de la feuille: ${sheetName}`)
      
      if (sheetName.toLowerCase().includes('planning') || sheetName.toLowerCase().includes('j1') || sheetName.toLowerCase().includes('j2') || sheetName.toLowerCase().includes('j3')) {
        // Traiter les journées et matchs
        await processMatchesSheet(supabaseClient, championship.id, sheetName, sheetData as any[])
      } else if (sheetName.toLowerCase().includes('points') || sheetName.toLowerCase().includes('classement')) {
        // Traiter le classement
        await processStandingsSheet(supabaseClient, championship.id, sheetData as any[])
      } else if (sheetName.toLowerCase().includes('buteuses') || sheetName.toLowerCase().includes('stats')) {
        // Traiter les statistiques individuelles
        await processPlayerStatsSheet(supabaseClient, championship.id, sheetData as any[])
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        championshipId: championship.id,
        message: 'Import réalisé avec succès' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})

async function processMatchesSheet(supabaseClient: any, championshipId: string, sheetName: string, data: any[]) {
  console.log(`🏆 Traitement des matchs pour: ${sheetName}`)
  
  // Extraire le numéro de journée depuis le nom de la feuille
  const dayNumber = extractDayNumber(sheetName)
  const dayName = sheetName
  
  // Créer la journée
  const { data: day, error: dayError } = await supabaseClient
    .from('championship_days')
    .insert({
      championship_id: championshipId,
      day_number: dayNumber,
      day_name: dayName
    })
    .select()
    .single()

  if (dayError) {
    console.error('Erreur création journée:', dayError)
    throw dayError
  }

  // Traiter les matchs - adapté selon la structure Excel
  const matches = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    
    // Chercher les lignes qui contiennent des matchs (avec scores ou équipes)
    if (row && typeof row === 'object' && Object.keys(row).length > 3) {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== '')
      
      if (values.length >= 4) {
        // Essayer d'extraire les informations de match
        const matchData = parseMatchRow(row, values)
        if (matchData) {
          matches.push({
            championship_day_id: day.id,
            ...matchData
          })
        }
      }
    }
  }

  if (matches.length > 0) {
    const { error: matchError } = await supabaseClient
      .from('championship_matches')
      .insert(matches)

    if (matchError) {
      console.error('Erreur insertion matchs:', matchError)
      throw matchError
    }
    
    console.log(`✅ ${matches.length} matchs insérés pour ${dayName}`)
  }
}

async function processStandingsSheet(supabaseClient: any, championshipId: string, data: any[]) {
  console.log('📊 Traitement du classement')
  
  const standings = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    
    if (row && typeof row === 'object') {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== '')
      
      // Chercher les lignes avec des données d'équipe
      if (values.length >= 5 && values.some(v => typeof v === 'string' && v.length > 2)) {
        const standingData = parseStandingRow(row, values)
        if (standingData) {
          standings.push({
            championship_id: championshipId,
            ...standingData
          })
        }
      }
    }
  }

  if (standings.length > 0) {
    const { error } = await supabaseClient
      .from('championship_team_standings')
      .insert(standings)

    if (error) {
      console.error('Erreur insertion classement:', error)
      throw error
    }
    
    console.log(`✅ ${standings.length} équipes insérées dans le classement`)
  }
}

async function processPlayerStatsSheet(supabaseClient: any, championshipId: string, data: any[]) {
  console.log('👥 Traitement des statistiques joueuses')
  
  const playerStats = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    
    if (row && typeof row === 'object') {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== '')
      
      // Chercher les lignes avec des données de joueuses
      if (values.length >= 3) {
        const statsData = parsePlayerStatsRow(row, values)
        if (statsData) {
          playerStats.push({
            championship_id: championshipId,
            ...statsData
          })
        }
      }
    }
  }

  if (playerStats.length > 0) {
    const { error } = await supabaseClient
      .from('championship_player_stats')
      .insert(playerStats)

    if (error) {
      console.error('Erreur insertion stats joueuses:', error)
      throw error
    }
    
    console.log(`✅ ${playerStats.length} statistiques de joueuses insérées`)
  }
}

function extractDayNumber(sheetName: string): number {
  const match = sheetName.match(/j(\d+)|journée\s*(\d+)|planning\s*(\d+)/i)
  if (match) {
    return parseInt(match[1] || match[2] || match[3])
  }
  return 1 // Par défaut
}

function parseMatchRow(row: any, values: any[]): any | null {
  try {
    // Logique flexible pour parser une ligne de match
    const stringValues = values.filter(v => typeof v === 'string' && v.length > 1)
    const numberValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
    
    if (stringValues.length >= 2) {
      const teams = stringValues.slice(0, 2)
      const scores = numberValues.length >= 2 ? numberValues.slice(0, 2).map(Number) : [null, null]
      
      return {
        match_number: `T${Math.floor(Math.random() * 1000)}`,
        home_team: teams[0],
        away_team: teams[1],
        home_score: scores[0],
        away_score: scores[1],
        referees: stringValues.length > 2 ? stringValues.slice(2).join(', ') : null
      }
    }
  } catch (error) {
    console.error('Erreur parsing match:', error)
  }
  return null
}

function parseStandingRow(row: any, values: any[]): any | null {
  try {
    const stringValues = values.filter(v => typeof v === 'string' && v.length > 1)
    const numberValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
    
    if (stringValues.length >= 1 && numberValues.length >= 3) {
      return {
        team_name: stringValues[0],
        matches_played: Number(numberValues[0]) || 0,
        wins: Number(numberValues[1]) || 0,
        draws: Number(numberValues[2]) || 0,
        losses: Number(numberValues[3]) || 0,
        goals_for: Number(numberValues[4]) || 0,
        goals_against: Number(numberValues[5]) || 0,
        goal_difference: Number(numberValues[6]) || 0,
        points: Number(numberValues[7]) || 0
      }
    }
  } catch (error) {
    console.error('Erreur parsing classement:', error)
  }
  return null
}

function parsePlayerStatsRow(row: any, values: any[]): any | null {
  try {
    const stringValues = values.filter(v => typeof v === 'string' && v.length > 1)
    const numberValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
    
    if (stringValues.length >= 2) {
      return {
        team_name: stringValues[0],
        player_name: stringValues[1],
        first_name: stringValues[2] || '',
        goals_j1: Number(numberValues[0]) || 0,
        goals_j2: Number(numberValues[1]) || 0,
        goals_j3: Number(numberValues[2]) || 0,
        goals_j4: Number(numberValues[3]) || 0,
        goals_j5: Number(numberValues[4]) || 0,
        goals_j6: Number(numberValues[5]) || 0,
        total_goals: numberValues.slice(0, 6).reduce((sum, val) => sum + (Number(val) || 0), 0)
      }
    }
  } catch (error) {
    console.error('Erreur parsing stats joueur:', error)
  }
  return null
}