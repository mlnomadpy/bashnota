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
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          updated_at: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          comment_id: string
          created_at?: string
          updated_at?: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          comment_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          vote?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          author_name: string
          author_tag: string | null
          content: Json
          created_at: string
          dislike_count: number
          id: string
          legacy_author_uid: string
          like_count: number
          nota_id: string
          parent_id: string | null
          reply_count: number
          source_created_at_raw: string | null
          source_updated_at_raw: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          author_tag?: string | null
          content: Json
          created_at?: string
          dislike_count?: number
          id: string
          legacy_author_uid: string
          like_count?: number
          nota_id: string
          parent_id?: string | null
          reply_count?: number
          source_created_at_raw?: string | null
          source_updated_at_raw?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          author_tag?: string | null
          content?: Json
          created_at?: string
          dislike_count?: number
          id?: string
          legacy_author_uid?: string
          like_count?: number
          nota_id?: string
          parent_id?: string | null
          reply_count?: number
          source_created_at_raw?: string | null
          source_updated_at_raw?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_identity_fk"
            columns: ["legacy_author_uid", "author_id"]
            isOneToOne: false
            referencedRelation: "identity_map"
            referencedColumns: ["firebase_uid", "supabase_user_id"]
          },
          {
            foreignKeyName: "comments_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_map: {
        Row: {
          firebase_uid: string
          migrated_at: string
          provider_links: Json
          source_hash: string
          supabase_user_id: string
        }
        Insert: {
          firebase_uid: string
          migrated_at?: string
          provider_links?: Json
          source_hash: string
          supabase_user_id: string
        }
        Update: {
          firebase_uid?: string
          migrated_at?: string
          provider_links?: Json
          source_hash?: string
          supabase_user_id?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          display_name: string | null
          email: string
          firebase_uid: string
          source_subscribed_at_raw: string | null
          subscribed_at: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          email: string
          firebase_uid: string
          source_subscribed_at_raw?: string | null
          subscribed_at?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          email?: string
          firebase_uid?: string
          source_subscribed_at_raw?: string | null
          subscribed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_identity_fk"
            columns: ["firebase_uid", "user_id"]
            isOneToOne: false
            referencedRelation: "identity_map"
            referencedColumns: ["firebase_uid", "supabase_user_id"]
          },
        ]
      }
      nota_view_aggregates: {
        Row: {
          bucket_key: string
          bucket_kind: string
          nota_id: string
          view_count: number
        }
        Insert: {
          bucket_key: string
          bucket_kind: string
          nota_id: string
          view_count?: number
        }
        Update: {
          bucket_key?: string
          bucket_kind?: string
          nota_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "nota_view_aggregates_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_view_aggregates_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_view_events: {
        Row: {
          id: string
          nota_id: string
          occurred_at: string
          referrer_key: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          nota_id: string
          occurred_at?: string
          referrer_key?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          nota_id?: string
          occurred_at?: string
          referrer_key?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nota_view_events_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_view_events_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_viewers: {
        Row: {
          first_viewed_at: string
          nota_id: string
          user_id: string
        }
        Insert: {
          first_viewed_at?: string
          nota_id: string
          user_id: string
        }
        Update: {
          first_viewed_at?: string
          nota_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nota_viewers_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_viewers_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_votes: {
        Row: {
          created_at: string
          nota_id: string
          updated_at: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          nota_id: string
          updated_at?: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          nota_id?: string
          updated_at?: string
          user_id?: string
          vote?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "nota_votes_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_votes_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      private_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          firebase_uid: string | null
          source_created_at_raw: string | null
          source_updated_at_raw: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          firebase_uid?: string | null
          source_created_at_raw?: string | null
          source_updated_at_raw?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          firebase_uid?: string | null
          source_created_at_raw?: string | null
          source_updated_at_raw?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_profiles_identity_fk"
            columns: ["firebase_uid", "user_id"]
            isOneToOne: false
            referencedRelation: "identity_map"
            referencedColumns: ["firebase_uid", "supabase_user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          photo_url: string
          updated_at: string
          user_id: string
          user_tag: string
        }
        Insert: {
          photo_url?: string
          updated_at?: string
          user_id: string
          user_tag: string
        }
        Update: {
          photo_url?: string
          updated_at?: string
          user_id?: string
          user_tag?: string
        }
        Relationships: []
      }
      published_nota_edges: {
        Row: {
          child_id: string
          ordinal: number
          parent_id: string
        }
        Insert: {
          child_id: string
          ordinal: number
          parent_id: string
        }
        Update: {
          child_id?: string
          ordinal?: number
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_nota_edges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_nota_edges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_nota_edges_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_nota_edges_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      published_notas: {
        Row: {
          author_id: string
          author_name: string
          clone_count: number
          comment_count: number
          content: Json | null
          content_quarantine_text: string | null
          dislike_count: number
          id: string
          is_public: boolean
          is_sub_page: boolean
          last_viewed_at: string | null
          legacy_author_uid: string
          like_count: number
          parent_id: string | null
          published_at: string
          published_nota_citations: Json
          source_published_at_raw: string | null
          source_updated_at_raw: string | null
          tags: string[]
          title: string
          unique_viewers: number
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          author_name?: string
          clone_count?: number
          comment_count?: number
          content?: Json | null
          content_quarantine_text?: string | null
          dislike_count?: number
          id: string
          is_public?: boolean
          is_sub_page?: boolean
          last_viewed_at?: string | null
          legacy_author_uid: string
          like_count?: number
          parent_id?: string | null
          published_at: string
          published_nota_citations?: Json
          source_published_at_raw?: string | null
          source_updated_at_raw?: string | null
          tags?: string[]
          title: string
          unique_viewers?: number
          updated_at: string
          view_count?: number
        }
        Update: {
          author_id?: string
          author_name?: string
          clone_count?: number
          comment_count?: number
          content?: Json | null
          content_quarantine_text?: string | null
          dislike_count?: number
          id?: string
          is_public?: boolean
          is_sub_page?: boolean
          last_viewed_at?: string | null
          legacy_author_uid?: string
          like_count?: number
          parent_id?: string | null
          published_at?: string
          published_nota_citations?: Json
          source_published_at_raw?: string | null
          source_updated_at_raw?: string | null
          tags?: string[]
          title?: string
          unique_viewers?: number
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "published_notas_identity_fk"
            columns: ["legacy_author_uid", "author_id"]
            isOneToOne: false
            referencedRelation: "identity_map"
            referencedColumns: ["firebase_uid", "supabase_user_id"]
          },
          {
            foreignKeyName: "published_notas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_notas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          created_at: string
          user_id: string
          user_tag: string
        }
        Insert: {
          created_at?: string
          user_id: string
          user_tag: string
        }
        Update: {
          created_at?: string
          user_id?: string
          user_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_profile_fk"
            columns: ["user_tag", "user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_tag", "user_id"]
          },
          {
            foreignKeyName: "user_tags_profile_fk"
            columns: ["user_tag", "user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_tag", "user_id"]
          },
          {
            foreignKeyName: "user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      public_comments: {
        Row: {
          author_name: string | null
          author_tag: string | null
          content: Json | null
          created_at: string | null
          dislike_count: number | null
          id: string | null
          like_count: number | null
          nota_id: string | null
          parent_id: string | null
          reply_count: number | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          author_tag?: string | null
          content?: Json | null
          created_at?: string | null
          dislike_count?: number | null
          id?: string | null
          like_count?: number | null
          nota_id?: string | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          author_tag?: string | null
          content?: Json | null
          created_at?: string | null
          dislike_count?: number | null
          id?: string | null
          like_count?: number | null
          nota_id?: string | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          photo_url: string | null
          updated_at: string | null
          user_id: string | null
          user_tag: string | null
        }
        Insert: {
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_tag?: string | null
        }
        Update: {
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_tag?: string | null
        }
        Relationships: []
      }
      public_published_notas: {
        Row: {
          author_name: string | null
          clone_count: number | null
          comment_count: number | null
          content: Json | null
          dislike_count: number | null
          id: string | null
          is_sub_page: boolean | null
          last_viewed_at: string | null
          like_count: number | null
          parent_id: string | null
          published_at: string | null
          published_nota_citations: Json | null
          tags: string[] | null
          title: string | null
          unique_viewers: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          clone_count?: number | null
          comment_count?: number | null
          content?: Json | null
          dislike_count?: number | null
          id?: string | null
          is_sub_page?: boolean | null
          last_viewed_at?: string | null
          like_count?: number | null
          parent_id?: string | null
          published_at?: string | null
          published_nota_citations?: Json | null
          tags?: string[] | null
          title?: string | null
          unique_viewers?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          clone_count?: number | null
          comment_count?: number | null
          content?: Json | null
          dislike_count?: number | null
          id?: string | null
          is_sub_page?: boolean | null
          last_viewed_at?: string | null
          like_count?: number | null
          parent_id?: string | null
          published_at?: string | null
          published_nota_citations?: Json | null
          tags?: string[] | null
          title?: string | null
          unique_viewers?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "published_notas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_published_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_notas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "published_notas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_user_owns_published_nota: {
        Args: { p_nota_id: string }
        Returns: boolean
      }
      provision_user_profile: {
        Args: {
          p_display_name?: string
          p_photo_url?: string
          p_user_tag: string
        }
        Returns: {
          photo_url: string
          updated_at: string
          user_id: string
          user_tag: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_nota_clone: { Args: { p_nota_id: string }; Returns: number }
      record_nota_view: {
        Args: { p_nota_id: string; p_referrer_key?: string }
        Returns: {
          unique_viewers: number
          view_count: number
        }[]
      }
      rename_user_tag: {
        Args: { p_photo_url?: string; p_user_tag: string }
        Returns: {
          photo_url: string
          updated_at: string
          user_id: string
          user_tag: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      vote_type: "like" | "dislike"
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
      vote_type: ["like", "dislike"],
    },
  },
} as const
