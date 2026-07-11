// Hand-written to match apps/admin/supabase/migrations/*.sql. If the schema
// drifts, regenerate with `supabase gen types typescript --local` instead of
// hand-editing further.

export type UserRole = "owner" | "staff" | "viewer";
export type ServiceLine =
  | "net_new_development"
  | "vibe_code_to_production"
  | "business_process_automation"
  | "acquisition_due_diligence"
  | "ai_training_setup"
  | "codebase_improvement";
export type ProjectStatus =
  | "lead"
  | "scoping"
  | "contracting"
  | "active"
  | "handoff"
  | "closed"
  | "lost";
export type PricingType = "fixed" | "retainer";
export type MilestoneStatus = "pending" | "invoiced" | "paid";
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";
export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          stripe_customer_id: string | null;
          billing_email: string | null;
          address_json: Record<string, unknown> | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clients"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          email: string | null;
          title: string | null;
          phone: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contacts"]["Row"]> & {
          client_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          service_line: ServiceLine | null;
          status: ProjectStatus;
          pricing_type: PricingType;
          amount_total: number | null;
          currency: string;
          summary: string | null;
          start_date: string | null;
          target_end_date: string | null;
          notion_url: string | null;
          notion_page_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          client_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          amount: number;
          currency: string;
          due_date: string | null;
          status: MilestoneStatus;
          sort_order: number;
          invoice_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["milestones"]["Row"]> & {
          project_id: string;
          title: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Row"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          stripe_invoice_id: string | null;
          number: string | null;
          status: InvoiceStatus;
          amount_due: number;
          amount_paid: number;
          currency: string;
          issued_at: string | null;
          due_at: string | null;
          paid_at: string | null;
          hosted_invoice_url: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & { client_id: string };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_amount: number;
          amount: number;
          milestone_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]> & {
          invoice_id: string;
          description: string;
          unit_amount: number;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          stripe_payment_intent_id: string | null;
          amount: number;
          currency: string;
          status: string;
          received_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          invoice_id: string;
          amount: number;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          zoho_request_id: string | null;
          title: string;
          status: ContractStatus;
          template_key: string | null;
          sent_at: string | null;
          signed_at: string | null;
          signed_pdf_path: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contracts"]["Row"]> & {
          client_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["contracts"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          actor_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          summary: string;
          metadata_json: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_log"]["Row"]> & {
          entity_type: string;
          entity_id: string;
          action: string;
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Row"]>;
        Relationships: [];
      };
      integration_events: {
        Row: {
          id: string;
          provider: string;
          event_type: string;
          external_id: string;
          payload_json: Record<string, unknown> | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["integration_events"]["Row"]> & {
          provider: string;
          event_type: string;
          external_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["integration_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      service_line: ServiceLine;
      project_status: ProjectStatus;
      pricing_type: PricingType;
      milestone_status: MilestoneStatus;
      invoice_status: InvoiceStatus;
      contract_status: ContractStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceLineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Contract = Database["public"]["Tables"]["contracts"]["Row"];
export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
export type IntegrationEvent = Database["public"]["Tables"]["integration_events"]["Row"];
