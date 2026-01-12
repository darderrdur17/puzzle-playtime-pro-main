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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      active_players: {
        Row: {
          avatar_type: string | null
          avatar_value: string | null
          id: string
          is_completed: boolean
          joined_at: string
          placements: Json
          player_name: string
          score: number
          session_id: string | null
          streak: number
          updated_at: string
          wrong_attempts: number
        }
        Insert: {
          avatar_type?: string | null
          avatar_value?: string | null
          id?: string
          is_completed?: boolean
          joined_at?: string
          placements?: Json
          player_name: string
          score?: number
          session_id?: string | null
          streak?: number
          updated_at?: string
          wrong_attempts?: number
        }
        Update: {
          avatar_type?: string | null
          avatar_value?: string | null
          id?: string
          is_completed?: boolean
          joined_at?: string
          placements?: Json
          player_name?: string
          score?: number
          session_id?: string | null
          streak?: number
          updated_at?: string
          wrong_attempts?: number
        }
        Relationships: [
          {
            foreignKeyName: "active_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_quotes: {
        Row: {
          author: string
          created_at: string
          id: string
          is_active: boolean
          phase: string
          text: string
          theme: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          is_active?: boolean
          phase: string
          text: string
          theme?: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phase?: string
          text?: string
          theme?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          created_at: string
          current_hint: string | null
          difficulty: string
          double_points_active: boolean
          game_ended_at: string | null
          id: string
          is_active: boolean
          theme: string
          timer_seconds: number
          timer_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_hint?: string | null
          difficulty?: string
          double_points_active?: boolean
          game_ended_at?: string | null
          id?: string
          is_active?: boolean
          theme?: string
          timer_seconds?: number
          timer_started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_hint?: string | null
          difficulty?: string
          double_points_active?: boolean
          game_ended_at?: string | null
          id?: string
          is_active?: boolean
          theme?: string
          timer_seconds?: number
          timer_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          created_at: string
          id: string
          player_name: string
          score: number
          session_id: string | null
          theme: string
          time_ms: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_name: string
          score: number
          session_id?: string | null
          theme?: string
          time_ms: number
        }
        Update: {
          created_at?: string
          id?: string
          player_name?: string
          score?: number
          session_id?: string | null
          theme?: string
          time_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rapid_fire_questions: {
        Row: {
          correct_answer: number
          created_at: string
          id: string
          options: Json
          points: number
          question: string
          theme: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          id?: string
          options?: Json
          points?: number
          question: string
          theme?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          id?: string
          options?: Json
          points?: number
          question?: string
          theme?: string
        }
        Relationships: []
      }
      saved_leaderboards: {
        Row: {
          game_name: string
          id: string
          players: Json
          saved_at: string
          session_id: string | null
          winner_name: string | null
          winner_score: number | null
        }
        Insert: {
          game_name: string
          id?: string
          players: Json
          saved_at?: string
          session_id?: string | null
          winner_name?: string | null
          winner_score?: number | null
        }
        Update: {
          game_name?: string
          id?: string
          players?: Json
          saved_at?: string
          session_id?: string | null
          winner_name?: string | null
          winner_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_leaderboards_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
