export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      championship_days: {
        Row: {
          championship_id: string
          created_at: string
          day_name: string
          day_number: number
          id: string
          location: string | null
          match_date: string | null
          updated_at: string
        }
        Insert: {
          championship_id: string
          created_at?: string
          day_name: string
          day_number: number
          id?: string
          location?: string | null
          match_date?: string | null
          updated_at?: string
        }
        Update: {
          championship_id?: string
          created_at?: string
          day_name?: string
          day_number?: number
          id?: string
          location?: string | null
          match_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championship_days_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_matches: {
        Row: {
          away_score: number | null
          away_team: string
          championship_day_id: string
          created_at: string
          home_score: number | null
          home_team: string
          id: string
          match_number: string
          match_time: string | null
          referees: string | null
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          championship_day_id: string
          created_at?: string
          home_score?: number | null
          home_team: string
          id?: string
          match_number: string
          match_time?: string | null
          referees?: string | null
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          championship_day_id?: string
          created_at?: string
          home_score?: number | null
          home_team?: string
          id?: string
          match_number?: string
          match_time?: string | null
          referees?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championship_matches_championship_day_id_fkey"
            columns: ["championship_day_id"]
            isOneToOne: false
            referencedRelation: "championship_days"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_player_stats: {
        Row: {
          championship_id: string
          created_at: string
          first_name: string | null
          goals_j1: number | null
          goals_j2: number | null
          goals_j3: number | null
          goals_j4: number | null
          goals_j5: number | null
          goals_j6: number | null
          id: string
          match_1: number | null
          match_2: number | null
          match_3: number | null
          player_name: string
          team_name: string
          total_goals: number | null
          updated_at: string
        }
        Insert: {
          championship_id: string
          created_at?: string
          first_name?: string | null
          goals_j1?: number | null
          goals_j2?: number | null
          goals_j3?: number | null
          goals_j4?: number | null
          goals_j5?: number | null
          goals_j6?: number | null
          id?: string
          match_1?: number | null
          match_2?: number | null
          match_3?: number | null
          player_name: string
          team_name: string
          total_goals?: number | null
          updated_at?: string
        }
        Update: {
          championship_id?: string
          created_at?: string
          first_name?: string | null
          goals_j1?: number | null
          goals_j2?: number | null
          goals_j3?: number | null
          goals_j4?: number | null
          goals_j5?: number | null
          goals_j6?: number | null
          id?: string
          match_1?: number | null
          match_2?: number | null
          match_3?: number | null
          player_name?: string
          team_name?: string
          total_goals?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championship_player_stats_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_rounds: {
        Row: {
          created_at: string
          id: string
          round_date: string | null
          round_number: number
          season_year: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_date?: string | null
          round_number: number
          season_year: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          round_date?: string | null
          round_number?: number
          season_year?: string
          updated_at?: string
        }
        Relationships: []
      }
      championship_standings: {
        Row: {
          created_at: string
          draws: number | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          losses: number | null
          matches_played: number | null
          points: number | null
          position: number | null
          season_year: string
          team_id: string
          updated_at: string
          wins: number | null
        }
        Insert: {
          created_at?: string
          draws?: number | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          position?: number | null
          season_year: string
          team_id: string
          updated_at?: string
          wins?: number | null
        }
        Update: {
          created_at?: string
          draws?: number | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          position?: number | null
          season_year?: string
          team_id?: string
          updated_at?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "championship_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_championship"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_team_standings: {
        Row: {
          championship_id: string
          created_at: string
          draws: number | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          losses: number | null
          matches_played: number | null
          points: number | null
          position: number | null
          team_name: string
          updated_at: string
          wins: number | null
        }
        Insert: {
          championship_id: string
          created_at?: string
          draws?: number | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          position?: number | null
          team_name: string
          updated_at?: string
          wins?: number | null
        }
        Update: {
          championship_id?: string
          created_at?: string
          draws?: number | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          points?: number | null
          position?: number | null
          team_name?: string
          updated_at?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "championship_team_standings_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      championships: {
        Row: {
          created_at: string
          id: string
          name: string
          season_year: string
          sport_id: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          season_year: string
          sport_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          season_year?: string
          sport_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championships_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "championships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          display_order: number | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          photo_url: string | null
          role: string
          status: Database["public"]["Enums"]["contact_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          photo_url?: string | null
          role: string
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          photo_url?: string | null
          role?: string
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      document_types: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["document_type_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["document_type_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["document_type_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      excel_imports: {
        Row: {
          error_message: string | null
          file_name: string
          file_path: string
          id: string
          import_date: string
          imported_by: string
          records_imported: number | null
          status: string | null
        }
        Insert: {
          error_message?: string | null
          file_name: string
          file_path: string
          id?: string
          import_date?: string
          imported_by: string
          records_imported?: number | null
          status?: string | null
        }
        Update: {
          error_message?: string | null
          file_name?: string
          file_path?: string
          id?: string
          import_date?: string
          imported_by?: string
          records_imported?: number | null
          status?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string | null
          document_name: string | null
          document_path: string | null
          expense_category:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id: string
          income_category: Database["public"]["Enums"]["income_category"] | null
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description?: string | null
          document_name?: string | null
          document_path?: string | null
          expense_category?:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id?: string
          income_category?:
            | Database["public"]["Enums"]["income_category"]
            | null
          title: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          document_name?: string | null
          document_path?: string | null
          expense_category?:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id?: string
          income_category?:
            | Database["public"]["Enums"]["income_category"]
            | null
          title?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string
          created_at: string
          home_score: number | null
          home_team_id: string
          id: string
          match_date: string | null
          round_id: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          created_at?: string
          home_score?: number | null
          home_team_id: string
          id?: string
          match_date?: string | null
          round_id: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          created_at?: string
          home_score?: number | null
          home_team_id?: string
          id?: string
          match_date?: string | null
          round_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams_championship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams_championship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "championship_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_path: string | null
          published_at: string
          status: Database["public"]["Enums"]["news_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_path?: string | null
          published_at?: string
          status?: Database["public"]["Enums"]["news_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_path?: string | null
          published_at?: string
          status?: Database["public"]["Enums"]["news_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages_content: {
        Row: {
          content: string
          created_at: string
          id: string
          image_paths: string[] | null
          section: string
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_paths?: string[] | null
          section: string
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_paths?: string[] | null
          section?: string
          title?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          id: string
          name: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_championship"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          club_role: Database["public"]["Enums"]["club_role"]
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          site_role: Database["public"]["Enums"]["site_role"]
          sport: string
          team: string
          updated_at: string
        }
        Insert: {
          club_role?: Database["public"]["Enums"]["club_role"]
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          site_role?: Database["public"]["Enums"]["site_role"]
          sport: string
          team: string
          updated_at?: string
        }
        Update: {
          club_role?: Database["public"]["Enums"]["club_role"]
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          site_role?: Database["public"]["Enums"]["site_role"]
          sport?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          id: string
          training_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          training_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_registrations_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      scorer_standings: {
        Row: {
          created_at: string
          goals: number | null
          id: string
          matches_played: number | null
          player_id: string
          position: number | null
          season_year: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals?: number | null
          id?: string
          matches_played?: number | null
          player_id: string
          position?: number | null
          season_year: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: number | null
          id?: string
          matches_played?: number | null
          player_id?: string
          position?: number | null
          season_year?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorer_standings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["social_media_platform"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["social_media_platform"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["social_media_platform"]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      sport_players: {
        Row: {
          created_at: string
          id: string
          sport_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sport_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sport_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_players_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          sport_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sport_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sport_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      teams_championship: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_settings: {
        Row: {
          color_scheme: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          layout_config: Json
          name: string
          style: Database["public"]["Enums"]["template_style"]
          updated_at: string
        }
        Insert: {
          color_scheme: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_config: Json
          name: string
          style: Database["public"]["Enums"]["template_style"]
          updated_at?: string
        }
        Update: {
          color_scheme?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_config?: Json
          name?: string
          style?: Database["public"]["Enums"]["template_style"]
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          notification_day_before: string | null
          notification_missing_players: string | null
          notification_week_before: string | null
          other_type_details: string | null
          registered_players_count: number | null
          start_time: string
          total_sport_players_count: number | null
          type: Database["public"]["Enums"]["training_type"]
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          notification_day_before?: string | null
          notification_missing_players?: string | null
          notification_week_before?: string | null
          other_type_details?: string | null
          registered_players_count?: number | null
          start_time: string
          total_sport_players_count?: number | null
          type: Database["public"]["Enums"]["training_type"]
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notification_day_before?: string | null
          notification_missing_players?: string | null
          notification_week_before?: string | null
          other_type_details?: string | null
          registered_players_count?: number | null
          start_time?: string
          total_sport_players_count?: number | null
          type?: Database["public"]["Enums"]["training_type"]
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          document_type: string
          document_type_id: string
          file_name: string
          file_path: string
          id: string
          status: Database["public"]["Enums"]["document_type_status"] | null
          uploaded_at: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          document_type: string
          document_type_id: string
          file_name: string
          file_path: string
          id?: string
          status?: Database["public"]["Enums"]["document_type_status"] | null
          uploaded_at?: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          document_type?: string
          document_type_id?: string
          file_name?: string
          file_path?: string
          id?: string
          status?: Database["public"]["Enums"]["document_type_status"] | null
          uploaded_at?: string
          uploaded_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_temp_document_type_id_fkey"
            columns: ["document_type"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      disable_handle_new_user_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_handle_new_user_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_player_attendance_ranking: {
        Args: { sport_type: string }
        Returns: {
          attendance_count: number
          player_name: string
          rank: number
        }[]
      }
    }
    Enums: {
      chat_message_status: "active" | "deleted"
      club_role:
        | "joueur"
        | "entraineur"
        | "arbitre"
        | "joueur-entraineur"
        | "joueur-arbitre"
        | "entraineur-arbitre"
        | "les-trois"
      contact_status: "active" | "archived"
      document_type:
        | "medical_certificate"
        | "ophthalmological_certificate"
        | "ffh_license"
        | "license"
        | "id_card"
        | "photo"
      document_type_status: "active" | "archived"
      expense_category:
        | "competition"
        | "minibus"
        | "materiel"
        | "organisation_championnat"
        | "licence_affiliation"
      income_category:
        | "dons"
        | "location_minibus"
        | "remboursement_joueur"
        | "buvette"
        | "unadev"
        | "inscription_championnat"
        | "subvention"
      news_status: "draft" | "published" | "archived"
      notification_type: "training_reminder" | "missing_players" | "custom"
      site_role: "member" | "admin"
      social_media_platform: "twitter" | "facebook" | "instagram"
      sport_type: "goalball" | "torball" | "both"
      target_group: "all" | "sport_specific" | "training_registered"
      team_type: "loisir" | "d1_masculine" | "d1_feminine"
      template_style:
        | "default"
        | "modern"
        | "minimal"
        | "playful"
        | "professional"
      training_type: "goalball" | "torball" | "other" | "showdown"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chat_message_status: ["active", "deleted"],
      club_role: [
        "joueur",
        "entraineur",
        "arbitre",
        "joueur-entraineur",
        "joueur-arbitre",
        "entraineur-arbitre",
        "les-trois",
      ],
      contact_status: ["active", "archived"],
      document_type: [
        "medical_certificate",
        "ophthalmological_certificate",
        "ffh_license",
        "license",
        "id_card",
        "photo",
      ],
      document_type_status: ["active", "archived"],
      expense_category: [
        "competition",
        "minibus",
        "materiel",
        "organisation_championnat",
        "licence_affiliation",
      ],
      income_category: [
        "dons",
        "location_minibus",
        "remboursement_joueur",
        "buvette",
        "unadev",
        "inscription_championnat",
        "subvention",
      ],
      news_status: ["draft", "published", "archived"],
      notification_type: ["training_reminder", "missing_players", "custom"],
      site_role: ["member", "admin"],
      social_media_platform: ["twitter", "facebook", "instagram"],
      sport_type: ["goalball", "torball", "both"],
      target_group: ["all", "sport_specific", "training_registered"],
      team_type: ["loisir", "d1_masculine", "d1_feminine"],
      template_style: [
        "default",
        "modern",
        "minimal",
        "playful",
        "professional",
      ],
      training_type: ["goalball", "torball", "other", "showdown"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
