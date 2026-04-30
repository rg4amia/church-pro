Initialising login role...
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cell_meetings: {
        Row: {
          cellule_id: string
          church_id: string
          created_at: string
          date: string
          id: string
          nb_enfants: number
          nb_femmes: number
          nb_hommes: number
          nb_visiteurs: number
          notes: string | null
          theme: string
        }
        Insert: {
          cellule_id: string
          church_id: string
          created_at?: string
          date: string
          id?: string
          nb_enfants?: number
          nb_femmes?: number
          nb_hommes?: number
          nb_visiteurs?: number
          notes?: string | null
          theme: string
        }
        Update: {
          cellule_id?: string
          church_id?: string
          created_at?: string
          date?: string
          id?: string
          nb_enfants?: number
          nb_femmes?: number
          nb_hommes?: number
          nb_visiteurs?: number
          notes?: string | null
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "cell_meetings_cellule_id_fkey"
            columns: ["cellule_id"]
            isOneToOne: false
            referencedRelation: "prayer_cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_meetings_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          created_at: string
          id: string
          nom: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      department_activities: {
        Row: {
          church_id: string
          created_at: string
          date: string
          departement_id: string
          description: string
          id: string
          objectifs: string | null
          resultats: string | null
        }
        Insert: {
          church_id: string
          created_at?: string
          date: string
          departement_id: string
          description: string
          id?: string
          objectifs?: string | null
          resultats?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string
          date?: string
          departement_id?: string
          description?: string
          id?: string
          objectifs?: string | null
          resultats?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_activities_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_activities_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          id: string
          nom: string
          responsable_id: string | null
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          responsable_id?: string | null
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          responsable_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          categorie: string
          church_id: string
          cout: number | null
          created_at: string
          date_achat: string | null
          etat: Database["public"]["Enums"]["asset_state"]
          id: string
          localisation: string
          nom: string
          quantite: number
          updated_at: string
        }
        Insert: {
          categorie: string
          church_id: string
          cout?: number | null
          created_at?: string
          date_achat?: string | null
          etat?: Database["public"]["Enums"]["asset_state"]
          id?: string
          localisation: string
          nom: string
          quantite?: number
          updated_at?: string
        }
        Update: {
          categorie?: string
          church_id?: string
          cout?: number | null
          created_at?: string
          date_achat?: string | null
          etat?: Database["public"]["Enums"]["asset_state"]
          id?: string
          localisation?: string
          nom?: string
          quantite?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          bien_id: string
          church_id: string
          commentaire: string | null
          created_at: string
          destination: string | null
          id: string
          mouvement_type: Database["public"]["Enums"]["inventory_movement_type"]
          moved_at: string
          quantite: number
        }
        Insert: {
          bien_id: string
          church_id: string
          commentaire?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          mouvement_type: Database["public"]["Enums"]["inventory_movement_type"]
          moved_at?: string
          quantite: number
        }
        Update: {
          bien_id?: string
          church_id?: string
          commentaire?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          mouvement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          moved_at?: string
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      member_participations: {
        Row: {
          attended_at: string
          cellule_reunion_id: string | null
          church_id: string
          created_at: string
          culte_id: string | null
          departement_activite_id: string | null
          id: string
          member_id: string
          notes: string | null
          source_type: Database["public"]["Enums"]["attendance_source"]
        }
        Insert: {
          attended_at?: string
          cellule_reunion_id?: string | null
          church_id: string
          created_at?: string
          culte_id?: string | null
          departement_activite_id?: string | null
          id?: string
          member_id: string
          notes?: string | null
          source_type: Database["public"]["Enums"]["attendance_source"]
        }
        Update: {
          attended_at?: string
          cellule_reunion_id?: string | null
          church_id?: string
          created_at?: string
          culte_id?: string | null
          departement_activite_id?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          source_type?: Database["public"]["Enums"]["attendance_source"]
        }
        Relationships: [
          {
            foreignKeyName: "member_participations_cellule_reunion_id_fkey"
            columns: ["cellule_reunion_id"]
            isOneToOne: false
            referencedRelation: "cell_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_participations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_participations_culte_id_fkey"
            columns: ["culte_id"]
            isOneToOne: false
            referencedRelation: "worship_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_participations_departement_activite_id_fkey"
            columns: ["departement_activite_id"]
            isOneToOne: false
            referencedRelation: "department_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_participations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          adresse: string | null
          church_id: string
          created_at: string
          date_naissance: string | null
          email: string | null
          id: string
          joined_at: string | null
          nom: string
          notes: string | null
          prenom: string
          quartier: string | null
          responsable_id: string | null
          statut: Database["public"]["Enums"]["member_status"]
          telephone: string
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          church_id: string
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          nom: string
          notes?: string | null
          prenom: string
          quartier?: string | null
          responsable_id?: string | null
          statut?: Database["public"]["Enums"]["member_status"]
          telephone: string
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          church_id?: string
          created_at?: string
          date_naissance?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          nom?: string
          notes?: string | null
          prenom?: string
          quartier?: string | null
          responsable_id?: string | null
          statut?: Database["public"]["Enums"]["member_status"]
          telephone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      newcomer_followups: {
        Row: {
          bapteme: boolean
          cellule_id: string | null
          church_id: string
          created_at: string
          date_conversion: string | null
          id: string
          member_id: string
          notes: string | null
          prochain_suivi: string | null
          responsable_id: string | null
          updated_at: string
        }
        Insert: {
          bapteme?: boolean
          cellule_id?: string | null
          church_id: string
          created_at?: string
          date_conversion?: string | null
          id?: string
          member_id: string
          notes?: string | null
          prochain_suivi?: string | null
          responsable_id?: string | null
          updated_at?: string
        }
        Update: {
          bapteme?: boolean
          cellule_id?: string | null
          church_id?: string
          created_at?: string
          date_conversion?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          prochain_suivi?: string | null
          responsable_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newcomer_followups_cellule_id_fkey"
            columns: ["cellule_id"]
            isOneToOne: false
            referencedRelation: "prayer_cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newcomer_followups_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newcomer_followups_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newcomer_followups_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience_role: Database["public"]["Enums"]["user_role"] | null
          canal: Database["public"]["Enums"]["notification_channel"]
          church_id: string
          created_at: string
          id: string
          member_id: string | null
          message: string
          metadata: Json | null
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          titre: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          audience_role?: Database["public"]["Enums"]["user_role"] | null
          canal?: Database["public"]["Enums"]["notification_channel"]
          church_id: string
          created_at?: string
          id?: string
          member_id?: string | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          titre: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          audience_role?: Database["public"]["Enums"]["user_role"] | null
          canal?: Database["public"]["Enums"]["notification_channel"]
          church_id?: string
          created_at?: string
          id?: string
          member_id?: string | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          titre?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_cells: {
        Row: {
          church_id: string
          created_at: string
          heure: string
          id: string
          jour: string
          localisation: string
          nom: string
          responsable_id: string | null
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          heure: string
          id?: string
          jour: string
          localisation: string
          nom: string
          responsable_id?: string | null
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          heure?: string
          id?: string
          jour?: string
          localisation?: string
          nom?: string
          responsable_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_cells_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_cells_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          church_id: string | null
          created_at: string
          display_name: string | null
          is_active: boolean
          member_id: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          member_id?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          member_id?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sermons: {
        Row: {
          church_id: string
          created_at: string
          culte_id: string | null
          date: string
          heure: string | null
          id: string
          predicateur: string
          resume: string | null
          thumbnail_url: string | null
          titre: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          church_id: string
          created_at?: string
          culte_id?: string | null
          date: string
          heure?: string | null
          id?: string
          predicateur: string
          resume?: string | null
          thumbnail_url?: string | null
          titre: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string
          culte_id?: string | null
          date?: string
          heure?: string | null
          id?: string
          predicateur?: string
          resume?: string | null
          thumbnail_url?: string | null
          titre?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sermons_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sermons_culte_id_fkey"
            columns: ["culte_id"]
            isOneToOne: false
            referencedRelation: "worship_services"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_services: {
        Row: {
          audio_url: string | null
          church_id: string
          created_at: string
          date: string
          id: string
          nb_enfants: number
          nb_femmes: number
          nb_hommes: number
          nb_visiteurs: number
          predicateur: string
          theme: string
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          church_id: string
          created_at?: string
          date: string
          id?: string
          nb_enfants?: number
          nb_femmes?: number
          nb_hommes?: number
          nb_visiteurs?: number
          predicateur: string
          theme: string
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          church_id?: string
          created_at?: string
          date?: string
          id?: string
          nb_enfants?: number
          nb_femmes?: number
          nb_hommes?: number
          nb_visiteurs?: number
          predicateur?: string
          theme?: string
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_services_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      report_cell_activity: {
        Row: {
          cellule: string | null
          date: string | null
          nb_visiteurs: number | null
          theme: string | null
          total_participants: number | null
        }
        Relationships: []
      }
      report_member_summary: {
        Row: {
          statut: Database["public"]["Enums"]["member_status"] | null
          total: number | null
        }
        Relationships: []
      }
      report_sermon_summary: {
        Row: {
          date: string | null
          predicateur: string | null
          published: number | null
          titre: string | null
          video_url: string | null
        }
        Insert: {
          date?: string | null
          predicateur?: string | null
          published?: never
          titre?: string | null
          video_url?: string | null
        }
        Update: {
          date?: string | null
          predicateur?: string | null
          published?: never
          titre?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      report_service_summary: {
        Row: {
          date: string | null
          nb_visiteurs: number | null
          predicateur: string | null
          theme: string | null
          total_presence: number | null
          type: Database["public"]["Enums"]["service_type"] | null
        }
        Insert: {
          date?: string | null
          nb_visiteurs?: number | null
          predicateur?: string | null
          theme?: string | null
          total_presence?: never
          type?: Database["public"]["Enums"]["service_type"] | null
        }
        Update: {
          date?: string | null
          nb_visiteurs?: number | null
          predicateur?: string | null
          theme?: string | null
          total_presence?: never
          type?: Database["public"]["Enums"]["service_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_church_id: { Args: never; Returns: string }
      current_member_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      asset_state: "bon" | "panne" | "reparation"
      attendance_source: "culte" | "cellule" | "departement"
      inventory_movement_type: "entree" | "sortie" | "maintenance" | "transfert"
      member_status: "membre" | "visiteur" | "nouveau_converti"
      notification_channel: "realtime" | "email" | "sms"
      notification_type:
        | "rappel_evenement"
        | "alerte_suivi"
        | "message_interne"
        | "nouvelle_predication"
      service_type: "semaine" | "dimanche" | "ecole_du_dimanche"
      user_role: "ADMIN" | "RESPONSABLE" | "MEMBRE" | "VISITEUR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      asset_state: ["bon", "panne", "reparation"],
      attendance_source: ["culte", "cellule", "departement"],
      inventory_movement_type: ["entree", "sortie", "maintenance", "transfert"],
      member_status: ["membre", "visiteur", "nouveau_converti"],
      notification_channel: ["realtime", "email", "sms"],
      notification_type: [
        "rappel_evenement",
        "alerte_suivi",
        "message_interne",
        "nouvelle_predication",
      ],
      service_type: ["semaine", "dimanche", "ecole_du_dimanche"],
      user_role: ["ADMIN", "RESPONSABLE", "MEMBRE", "VISITEUR"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.95.4 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
