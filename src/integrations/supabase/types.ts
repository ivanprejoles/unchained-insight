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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          player_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          player_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          player_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string
          display_order: number
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          description: string
          display_order?: number
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          description?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          activities: Json
          created_at: string
          description: string
          display_order: number
          estimated_duration: number
          id: string
          lesson_number: number
          stage_number: number
          title: string
          vocabulary: Json
          xp_reward: number
        }
        Insert: {
          activities?: Json
          created_at?: string
          description: string
          display_order: number
          estimated_duration?: number
          id?: string
          lesson_number: number
          stage_number: number
          title: string
          vocabulary?: Json
          xp_reward?: number
        }
        Update: {
          activities?: Json
          created_at?: string
          description?: string
          display_order?: number
          estimated_duration?: number
          id?: string
          lesson_number?: number
          stage_number?: number
          title?: string
          vocabulary?: Json
          xp_reward?: number
        }
        Relationships: []
      }
      player_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          player_id: string
          score: number
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          player_id: string
          score?: number
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          player_id?: string
          score?: number
          xp_earned?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          level: number
          longest_streak: number
          total_xp: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id: string
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          color: string
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          lesson_count: number
          stage_number: number
          title: string
        }
        Insert: {
          color: string
          created_at?: string
          description: string
          display_order: number
          icon: string
          id?: string
          lesson_count?: number
          stage_number: number
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          lesson_count?: number
          stage_number?: number
          title?: string
        }
        Relationships: []
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
