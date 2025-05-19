export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          player_name: string
          attendance_count: number
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
    },
  },
} as const
