export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata_json: Json | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata_json?: Json | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata_json?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_json: Json | null
          billing_email: string | null
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          notes: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          address_json?: Json | null
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name: string
          notes?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          address_json?: Json | null
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          notes?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          title: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          title?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_id: string
          created_at: string
          id: string
          project_id: string | null
          sent_at: string | null
          signed_at: string | null
          signed_pdf_path: string | null
          status: Database["public"]["Enums"]["contract_status"]
          template_key: string | null
          title: string | null
          zoho_request_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          project_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_pdf_path?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          template_key?: string | null
          title?: string | null
          zoho_request_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          project_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_pdf_path?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          template_key?: string | null
          title?: string | null
          zoho_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_payouts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          engineer_id: string
          id: string
          milestone_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          engineer_id: string
          id?: string
          milestone_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          engineer_id?: string
          id?: string
          milestone_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_payouts_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_payouts_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_payouts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_profiles: {
        Row: {
          active: boolean
          availability:
            | Database["public"]["Enums"]["engineer_availability"]
            | null
          background_note: string | null
          bio: string | null
          connect_status: Database["public"]["Enums"]["connect_status"]
          created_at: string
          display_name: string
          hourly_rate_cents: number | null
          id: string
          skills: string[]
          stripe_connect_account_id: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          active?: boolean
          availability?:
            | Database["public"]["Enums"]["engineer_availability"]
            | null
          background_note?: string | null
          bio?: string | null
          connect_status?: Database["public"]["Enums"]["connect_status"]
          created_at?: string
          display_name: string
          hourly_rate_cents?: number | null
          id?: string
          skills?: string[]
          stripe_connect_account_id?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          active?: boolean
          availability?:
            | Database["public"]["Enums"]["engineer_availability"]
            | null
          background_note?: string | null
          bio?: string | null
          connect_status?: Database["public"]["Enums"]["connect_status"]
          created_at?: string
          display_name?: string
          hourly_rate_cents?: number | null
          id?: string
          skills?: string[]
          stripe_connect_account_id?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_sources: {
        Row: {
          active: boolean
          brand: Database["public"]["Enums"]["brand"]
          config_json: Json
          created_at: string
          id: string
          key: string
          kind: string
          label: string
          last_run_at: string | null
          segment: Database["public"]["Enums"]["prospect_segment"]
        }
        Insert: {
          active?: boolean
          brand: Database["public"]["Enums"]["brand"]
          config_json: Json
          created_at?: string
          id?: string
          key: string
          kind: string
          label: string
          last_run_at?: string | null
          segment: Database["public"]["Enums"]["prospect_segment"]
        }
        Update: {
          active?: boolean
          brand?: Database["public"]["Enums"]["brand"]
          config_json?: Json
          created_at?: string
          id?: string
          key?: string
          kind?: string
          label?: string
          last_run_at?: string | null
          segment?: Database["public"]["Enums"]["prospect_segment"]
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string
          event_type: string
          external_id: string
          id: string
          payload_json: Json | null
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_type: string
          external_id: string
          id?: string
          payload_json?: Json | null
          processed_at?: string | null
          provider: string
        }
        Update: {
          created_at?: string
          event_type?: string
          external_id?: string
          id?: string
          payload_json?: Json | null
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          milestone_id: string | null
          quantity: number
          unit_amount: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          milestone_id?: string | null
          quantity?: number
          unit_amount: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          milestone_id?: string | null
          quantity?: number
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number
          client_id: string
          created_at: string
          currency: string
          due_at: string | null
          hosted_invoice_url: string | null
          id: string
          issued_at: string | null
          number: string | null
          paid_at: string | null
          pdf_url: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number
          client_id: string
          created_at?: string
          currency?: string
          due_at?: string | null
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number
          client_id?: string
          created_at?: string
          currency?: string
          due_at?: string | null
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_id: string | null
          project_id: string
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          project_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          project_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string
          received_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id: string
          received_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          received_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_brand_access: {
        Row: {
          brand: Database["public"]["Enums"]["brand"]
          profile_id: string
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand"]
          profile_id: string
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_brand_access_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["profile_role"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: Database["public"]["Enums"]["profile_role"]
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["profile_role"]
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          created_at: string
          engineer_id: string
          id: string
          offered_at: string
          project_id: string
          responded_at: string | null
          role_note: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          engineer_id: string
          id?: string
          offered_at?: string
          project_id: string
          responded_at?: string | null
          role_note?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          engineer_id?: string
          id?: string
          offered_at?: string
          project_id?: string
          responded_at?: string | null
          role_note?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount_total: number | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          engagement_type: Database["public"]["Enums"]["engagement_type"] | null
          id: string
          name: string | null
          notion_page_id: string | null
          notion_url: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"] | null
          service_line: Database["public"]["Enums"]["service_line"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          target_end_date: string | null
          updated_at: string
        }
        Insert: {
          amount_total?: number | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          name?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          service_line?: Database["public"]["Enums"]["service_line"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          target_end_date?: string | null
          updated_at?: string
        }
        Update: {
          amount_total?: number | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          name?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          service_line?: Database["public"]["Enums"]["service_line"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          target_end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_feed_items: {
        Row: {
          brand: Database["public"]["Enums"]["brand"]
          created_at: string
          external_id: string
          feed_source_id: string
          id: string
          prospect_id: string | null
          raw_json: Json | null
          segment: Database["public"]["Enums"]["prospect_segment"]
          snippet: string | null
          status: string
          title: string
          url: string | null
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand"]
          created_at?: string
          external_id: string
          feed_source_id: string
          id?: string
          prospect_id?: string | null
          raw_json?: Json | null
          segment: Database["public"]["Enums"]["prospect_segment"]
          snippet?: string | null
          status?: string
          title: string
          url?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand"]
          created_at?: string
          external_id?: string
          feed_source_id?: string
          id?: string
          prospect_id?: string | null
          raw_json?: Json | null
          segment?: Database["public"]["Enums"]["prospect_segment"]
          snippet?: string | null
          status?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_feed_items_feed_source_id_fkey"
            columns: ["feed_source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_feed_items_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          brand: Database["public"]["Enums"]["brand"]
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          last_contacted_at: string | null
          linkedin_url: string | null
          location: string | null
          name: string
          next_follow_up_on: string | null
          notes: string | null
          segment: Database["public"]["Enums"]["prospect_segment"]
          source: string | null
          status: Database["public"]["Enums"]["prospect_status"]
          title: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand"]
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name: string
          next_follow_up_on?: string | null
          notes?: string | null
          segment: Database["public"]["Enums"]["prospect_segment"]
          source?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          title?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand"]
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string
          next_follow_up_on?: string | null
          notes?: string | null
          segment?: Database["public"]["Enums"]["prospect_segment"]
          source?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          title?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          project_id: string
          visible_to_client: boolean
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          project_id: string
          visible_to_client?: boolean
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "submission_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_brand_access: {
        Args: { p_brand: Database["public"]["Enums"]["brand"] }
        Returns: boolean
      }
      is_active_staff: { Args: never; Returns: boolean }
      is_project_client: { Args: { p_project_id: string }; Returns: boolean }
      is_project_engineer: { Args: { p_project_id: string }; Returns: boolean }
      is_provisioned_internal: { Args: never; Returns: boolean }
    }
    Enums: {
      assignment_status: "offered" | "accepted" | "declined" | "completed"
      brand: "keystone" | "stackdiligence"
      connect_status: "not_started" | "onboarding" | "active" | "restricted"
      contract_status:
        | "draft"
        | "sent"
        | "viewed"
        | "signed"
        | "declined"
        | "expired"
      engagement_type: "short_term_project" | "long_term_project" | "retainer"
      engineer_availability: "full_time" | "moonlighting" | "flexible"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
      milestone_status: "pending" | "invoiced" | "paid"
      payout_status: "pending" | "paid" | "reversed" | "failed"
      pricing_type: "fixed" | "retainer"
      profile_role: "owner" | "staff" | "viewer" | "client" | "engineer"
      project_status:
        | "submitted"
        | "lead"
        | "scoping"
        | "contracting"
        | "active"
        | "handoff"
        | "closed"
        | "lost"
      prospect_segment:
        | "vibe_code_to_production"
        | "codebase_improvement"
        | "ai_training_setup"
        | "warm_network"
        | "partner_referral"
        | "referral_partner"
        | "live_deal"
        | "independent_sponsor"
      prospect_status:
        | "new"
        | "researching"
        | "contacted"
        | "replied"
        | "call_booked"
        | "engaged"
        | "not_now"
        | "dead"
      service_line:
        | "net_new_development"
        | "vibe_code_to_production"
        | "business_process_automation"
        | "ai_training_setup"
        | "codebase_improvement"
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
      assignment_status: ["offered", "accepted", "declined", "completed"],
      brand: ["keystone", "stackdiligence"],
      connect_status: ["not_started", "onboarding", "active", "restricted"],
      contract_status: [
        "draft",
        "sent",
        "viewed",
        "signed",
        "declined",
        "expired",
      ],
      engagement_type: ["short_term_project", "long_term_project", "retainer"],
      engineer_availability: ["full_time", "moonlighting", "flexible"],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
      milestone_status: ["pending", "invoiced", "paid"],
      payout_status: ["pending", "paid", "reversed", "failed"],
      pricing_type: ["fixed", "retainer"],
      profile_role: ["owner", "staff", "viewer", "client", "engineer"],
      project_status: [
        "submitted",
        "lead",
        "scoping",
        "contracting",
        "active",
        "handoff",
        "closed",
        "lost",
      ],
      prospect_segment: [
        "vibe_code_to_production",
        "codebase_improvement",
        "ai_training_setup",
        "warm_network",
        "partner_referral",
        "referral_partner",
        "live_deal",
        "independent_sponsor",
      ],
      prospect_status: [
        "new",
        "researching",
        "contacted",
        "replied",
        "call_booked",
        "engaged",
        "not_now",
        "dead",
      ],
      service_line: [
        "net_new_development",
        "vibe_code_to_production",
        "business_process_automation",
        "ai_training_setup",
        "codebase_improvement",
      ],
    },
  },
} as const

