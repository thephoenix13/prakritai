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
      ai_chat_conversations: {
        Row: {
          created_at: string
          family_member_id: string | null
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          family_member_id?: string | null
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          family_member_id?: string | null
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_conversations_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_health_insights: {
        Row: {
          created_at: string
          document_ids: string[] | null
          family_member_id: string | null
          id: string
          insights: Json | null
          session_name: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_ids?: string[] | null
          family_member_id?: string | null
          id?: string
          insights?: Json | null
          session_name?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_ids?: string[] | null
          family_member_id?: string | null
          id?: string
          insights?: Json | null
          session_name?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_health_insights_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_health_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_connections: {
        Row: {
          connected_at: string
          id: string
          revoked_at: string | null
          revoked_by: string | null
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          connected_at?: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          user_a_id: string
          user_b_id: string
        }
        Update: {
          connected_at?: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_connections_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_connections_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_connections_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_invites: {
        Row: {
          created_at: string
          expires_at: string
          host_user_id: string
          id: string
          token: string
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          host_user_id: string
          id?: string
          token?: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          host_user_id?: string
          id?: string
          token?: string
          used?: boolean
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_invites_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_requests: {
        Row: {
          created_at: string
          id: string
          invite_id: string
          requester_user_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_id: string
          requester_user_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_id?: string
          requester_user_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_requests_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "circle_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_access_codes: {
        Row: {
          code: string
          created_at: string
          doctor_name: string | null
          expires_at: string
          id: string
          is_active: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          doctor_name?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          doctor_name?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_access_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_analysis: Json | null
          ai_processed_at: string | null
          created_at: string
          document_type: string | null
          family_member_id: string | null
          file_size_bytes: number | null
          file_url: string
          id: string
          mime_type: string | null
          thumbnail_url: string | null
          title: string
          upload_source: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_processed_at?: string | null
          created_at?: string
          document_type?: string | null
          family_member_id?: string | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          thumbnail_url?: string | null
          title: string
          upload_source?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_processed_at?: string | null
          created_at?: string
          document_type?: string | null
          family_member_id?: string | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          thumbnail_url?: string | null
          title?: string
          upload_source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_info: {
        Row: {
          allergies: Json
          conditions: string[] | null
          created_at: string
          emergency_contacts: Json
          family_member_id: string
          id: string
          public_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: Json
          conditions?: string[] | null
          created_at?: string
          emergency_contacts?: Json
          family_member_id: string
          id?: string
          public_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: Json
          conditions?: string[] | null
          created_at?: string
          emergency_contacts?: Json
          family_member_id?: string
          id?: string
          public_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_info_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: true
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          height_cm: number | null
          id: string
          is_active: boolean
          name: string
          profile_photo_url: string | null
          relationship: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          name: string
          profile_photo_url?: string | null
          relationship?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          name?: string
          profile_photo_url?: string | null
          relationship?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_scores: {
        Row: {
          breakdown: Json
          computed_at: string
          family_member_id: string
          grade: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          computed_at?: string
          family_member_id: string
          grade: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          computed_at?: string
          family_member_id?: string
          grade?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_scores_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          family_member_id: string
          id: string
          medication_id: string
          scheduled_time: string
          status: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          family_member_id: string
          id?: string
          medication_id: string
          scheduled_time: string
          status: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          family_member_id?: string
          id?: string
          medication_id?: string
          scheduled_time?: string
          status?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          family_member_id: string
          form: string | null
          frequency: string | null
          id: string
          interaction_warnings: Json | null
          is_active: boolean
          name: string
          notes: string | null
          reminder_enabled: boolean
          start_date: string
          times_of_day: string[] | null
          updated_at: string
          user_id: string
          with_food: string | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          family_member_id: string
          form?: string | null
          frequency?: string | null
          id?: string
          interaction_warnings?: Json | null
          is_active?: boolean
          name: string
          notes?: string | null
          reminder_enabled?: boolean
          start_date: string
          times_of_day?: string[] | null
          updated_at?: string
          user_id: string
          with_food?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          family_member_id?: string
          form?: string | null
          frequency?: string | null
          id?: string
          interaction_warnings?: Json | null
          is_active?: boolean
          name?: string
          notes?: string | null
          reminder_enabled?: boolean
          start_date?: string
          times_of_day?: string[] | null
          updated_at?: string
          user_id?: string
          with_food?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          expo_push_token: string | null
          id: string
          language: string
          notification_prefs: Json
          onboarding_complete: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          expo_push_token?: string | null
          id: string
          language?: string
          notification_prefs?: Json
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          expo_push_token?: string | null
          id?: string
          language?: string
          notification_prefs?: Json
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      protocol_logs: {
        Row: {
          completed_at: string
          id: string
          notes: string | null
          protocol_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          notes?: string | null
          protocol_id: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          notes?: string | null
          protocol_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_logs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          created_at: string
          duration_days: number
          family_member_id: string
          id: string
          is_active: boolean
          start_date: string
          tasks: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_days?: number
          family_member_id: string
          id?: string
          is_active?: boolean
          start_date?: string
          tasks?: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          family_member_id?: string
          id?: string
          is_active?: boolean
          start_date?: string
          tasks?: Json
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocols_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_entries: {
        Row: {
          created_at: string
          description: string | null
          entry_type: string
          family_member_id: string
          id: string
          occurred_at: string
          related_document_id: string | null
          related_medication_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_type: string
          family_member_id: string
          id?: string
          occurred_at?: string
          related_document_id?: string | null
          related_medication_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_type?: string
          family_member_id?: string
          id?: string
          occurred_at?: string
          related_document_id?: string | null
          related_medication_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_entries_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_entries_related_document_id_fkey"
            columns: ["related_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_entries_related_medication_id_fkey"
            columns: ["related_medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          messages: Json
          phone_number: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          messages?: Json
          phone_number: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          messages?: Json
          phone_number?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
A new version of Supabase CLI is available: v2.109.1 (currently installed v2.84.2)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
