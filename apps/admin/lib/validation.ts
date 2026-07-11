import { z } from "zod";

export const serviceLineSchema = z.enum([
  "net_new_development",
  "vibe_code_to_production",
  "business_process_automation",
  "acquisition_due_diligence",
  "ai_training_setup",
  "codebase_improvement",
]);

export const projectStatusSchema = z.enum([
  "lead",
  "scoping",
  "contracting",
  "active",
  "handoff",
  "closed",
  "lost",
]);

export const clientInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  legalName: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const contactInputSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  title: z.string().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const projectInputSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  serviceLine: serviceLineSchema.optional(),
  status: projectStatusSchema.optional(),
  pricingType: z.enum(["fixed", "retainer"]).optional(),
  amountTotal: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  summary: z.string().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
});

// A bare Notion URL is the only input v1 needs to link a doc — no API call,
// no secret. Accept any notion.so / notion.site host and parse the trailing
// 32-char hex page id (Notion URLs end in an id with or without dashes).
export const notionUrlSchema = z
  .string()
  .url()
  .refine((url) => /notion\.(so|site)/.test(new URL(url).hostname), {
    message: "Must be a notion.so or notion.site URL",
  });

export function parseNotionPageId(url: string): string | null {
  const match = url.match(/([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:[/?#]|$)/i);
  return match ? match[1].replace(/-/g, "") : null;
}

export const milestoneInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  amount: z.number().int().positive("Amount must be positive"),
  currency: z.string().length(3).optional(),
  dueDate: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const createInvoiceInputSchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive().default(1),
        unitAmount: z.number().int().positive(),
        milestoneId: z.string().uuid().optional(),
      }),
    )
    .min(1, "At least one line item is required"),
  daysUntilDue: z.number().int().positive().default(30),
});

export const sendContractInputSchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  contactId: z.string().uuid(),
  templateKey: z.string().min(1),
  title: z.string().min(1),
});
