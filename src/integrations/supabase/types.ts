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
      auto_billing_plans: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string
          end_date: string
          frequency: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description: string
          end_date: string
          frequency: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string
          end_date?: string
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_billing_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      billings: {
        Row: {
          amount: number
          auto_billing_plan_id: string | null
          client_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          interest: number | null
          payment_date: string | null
          penalty: number | null
          recurring_plan_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          auto_billing_plan_id?: string | null
          client_id: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          interest?: number | null
          payment_date?: string | null
          penalty?: number | null
          recurring_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_billing_plan_id?: string | null
          client_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          interest?: number | null
          payment_date?: string | null
          penalty?: number | null
          recurring_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billings_auto_billing_plan_id_fkey"
            columns: ["auto_billing_plan_id"]
            isOneToOne: false
            referencedRelation: "auto_billing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billings_recurring_plan_id_fkey"
            columns: ["recurring_plan_id"]
            isOneToOne: false
            referencedRelation: "recurring_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_photos: {
        Row: {
          checklist_id: string
          created_at: string | null
          id: string
          photo_name: string | null
          photo_url: string
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          id?: string
          photo_name?: string | null
          photo_url: string
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          id?: string
          photo_name?: string | null
          photo_url?: string
        }
        Relationships: []
      }
      checklists: {
        Row: {
          brakes_observation: string | null
          brakes_status: string | null
          cleaning_observation: string | null
          cleaning_status: string | null
          completed_at: string | null
          coolant_observation: string | null
          coolant_status: string | null
          created_at: string | null
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
          motorcycle_id: string | null
          motorcycle_km: string | null
          motorcycle_photos: string[] | null
          motorcycle_plate: string
          signature: string | null
          status: string | null
          suspension_observation: string | null
          suspension_status: string | null
          tires_observation: string | null
          tires_status: string | null
          type: string
          vigilante_id: string | null
          vigilante_name: string
        }
        Insert: {
          brakes_observation?: string | null
          brakes_status?: string | null
          cleaning_observation?: string | null
          cleaning_status?: string | null
          completed_at?: string | null
          coolant_observation?: string | null
          coolant_status?: string | null
          created_at?: string | null
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
          motorcycle_id?: string | null
          motorcycle_km?: string | null
          motorcycle_photos?: string[] | null
          motorcycle_plate: string
          signature?: string | null
          status?: string | null
          suspension_observation?: string | null
          suspension_status?: string | null
          tires_observation?: string | null
          tires_status?: string | null
          type: string
          vigilante_id?: string | null
          vigilante_name: string
        }
        Update: {
          brakes_observation?: string | null
          brakes_status?: string | null
          cleaning_observation?: string | null
          cleaning_status?: string | null
          completed_at?: string | null
          coolant_observation?: string | null
          coolant_status?: string | null
          created_at?: string | null
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
          motorcycle_id?: string | null
          motorcycle_km?: string | null
          motorcycle_photos?: string[] | null
          motorcycle_plate?: string
          signature?: string | null
          status?: string | null
          suspension_observation?: string | null
          suspension_status?: string | null
          tires_observation?: string | null
          tires_status?: string | null
          type?: string
          vigilante_id?: string | null
          vigilante_name?: string
        }
        Relationships: [
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
      client_access_tokens: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string
          id?: string
          token: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cpf_cnpj: string | null
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
          cpf_cnpj?: string | null
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
          cpf_cnpj?: string | null
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
      matches: {
        Row: {
          created_at: string
          id: string
          is_mutual: boolean | null
          user1_id: string
          user1_liked: boolean | null
          user2_id: string
          user2_liked: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          user1_id: string
          user1_liked?: boolean | null
          user2_id: string
          user2_liked?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          user1_id?: string
          user1_liked?: boolean | null
          user2_id?: string
          user2_liked?: boolean | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      motorcycles: {
        Row: {
          brand: string
          color: string
          created_at: string | null
          id: string
          model: string
          plate: string
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          brand: string
          color: string
          created_at?: string | null
          id?: string
          model: string
          plate: string
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          brand?: string
          color?: string
          created_at?: string | null
          id?: string
          model?: string
          plate?: string
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      personal_trainers: {
        Row: {
          available_hours: string[] | null
          average_rating: number | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          experience_years: number | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          profile_photos: string[] | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_hours?: string[] | null
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          profile_photos?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_hours?: string[] | null
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          profile_photos?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          pix_key: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          pix_key?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          pix_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_plans: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string
          frequency: string
          id: string
          interest: number | null
          is_active: boolean
          name: string
          next_billing_date: string
          penalty: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description: string
          frequency: string
          id?: string
          interest?: number | null
          is_active?: boolean
          name: string
          next_billing_date: string
          penalty?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string
          frequency?: string
          id?: string
          interest?: number | null
          is_active?: boolean
          name?: string
          next_billing_date?: string
          penalty?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      renters: {
        Row: {
          created_at: string | null
          id: string
          name: string
          rg: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          rg: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          rg?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          id: string
          liked: boolean
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked: boolean
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked?: boolean
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      trainer_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_status: string | null
          status: string | null
          total_amount: number
          trainer_id: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount: number
          trainer_id: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "personal_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_reviews: {
        Row: {
          booking_id: string
          client_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          trainer_id: string
        }
        Insert: {
          booking_id: string
          client_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          trainer_id: string
        }
        Update: {
          booking_id?: string
          client_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "trainer_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "personal_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          audio_intro_url: string | null
          available_hours: string[] | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          extra_photos_urls: string[] | null
          full_name: string
          id: string
          instagram_url: string | null
          intention: string | null
          is_verified: boolean | null
          main_photo_url: string | null
          neighborhood: string | null
          primary_gym: string | null
          training_goals: string[] | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          audio_intro_url?: string | null
          available_hours?: string[] | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          extra_photos_urls?: string[] | null
          full_name: string
          id?: string
          instagram_url?: string | null
          intention?: string | null
          is_verified?: boolean | null
          main_photo_url?: string | null
          neighborhood?: string | null
          primary_gym?: string | null
          training_goals?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          audio_intro_url?: string | null
          available_hours?: string[] | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          extra_photos_urls?: string[] | null
          full_name?: string
          id?: string
          instagram_url?: string | null
          intention?: string | null
          is_verified?: boolean | null
          main_photo_url?: string | null
          neighborhood?: string | null
          primary_gym?: string | null
          training_goals?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      vigilantes: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          registration: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          registration: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          registration?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string
          feedback_organizer: string | null
          feedback_partner: string | null
          gym_name: string
          id: string
          organizer_confirmed: boolean | null
          organizer_id: string
          partner_confirmed: boolean | null
          partner_id: string
          rating_organizer: number | null
          rating_partner: number | null
          status: string | null
          updated_at: string
          workout_date: string
          workout_time: string
          workout_type: string | null
        }
        Insert: {
          created_at?: string
          feedback_organizer?: string | null
          feedback_partner?: string | null
          gym_name: string
          id?: string
          organizer_confirmed?: boolean | null
          organizer_id: string
          partner_confirmed?: boolean | null
          partner_id: string
          rating_organizer?: number | null
          rating_partner?: number | null
          status?: string | null
          updated_at?: string
          workout_date: string
          workout_time: string
          workout_type?: string | null
        }
        Update: {
          created_at?: string
          feedback_organizer?: string | null
          feedback_partner?: string | null
          gym_name?: string
          id?: string
          organizer_confirmed?: boolean | null
          organizer_id?: string
          partner_confirmed?: boolean | null
          partner_id?: string
          rating_organizer?: number | null
          rating_partner?: number | null
          status?: string | null
          updated_at?: string
          workout_date?: string
          workout_time?: string
          workout_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_client_token: {
        Args: Record<PropertyKey, never>
        Returns: string
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
