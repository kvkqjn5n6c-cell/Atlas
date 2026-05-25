import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  vatRate: z.coerce.number().min(0).max(100)
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1)
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
