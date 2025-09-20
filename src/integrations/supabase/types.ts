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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          currency: string
          id: string
          payer_id: string | null
          payment_id: string | null
          payment_method: string | null
          processed_at: string | null
          request_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string
          currency?: string
          id?: string
          payer_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          currency?: string
          id?: string
          payer_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          facebook: string | null
          id: string
          instagram: string | null
          location: string | null
          phone: string | null
          pix_key: string | null
          role: Database["public"]["Enums"]["user_role"]
          tiktok: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          phone?: string | null
          pix_key?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          phone?: string | null
          pix_key?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      shows: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          location: string | null
          name: string
          qr_code_url: string | null
          settings: Json | null
          share_url: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["show_status"]
          updated_at: string
          username_code: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          location?: string | null
          name: string
          qr_code_url?: string | null
          settings?: Json | null
          share_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["show_status"]
          updated_at?: string
          username_code?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          location?: string | null
          name?: string
          qr_code_url?: string | null
          settings?: Json | null
          share_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["show_status"]
          updated_at?: string
          username_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_requests: {
        Row: {
          accepted_at: string | null
          created_at: string
          custom_song_artist: string | null
          custom_song_title: string | null
          id: string
          message: string | null
          played_at: string | null
          position_in_queue: number | null
          requested_at: string
          requester_id: string | null
          requester_name: string
          show_id: string
          song_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          tip_amount: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          custom_song_artist?: string | null
          custom_song_title?: string | null
          id?: string
          message?: string | null
          played_at?: string | null
          position_in_queue?: number | null
          requested_at?: string
          requester_id?: string | null
          requester_name: string
          show_id: string
          song_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tip_amount?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          custom_song_artist?: string | null
          custom_song_title?: string | null
          id?: string
          message?: string | null
          played_at?: string | null
          position_in_queue?: number | null
          requested_at?: string
          requester_id?: string | null
          requester_name?: string
          show_id?: string
          song_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tip_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string
          artist_id: string
          chords: string | null
          cover_url: string | null
          created_at: string
          deezer_id: string | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_available: boolean
          key: string | null
          lyrics: string | null
          preview_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist: string
          artist_id: string
          chords?: string | null
          cover_url?: string | null
          created_at?: string
          deezer_id?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_available?: boolean
          key?: string | null
          lyrics?: string | null
          preview_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string
          artist_id?: string
          chords?: string | null
          cover_url?: string | null
          created_at?: string
          deezer_id?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_available?: boolean
          key?: string | null
          lyrics?: string | null
          preview_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
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
      generate_show_code: {
        Args: { artist_username: string; show_name: string }
        Returns: string
      }
      update_queue_positions: {
        Args: { show_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      payment_status: "pending" | "completed" | "failed" | "refunded"
      request_status: "pending" | "accepted" | "playing" | "played" | "skipped"
      show_status: "draft" | "live" | "paused" | "ended"
      user_role: "artist" | "audience"
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
      payment_status: ["pending", "completed", "failed", "refunded"],
      request_status: ["pending", "accepted", "playing", "played", "skipped"],
      show_status: ["draft", "live", "paused", "ended"],
      user_role: ["artist", "audience"],
    },
  },
} as const
