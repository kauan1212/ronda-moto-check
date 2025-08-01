export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      checklists: {
        Row: {
          brakes_observation: string | null
          brakes_status: string | null
          cleaning_observation: string | null
          cleaning_status: string | null
          completed_at: string | null
          condominium_id: string | null
          coolant_observation: string | null
          coolant_status: string | null
          created_at: string
          damages: string | null
          electrical_observation: string | null
          electrical_status: string | null
          engine_oil_observation: string | null
          engine_oil_status: string | null
          face_photo: string | null
          fuel_level: number | null
          fuel_photos: string[] | null
          general_observations: string | null
          id: string
          km_photos: string[] | null
          leaks_observation: string | null
          leaks_status: string | null
          lights_observation: string | null
          lights_status: string | null
          motorcycle_id: string
          motorcycle_km: string | null
          motorcycle_photos: string[] | null
          motorcycle_plate: string
          signature: string | null
          status: string
          suspension_observation: string | null
          suspension_status: string | null
          tires_observation: string | null
          tires_status: string | null
          type: string
          vigilante_id: string
          vigilante_name: string
        }
        Insert: {
          brakes_observation?: string | null
          brakes_status?: string | null
          cleaning_observation?: string | null
          cleaning_status?: string | null
          completed_at?: string | null
          condominium_id?: string | null
          coolant_observation?: string | null
          coolant_status?: string | null
          created_at?: string
          damages?: string | null
          electrical_observation?: string | null
          electrical_status?: string | null
          engine_oil_observation?: string | null
          engine_oil_status?: string | null
          face_photo?: string | null
          fuel_level?: number | null
          fuel_photos?: string[] | null
          general_observations?: string | null
          id?: string
          km_photos?: string[] | null
          leaks_observation?: string | null
          leaks_status?: string | null
          lights_observation?: string | null
          lights_status?: string | null
          motorcycle_id: string
          motorcycle_km?: string | null
          motorcycle_photos?: string[] | null
          motorcycle_plate: string
          signature?: string | null
          status?: string
          suspension_observation?: string | null
          suspension_status?: string | null
          tires_observation?: string | null
          tires_status?: string | null
          type: string
          vigilante_id: string
          vigilante_name: string
        }
        Update: {
          brakes_observation?: string | null
          brakes_status?: string | null
          cleaning_observation?: string | null
          cleaning_status?: string | null
          completed_at?: string | null
          condominium_id?: string | null
          coolant_observation?: string | null
          coolant_status?: string | null
          created_at?: string
          damages?: string | null
          electrical_observation?: string | null
          electrical_status?: string | null
          engine_oil_observation?: string | null
          engine_oil_status?: string | null
          face_photo?: string | null
          fuel_level?: number | null
          fuel_photos?: string[] | null
          general_observations?: string | null
          id?: string
          km_photos?: string[] | null
          leaks_observation?: string | null
          leaks_status?: string | null
          lights_observation?: string | null
          lights_status?: string | null
          motorcycle_id?: string
          motorcycle_km?: string | null
          motorcycle_photos?: string[] | null
          motorcycle_plate?: string
          signature?: string | null
          status?: string
          suspension_observation?: string | null
          suspension_status?: string | null
          tires_observation?: string | null
          tires_status?: string | null
          type?: string
          vigilante_id?: string
          vigilante_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_vigilante_id_fkey"
            columns: ["vigilante_id"]
            isOneToOne: false
            referencedRelation: "vigilantes"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      motorcycles: {
        Row: {
          brand: string
          color: string
          condominium_id: string | null
          created_at: string
          id: string
          model: string
          plate: string
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          color: string
          condominium_id?: string | null
          created_at?: string
          id?: string
          model: string
          plate: string
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          color?: string
          condominium_id?: string | null
          created_at?: string
          id?: string
          model?: string
          plate?: string
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "motorcycles_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          request_type: string
          requested_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          request_type: string
          requested_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          request_type?: string
          requested_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status_enum"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          frozen_at: string | null
          frozen_by: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          logo_url: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          frozen_at?: string | null
          frozen_by?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean
          logo_url?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          frozen_at?: string | null
          frozen_by?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          logo_url?: string | null
        }
        Relationships: []
      }
      security_audit: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trajetos: {
        Row: {
          condominium_id: string
          id: string
          latitude: number
          longitude: number
          observacao: string | null
          ronda_id: string | null
          timestamp: string
          vigilante_id: string
        }
        Insert: {
          condominium_id: string
          id?: string
          latitude: number
          longitude: number
          observacao?: string | null
          ronda_id?: string | null
          timestamp?: string
          vigilante_id: string
        }
        Update: {
          condominium_id?: string
          id?: string
          latitude?: number
          longitude?: number
          observacao?: string | null
          ronda_id?: string | null
          timestamp?: string
          vigilante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trajetos_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trajetos_vigilante_id_fkey"
            columns: ["vigilante_id"]
            isOneToOne: false
            referencedRelation: "vigilantes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      vigilantes: {
        Row: {
          condominium_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          registration: string
          status: string
          updated_at: string
        }
        Insert: {
          condominium_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          registration: string
          status?: string
          updated_at?: string
        }
        Update: {
          condominium_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          registration?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vigilantes_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_active: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status_enum: "pending" | "active" | "frozen"
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
      account_status_enum: ["pending", "active", "frozen"],
    },
  },
} as const
