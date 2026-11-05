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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          artist: string
          created_at: string
          id: number
          rating: number
          title: string
          year: number
        }
        Insert: {
          artist: string
          created_at?: string
          id?: never
          rating: number
          title: string
          year: number
        }
        Update: {
          artist?: string
          created_at?: string
          id?: never
          rating?: number
          title?: string
          year?: number
        }
        Relationships: []
      }
      allowed_signup_domains: {
        Row: {
          created_at: string
          domain: string
        }
        Insert: {
          created_at?: string
          domain: string
        }
        Update: {
          created_at?: string
          domain?: string
        }
        Relationships: []
      }
      captions: {
        Row: {
          created_at: string
          generation_id: string
          id: string
          position: number
          text: string
        }
        Insert: {
          created_at?: string
          generation_id: string
          id?: string
          position: number
          text: string
        }
        Update: {
          created_at?: string
          generation_id?: string
          id?: string
          position?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "captions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_examples: {
        Row: {
          caption: string
          created_at: string
          id: string
          is_active: boolean
          note: string | null
        }
        Insert: {
          caption: string
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_test: boolean
          model: string
          posted_at: string | null
          prompt: string
          prompt_chain_id: string | null
          user_id: string
          user_note: string | null
          winner_caption_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_test?: boolean
          model: string
          posted_at?: string | null
          prompt: string
          prompt_chain_id?: string | null
          user_id: string
          user_note?: string | null
          winner_caption_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_test?: boolean
          model?: string
          posted_at?: string | null
          prompt?: string
          prompt_chain_id?: string | null
          user_id?: string
          user_note?: string | null
          winner_caption_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generations_prompt_chain_id_fkey"
            columns: ["prompt_chain_id"]
            isOneToOne: false
            referencedRelation: "prompt_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_winner_caption_id_fkey"
            columns: ["winner_caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          generation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          generation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_models: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          model_id: string
          name: string
          provider_id: string
          supports_images: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id: string
          name: string
          provider_id: string
          supports_images?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id?: string
          name?: string
          provider_id?: string
          supports_images?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "llm_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          api_key_env: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          api_key_env: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          api_key_env?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      llm_responses: {
        Row: {
          created_at: string
          error: string | null
          generation_id: string | null
          id: string
          latency_ms: number | null
          llm_model_id: string | null
          prompt: string
          response: string | null
          step_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          generation_id?: string | null
          id?: string
          latency_ms?: number | null
          llm_model_id?: string | null
          prompt: string
          response?: string | null
          step_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          generation_id?: string | null
          id?: string
          latency_ms?: number | null
          llm_model_id?: string | null
          prompt?: string
          response?: string | null
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_responses_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_responses_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_responses_llm_model_id_fkey"
            columns: ["llm_model_id"]
            isOneToOne: false
            referencedRelation: "llm_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_responses_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "prompt_chain_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      picks: {
        Row: {
          created_at: string
          generation_id: string
          id: string
          loser_caption_id: string
          pick_index: number
          user_id: string
          winner_caption_id: string
        }
        Insert: {
          created_at?: string
          generation_id: string
          id?: string
          loser_caption_id: string
          pick_index: number
          user_id: string
          winner_caption_id: string
        }
        Update: {
          created_at?: string
          generation_id?: string
          id?: string
          loser_caption_id?: string
          pick_index?: number
          user_id?: string
          winner_caption_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "picks_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_loser_caption_id_fkey"
            columns: ["loser_caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_winner_caption_id_fkey"
            columns: ["winner_caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_superadmin: boolean
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_superadmin?: boolean
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_superadmin?: boolean
          last_name?: string | null
        }
        Relationships: []
      }
      prompt_chain_steps: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          llm_model_id: string
          name: string
          position: number
          system_prompt: string
          temperature: number
          user_prompt: string
          uses_image: boolean
        }
        Insert: {
          chain_id: string
          created_at?: string
          id?: string
          llm_model_id: string
          name: string
          position: number
          system_prompt?: string
          temperature?: number
          user_prompt: string
          uses_image?: boolean
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          llm_model_id?: string
          name?: string
          position?: number
          system_prompt?: string
          temperature?: number
          user_prompt?: string
          uses_image?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prompt_chain_steps_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "prompt_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_chain_steps_llm_model_id_fkey"
            columns: ["llm_model_id"]
            isOneToOne: false
            referencedRelation: "llm_models"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_chains: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          mix_weight: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          mix_weight?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          mix_weight?: number
          name?: string
        }
        Relationships: []
      }
      superadmin_invites: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      terms: {
        Row: {
          body: string
          created_at: string
          id: string
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      whitelisted_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
    }
    Views: {
      like_counts: {
        Row: {
          generation_id: string | null
          like_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          id: string | null
          image_url: string | null
          like_count: number | null
          posted_at: string | null
          user_id: string | null
          user_note: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_ban_user: { Args: { target_user: string }; Returns: undefined }
      admin_reorder_chain_steps: {
        Args: { p_chain_id: string; p_step_ids: string[] }
        Returns: undefined
      }
      admin_set_superadmin: {
        Args: { target_user: string; value: boolean }
        Returns: undefined
      }
      admin_unban_user: { Args: { target_user: string }; Returns: undefined }
      caption_in_moment: {
        Args: { target_caption: string; target_generation: string }
        Returns: boolean
      }
      is_banned: { Args: never; Returns: boolean }
      is_posted: { Args: { target_generation: string }; Returns: boolean }
      is_signup_allowed: { Args: { target_email: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      is_user_banned: { Args: { target_user: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
