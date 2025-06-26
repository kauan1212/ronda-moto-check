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
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          logo_url: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          logo_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          logo_url?: string | null
        }
        Relationships: []
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
