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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      designers: {
        Row: {
          birth_date: string | null
          contact: string | null
          created_at: string | null
          hire_date: string | null
          id: string
          is_available: boolean | null
          is_part_time: boolean | null
          name: string
          notes: string | null
          part_time_hours: number | null
          remaining_vacation_days: number | null
          specialties: string[] | null
          status: string | null
          tools: string[] | null
          total_vacation_days: number | null
          updated_at: string | null
          user_id: string
          work_fields: string[] | null
        }
        Insert: {
          birth_date?: string | null
          contact?: string | null
          created_at?: string | null
          hire_date?: string | null
          id?: string
          is_available?: boolean | null
          is_part_time?: boolean | null
          name: string
          notes?: string | null
          part_time_hours?: number | null
          remaining_vacation_days?: number | null
          specialties?: string[] | null
          status?: string | null
          tools?: string[] | null
          total_vacation_days?: number | null
          updated_at?: string | null
          user_id: string
          work_fields?: string[] | null
        }
        Update: {
          birth_date?: string | null
          contact?: string | null
          created_at?: string | null
          hire_date?: string | null
          id?: string
          is_available?: boolean | null
          is_part_time?: boolean | null
          name?: string
          notes?: string | null
          part_time_hours?: number | null
          remaining_vacation_days?: number | null
          specialties?: string[] | null
          status?: string | null
          tools?: string[] | null
          total_vacation_days?: number | null
          updated_at?: string | null
          user_id?: string
          work_fields?: string[] | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          attachments: string[] | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone: string
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      matching_requests: {
        Row: {
          additional_requests: string | null
          brand_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          designer_ids: Json
          id: string
          reference_images: Json
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_requests?: string | null
          brand_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          designer_ids?: Json
          id?: string
          reference_images?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_requests?: string | null
          brand_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          designer_ids?: Json
          id?: string
          reference_images?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          quote_id: string
          sent_at: string | null
          sent_via: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          quote_id: string
          sent_at?: string | null
          sent_via?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          quote_id?: string
          sent_at?: string | null
          sent_via?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          gateway_txn_id: string | null
          id: string
          invoice_manager: string | null
          method: string | null
          paid_at: string | null
          payment_request_id: string | null
          quote_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          gateway_txn_id?: string | null
          id?: string
          invoice_manager?: string | null
          method?: string | null
          paid_at?: string | null
          payment_request_id?: string | null
          quote_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          gateway_txn_id?: string | null
          id?: string
          invoice_manager?: string | null
          method?: string | null
          paid_at?: string | null
          payment_request_id?: string | null
          quote_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_pause_requests: {
        Row: {
          created_at: string
          end_date: string
          id: string
          pause_days: number
          project_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          pause_days: number
          project_id: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          pause_days?: number
          project_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_pause_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_designer_id: string | null
          contract_count: number | null
          contract_history: Json | null
          created_at: string | null
          end_date: string
          end_date_history: Json | null
          id: string
          pause_count: number | null
          paused_days: number | null
          payment_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_designer_id?: string | null
          contract_count?: number | null
          contract_history?: Json | null
          created_at?: string | null
          end_date: string
          end_date_history?: Json | null
          id?: string
          pause_count?: number | null
          paused_days?: number | null
          payment_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_designer_id?: string | null
          contract_count?: number | null
          contract_history?: Json | null
          created_at?: string | null
          end_date?: string
          end_date_history?: Json | null
          id?: string
          pause_count?: number | null
          paused_days?: number | null
          payment_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_designer_id_fkey"
            columns: ["assigned_designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          items: Json
          lead_id: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          items: Json
          lead_id: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          items?: Json
          lead_id?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacation_requests: {
        Row: {
          created_at: string
          days_count: number
          designer_id: string
          end_date: string
          id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
          vacation_type: string
        }
        Insert: {
          created_at?: string
          days_count: number
          designer_id: string
          end_date: string
          id?: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
          vacation_type: string
        }
        Update: {
          created_at?: string
          days_count?: number
          designer_id?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          vacation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_requests_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      any_admin_exists: { Args: never; Returns: boolean }
      assign_single_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "designer" | "customer"
      lead_status:
        | "new"
        | "contacted"
        | "quoted"
        | "payment_pending"
        | "payment_completed"
        | "project_active"
        | "closed"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      project_status: "active" | "paused" | "completed" | "cancelled"
      service_type: "brand" | "web" | "allinone" | "custom"
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
      app_role: ["admin", "manager", "designer", "customer"],
      lead_status: [
        "new",
        "contacted",
        "quoted",
        "payment_pending",
        "payment_completed",
        "project_active",
        "closed",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      project_status: ["active", "paused", "completed", "cancelled"],
      service_type: ["brand", "web", "allinone", "custom"],
    },
  },
} as const
