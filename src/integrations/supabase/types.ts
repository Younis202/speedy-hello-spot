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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          call_date: string
          call_type: string | null
          contact_name: string
          created_at: string
          deal_id: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          phone_number: string | null
          result: string | null
        }
        Insert: {
          call_date?: string
          call_type?: string | null
          contact_name: string
          created_at?: string
          deal_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          phone_number?: string | null
          result?: string | null
        }
        Update: {
          call_date?: string
          call_type?: string | null
          contact_name?: string
          created_at?: string
          deal_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          phone_number?: string | null
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_moves: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          is_completed: boolean | null
          move_date: string
          priority: number | null
          title: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          is_completed?: boolean | null
          move_date?: string
          priority?: number | null
          title: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          is_completed?: boolean | null
          move_date?: string
          priority?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_moves_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_events: {
        Row: {
          created_at: string
          deal_id: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_files: {
        Row: {
          created_at: string
          deal_id: string
          file_type: string | null
          file_url: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          file_type?: string | null
          file_url: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_tasks: {
        Row: {
          created_at: string
          deal_id: string
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: number | null
          title: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          title: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          contacts: Json | null
          created_at: string
          currency: string | null
          description: string | null
          expected_value: number | null
          id: string
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          priority: string | null
          stage: string | null
          type: string
          updated_at: string
        }
        Insert: {
          contacts?: Json | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expected_value?: number | null
          id?: string
          name: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          stage?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          contacts?: Json | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expected_value?: number | null
          id?: string
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          stage?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          creditor_name: string
          currency: string | null
          due_date: string | null
          id: string
          is_paid: boolean | null
          monthly_payment: number | null
          notes: string | null
          pressure_level: string | null
          remaining_amount: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          creditor_name: string
          currency?: string | null
          due_date?: string | null
          id?: string
          is_paid?: boolean | null
          monthly_payment?: number | null
          notes?: string | null
          pressure_level?: string | null
          remaining_amount?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creditor_name?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          is_paid?: boolean | null
          monthly_payment?: number | null
          notes?: string | null
          pressure_level?: string | null
          remaining_amount?: number | null
          updated_at?: string
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
