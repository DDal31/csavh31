import type { Json } from './json.types'
import type { TrainingsTable } from './tables/trainings.types'
// Import other table types as needed

export interface Database {
  public: {
    Tables: {
      trainings: TrainingsTable
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_media_links: {
        Row: {
          id: string
          platform: "twitter" | "facebook" | "instagram"
          url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: "twitter" | "facebook" | "instagram"
          url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: "twitter" | "facebook" | "instagram"
          url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
          sport: Database["public"]["Enums"]["sport_type"]
          team: Database["public"]["Enums"]["team_type"]
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
          sport: Database["public"]["Enums"]["sport_type"]
          team: Database["public"]["Enums"]["team_type"]
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
          sport?: Database["public"]["Enums"]["sport_type"]
          team?: Database["public"]["Enums"]["team_type"]
          updated_at?: string
        }
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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      social_media_platform: "twitter" | "facebook" | "instagram"
      club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois"
      contact_status: "active" | "archived"
      document_type: "medical_certificate" | "ophthalmological_certificate" | "ffh_license" | "license" | "id_card" | "photo"
      news_status: "draft" | "published" | "archived"
      site_role: "member" | "admin"
      sport_type: "goalball" | "torball" | "both"
      team_type: "loisir" | "d1_masculine" | "d1_feminine"
      training_type: "goalball" | "torball" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type { Json } from './json.types'
